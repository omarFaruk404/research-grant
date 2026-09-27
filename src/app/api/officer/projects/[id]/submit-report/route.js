import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { withAuth } from "@/lib/auth";  

export const POST = withAuth(async (req, { params }) => {
  try {
    const db = await getDB();
    const projectId = params.id;

    const formData = await req.formData();
    const uploadedBy = formData.get("uploaded_by");
    const file = formData.get("documents");

    // --- Validation ---
    if (!uploadedBy) {
      return NextResponse.json({ error: "uploaded_by is required" }, { status: 400 });
    }
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Final report file is required" }, { status: 400 });
    }

    // --- Check Project Existence ---
    const [projectRows] = await db.query(`SELECT title FROM project WHERE id = ?`, [projectId]);
    const project = projectRows[0];

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // --- Check for Existing Final Report ---
    const [existingReportRows] = await db.query(
      `SELECT id, status, documents FROM project_report WHERE project_id = ? AND type = 'final_report'`,
      [projectId]
    );
    const existingReport = existingReportRows[0];

    // 🔒 LOGIC CHECK: Prevent update if Under Review (2) or Accepted (3)
    if (existingReport) {
      if (existingReport.status === 2) {
        return NextResponse.json(
          { error: "Cannot re-upload: Report is currently Under Review by a reviewer." },
          { status: 403 }
        );
      }
      if (existingReport.status === 3) {
        return NextResponse.json(
          { error: "Cannot re-upload: Report has already been Accepted." },
          { status: 403 }
        );
      }
    }

    // --- File Processing ---
    const safeTitle = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    const dateStr = new Date().toISOString().split("T")[0];
    const uploadDir = path.join(process.cwd(), "public", "uploads", "projects");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate new file
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeOriginal = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "_");
    const fileName = `finalreport_${safeTitle}_${dateStr}_${Date.now()}_${safeOriginal}`;
    const filePath = path.join(uploadDir, fileName);

    // Save new file to disk
    fs.writeFileSync(filePath, buffer);

    const newDocuments = [
      {
        name: fileName,
        url: `/uploads/projects/${fileName}`,
      },
    ];

    // --- Database Operations ---

    if (existingReport) {
      // ♻️ UPDATE EXISTING ROW
      
      // 1. Try to delete the old file to save space
      try {
        const oldDocs = typeof existingReport.documents === 'string' 
          ? JSON.parse(existingReport.documents) 
          : existingReport.documents;
          
        if (Array.isArray(oldDocs) && oldDocs.length > 0) {
          const oldUrl = oldDocs[0].url;
          const oldPath = path.join(process.cwd(), "public", oldUrl);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      } catch (e) {
        console.warn("Could not delete old file:", e);
      }

      // 2. Update the row: Set new document AND reset status to 1 (Submitted)
      // This handles both "Correction" (Status 1->1) and "Resubmission after Rejection" (Status 4->1)
      await db.query(
        `UPDATE project_report 
         SET documents = ?, status = 1
         WHERE id = ?`,
        [JSON.stringify(newDocuments), existingReport.id]
      );

    } else {
      // 🆕 INSERT NEW ROW
      await db.query(
        `INSERT INTO project_report (project_id, status, type, documents, uploaded_by)
         VALUES (?, 1, 'final_report', ?, ?)`,
        [projectId, JSON.stringify(newDocuments), uploadedBy]
      );
    }

    // --- Update Parent Project Status ---
    // Ensure project is marked as "Report Submitted" (Status 4 in project table usually means report submitted)
    await db.query(
      `UPDATE project SET status = 4, updated_at = NOW() WHERE id = ?`,
      [projectId]
    );

    return NextResponse.json({
      success: true,
      documents: newDocuments,
      message: existingReport ? "Report updated successfully" : "Report uploaded successfully",
    });

  } catch (err) {
    console.error("Final report upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload final report" },
      { status: 500 }
    );
  }
});