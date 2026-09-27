import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const PUT = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const db = await getDB();

    const formData = await req.formData();
    const title = formData.get("title");
    const abstract = formData.get("abstract");
    const fiscal_year_id = formData.get("fiscal_year_id");
    const circular_id = formData.get("circular_id");
    const proposed_budget = formData.get("proposed_budget");
    
    // ✅ GET ALL FILES
    const proposalFiles = formData.getAll("proposal_files"); 
    
    const filesToDeleteRaw = formData.get("files_to_delete");
    const filesToDelete = filesToDeleteRaw ? JSON.parse(filesToDeleteRaw) : [];

    if (!title || !fiscal_year_id || !circular_id || !proposed_budget) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // --- 1. Fetch Existing Data ---
    const [existingReports] = await db.query(
      `SELECT id, documents FROM project_report WHERE project_id = ? AND type = 'proposal'`,
      [id]
    );

    let currentDocs = [];
    let reportId = null;
    if (existingReports.length > 0) {
        reportId = existingReports[0].id;
        try { currentDocs = JSON.parse(existingReports[0].documents || "[]"); } catch(e) {}
    }

    // --- 2. PROCESS DELETIONS ---
    if (filesToDelete.length > 0) {
        currentDocs = currentDocs.filter(doc => !filesToDelete.includes(doc.url));
        filesToDelete.forEach(fileUrl => {
            const filePath = path.join(process.cwd(), "public", fileUrl);
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) { console.error("Disk delete error:", e); }
            }
        });
    }

    // --- 3. PROCESS MULTIPLE FILE UPLOADS ---
    if (proposalFiles && proposalFiles.length > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "proposals");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      for (const file of proposalFiles) {
          // Check if it's actually a File object (not a string)
          if (typeof file === "object" && file.name) {
              const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "_").substring(0, 30);
              const ext = path.extname(file.name);
              const fileName = `proposal_${safeTitle}_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
              const filePath = path.join(uploadDir, fileName);

              const buffer = Buffer.from(await file.arrayBuffer());
              fs.writeFileSync(filePath, buffer);

              const newDoc = {
                name: file.name,
                url: `/uploads/proposals/${fileName}`,
                uploaded_at: new Date().toISOString(),
              };

              currentDocs.push(newDoc); // Append to list
          }
      }
    }

    // --- 4. UPDATE DB ---
    if (reportId) {
        await db.query(`UPDATE project_report SET documents = ?, uploaded_at = NOW() WHERE id = ?`, [JSON.stringify(currentDocs), reportId]);
    } else if (currentDocs.length > 0) {
        await db.query(`INSERT INTO project_report (project_id, type, status, documents, uploaded_by) VALUES (?, 'proposal', 1, ?, 1)`, [id, JSON.stringify(currentDocs)]);
    }

    await db.query(
      `UPDATE project SET title=?, abstract=?, fiscal_year_id=?, circular_id=?, proposed_budget=?, updated_at=NOW() WHERE id=?`,
      [title, abstract, fiscal_year_id, circular_id, proposed_budget, id]
    );

    return NextResponse.json({
      success: true,
      message: "Project updated",
      proposal_documents: currentDocs 
    });

  } catch (err) {
    console.error("Update error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
});