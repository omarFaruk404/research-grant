// app/api/researcher/projects/[id]/submit-final-report/route.js

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { withAuth } from "@/lib/auth";
import fs from "fs";

export const POST = withAuth(async (req, { params }) => {
  try {
    // 1. Await params (Next.js 15 requirement)
    const { id: projectId } = await params;
    
    // 2. Parse Form Data
    const formData = await req.formData();
    const uploadedBy = formData.get("uploaded_by");

    if (!uploadedBy) {
      return NextResponse.json(
        { success: false, error: "uploaded_by is required" },
        { status: 400 }
      );
    }

    // 3. Extract Files (Handle multiple or single)
    let files = formData.getAll("documents");
    // Fallback logic
    if (!files || files.length === 0) {
      const singleFile = formData.get("file") || formData.get("finalReportFile");
      if (singleFile && typeof singleFile !== "string") {
        files = [singleFile];
      }
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one document is required" },
        { status: 400 }
      );
    }

    const db = await getDB();

    // 4. CHECK FOR EXISTING REPORT
    // We look for a 'final_report' for this project to decide if we Update or Insert
    const [existingReports] = await db.query(
      `SELECT id, documents FROM project_report WHERE project_id = ? AND type = 'final_report'`,
      [projectId]
    );

    // 5. DELETE OLD FILES (If report exists)
    if (existingReports.length > 0) {
      const oldDocsString = existingReports[0].documents;
      let oldDocs = [];
      try {
        oldDocs = oldDocsString ? JSON.parse(oldDocsString) : [];
      } catch (e) {
        console.error("Error parsing old documents JSON", e);
      }

      // Loop through old files and delete them from disk
      for (const doc of oldDocs) {
        if (doc.url) {
          // Construct absolute path from the URL
          // assuming url is like "/uploads/reports/filename.pdf"
          const relativePath = doc.url.startsWith("/") ? doc.url.slice(1) : doc.url;
          const oldFilePath = path.join(process.cwd(), "public", relativePath);

          if (fs.existsSync(oldFilePath)) {
            try {
              await unlink(oldFilePath);
              console.log(`Deleted old file: ${oldFilePath}`);
            } catch (err) {
              console.error(`Failed to delete old file: ${oldFilePath}`, err);
            }
          }
        }
      }
    }

    // 6. UPLOAD NEW FILES
    const uploadDir = path.join(process.cwd(), "public", "uploads", "reports");
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    }

    const newDocuments = [];

    for (const file of files) {
      if (!file || typeof file === "string" || !file.arrayBuffer) continue;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const timeStamp = Date.now();
      const safeName = file.name.replace(/\s+/g, "_");
      const fileName = `${timeStamp}_${safeName}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      newDocuments.push({
        name: file.name, // Keep original name for display
        url: `/uploads/reports/${fileName}`, // Store public URL
        uploaded_at: new Date().toISOString(),
      });
    }

    if (newDocuments.length === 0) {
      return NextResponse.json(
        { success: false, error: "File upload failed or no valid files" },
        { status: 400 }
      );
    }

    // 7. UPDATE DATABASE (Single Row Operation)
    if (existingReports.length > 0) {
      // UPDATE existing row
      const reportId = existingReports[0].id;
      await db.query(
        `
        UPDATE project_report 
        SET 
          documents = ?, 
          uploaded_at = NOW(), 
          status = 1,  -- Reset status to "Submitted" so officers see it
          uploaded_by = ?
        WHERE id = ?
        `,
        [JSON.stringify(newDocuments), uploadedBy, reportId]
      );
    } else {
      // INSERT new row (First time submission)
      await db.query(
        `
        INSERT INTO project_report (
          project_id, status, type, documents, uploaded_by, uploaded_at
        )
        VALUES (?, 1, 'final_report', ?, ?, NOW())
        `,
        [projectId, JSON.stringify(newDocuments), uploadedBy]
      );
    }

    // 8. Update Project Status to 4 (Report Submitted)
    await db.query(`UPDATE project SET status = 4 WHERE id = ?`, [projectId]);

    return NextResponse.json({
      success: true,
      message: "Final report submitted successfully",
      documents: newDocuments, // Return the new list to frontend
    });

  } catch (err) {
    console.error("Error submitting final report:", err);
    return NextResponse.json(
      { success: false, error: "Failed to submit final report" },
      { status: 500 }
    );
  }
});