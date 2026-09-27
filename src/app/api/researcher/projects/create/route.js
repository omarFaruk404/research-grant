import { getDB } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req) => {
  try {
    const formData = await req.formData();

    // 1. Extract Basic Fields
    const rawCodeNo = formData.get("code_no");
    const code_no = rawCodeNo && rawCodeNo.toString().trim() !== "" ? rawCodeNo.toString().trim() : null;
    
    const title = formData.get("title");
    const researcher_id = formData.get("researcher_id");
    const fiscal_year_id = formData.get("fiscal_year_id");
    const circular_id = formData.get("circular_id"); // ✅ NEW: Get Circular ID
    const proposed_budget = formData.get("proposed_budget") || "0";
    const uploaded_by = formData.get("uploaded_by") || null;

    // 2. Process Abstract & Keywords
    let abstractText = formData.get("abstract") || "";
    const keywordsRaw = formData.get("keywords"); // ✅ NEW: Get Keywords JSON

    if (keywordsRaw) {
        try {
            const keywords = JSON.parse(keywordsRaw);
            if (Array.isArray(keywords) && keywords.length > 0) {
                // Append keywords to the end of the abstract
                abstractText += `\n\nKeywords: ${keywords.join(", ")}`;
            }
        } catch (e) {
            console.error("Error parsing keywords:", e);
        }
    }

    // 3. Validation
    if (!title || !researcher_id || !fiscal_year_id || !circular_id) {
      return NextResponse.json(
        { message: "Missing required fields (Title, Year, or Circular)" },
        { status: 400 }
      );
    }

    const db = await getDB();

    // 4. Insert Project Record
    // ✅ Updated: Included 'circular_id' and mapped 'abstract' to 'abstract' column
    const [result] = await db.query(
      `INSERT INTO project 
        (code_no, title, researcher_id, fiscal_year_id, circular_id, abstract, proposed_budget, status, proposal_submission_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURDATE())`,
      [code_no, title, researcher_id, fiscal_year_id, circular_id, abstractText, proposed_budget]
    );

    const projectId = result.insertId;

    // 5. Handle Multiple Documents
    const documents = formData.getAll("documents"); // ✅ Get all files
    let fileArray = [];

    if (documents && documents.length > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "projects");
      // Ensure directory exists
      await mkdir(uploadDir, { recursive: true });

      for (const file of documents) {
        // Validation: skip if not a valid file
        if (!file || typeof file !== "object" || !file.name) continue;

        const buffer = Buffer.from(await file.arrayBuffer());
        // Clean filename to prevent issues
        const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const fileName = `${Date.now()}_${safeName}`;
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        fileArray.push({
          name: file.name, // Display name
          url: `/uploads/projects/${fileName}` // Storage URL
        });
      }
    }

    // 6. Save Proposal Report Entry
    // This creates the initial entry in project_report
    if (fileArray.length > 0) {
        await db.query(
          `INSERT INTO project_report 
            (project_id, status, submission_date, type, documents, uploaded_by)
           VALUES (?, 1, CURDATE(), 'proposal', ?, ?)`,
          [projectId, JSON.stringify(fileArray), uploaded_by]
        );
    }

    return NextResponse.json({
      message: "✅ Project proposal submitted successfully",
      project_id: projectId,
    });

  } catch (error) {
    console.error("Error creating project (researcher):", error);
    return NextResponse.json(
      {
        message: "❌ Error creating project",
        error: error.message,
      },
      { status: 500 }
    );
  }
});