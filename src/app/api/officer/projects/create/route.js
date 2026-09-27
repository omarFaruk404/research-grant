import { getDB } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req) => {
  try {
    const formData = await req.formData();

    // 🔹 HANDLE OPTIONAL CODE
    // Convert empty string to null so SQL stores it as NULL (allowing multiple nulls)
    let code_no = formData.get("code_no");
    if (!code_no || code_no.trim() === "") {
      code_no = null;
    }

    const title = formData.get("title");
    const researcher_id = formData.get("researcher_id");
    const fiscal_year_id = formData.get("fiscal_year_id");
    
    const circular_id = formData.get("circular_id") || null; 
    const abstract = formData.get("abstract");
    const proposed_budget = formData.get("proposed_budget");
    const problem_domain = formData.get("problem_domain"); 

    const documents = formData.getAll("documents");

    // Removed code_no from validation check
    if (!title || !researcher_id || !fiscal_year_id || !proposed_budget) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDB();

    // 1️⃣ Create project
    const [result] = await db.query(
      `
      INSERT INTO project 
      (
        code_no, 
        title, 
        researcher_id, 
        fiscal_year_id, 
        circular_id, 
        abstract, 
        problem_domain, 
        proposed_budget, 
        status, 
        proposal_submission_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, CURDATE())
      `,
      [
        code_no, // Now passes NULL if empty
        title, 
        researcher_id, 
        fiscal_year_id, 
        circular_id, 
        abstract, 
        problem_domain, 
        proposed_budget
      ]
    );

    const projectId = result.insertId;

    // 2️⃣ Handle proposal documents
    let savedDocs = [];

    if (documents && documents.length > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads/projects");

      // Safe title for filename
      const safeTitle = title.substring(0, 30).replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const date = new Date().toISOString().split("T")[0];

      let index = 1;

      for (const file of documents) {
        if (!file || typeof file === "string" || file.size === 0) continue;

        const ext = file.name.split(".").pop();
        const fileName = `proposal_${projectId}_${safeTitle}_${date}_${index}.${ext}`;
        index++;

        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        savedDocs.push({
          name: file.name,
          filename: fileName,
          url: `/uploads/projects/${fileName}`,
        });
      }

      // 3️⃣ Insert into project_report
      if (savedDocs.length > 0) {
        await db.query(
          `INSERT INTO project_report (project_id, type, status, documents) VALUES (?, 'proposal', 1, ?)`,
          [projectId, JSON.stringify(savedDocs)]
        );
      }
    }

    return Response.json({
      success: true,
      message: "✅ Project created successfully",
      project_id: projectId,
    });

  } catch (err) {
    console.error("Create project error:", err);
    
    // Only throw duplicate error if code_no was actually provided
    if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('code_no')) {
      return Response.json(
        { message: "❌ Project Code already exists." },
        { status: 409 }
      );
    }

    return Response.json(
      { message: "❌ Error creating project" },
      { status: 500 }
    );
  }
})