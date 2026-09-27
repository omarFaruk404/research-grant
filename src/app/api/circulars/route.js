import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const db = await getDB();
    // Updated: Select 'circular_type' instead of 'type'
    const [rows] = await db.query(`
      SELECT circular.*, fiscal_year.year_label 
      FROM circular 
      LEFT JOIN fiscal_year ON circular.fiscal_year_id = fiscal_year.id 
      ORDER BY circular.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to fetch circulars" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const db = await getDB();
    const formData = await req.formData();

    // 1. Extract Basic Fields
    const title = formData.get("title");
    const notice_code = formData.get("notice_code") || null;
    
    // Frontend sends "type", but we will save it to "circular_type"
    const typeValue = formData.get("type"); 
    
    const fiscal_year_id = formData.get("fiscal_year_id");
    const description = formData.get("description") || null;
    const notice_published_date = formData.get("notice_published_date");

    // 2. Extract Conditional Fields
    let proposal_submission_deadline = formData.get("proposal_submission_deadline");
    
    // Check against the variable, not the column name
    if (typeValue !== "proposal" || !proposal_submission_deadline) {
      proposal_submission_deadline = null;
    }

    // 3. Handle File Upload
    const file = formData.get("attachment");
    let attachmentPath = null;

    if (file && file.name) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public", "uploads", "circular");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, buffer);
      attachmentPath = `/uploads/circular/${fileName}`;
    }

    // 4. Insert into Database
    // UPDATED: Used 'circular_type' column name
    const query = `
      INSERT INTO circular 
      (title, notice_code, circular_type, fiscal_year_id, description, notice_published_date, proposal_submission_deadline, attachment) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      title,
      notice_code,
      typeValue, // Maps to circular_type
      fiscal_year_id,
      description,
      notice_published_date,
      proposal_submission_deadline,
      attachmentPath,
    ]);

    return NextResponse.json({ message: "Circular created successfully" }, { status: 201 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to create circular" }, { status: 500 });
  }
}
export async function PUT(req) {
  try {
    const db = await getDB();
    
    // 1. Get ID from Query Params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // 2. Parse Form Data
    const formData = await req.formData();
    
    const title = formData.get("title");
    const notice_code = formData.get("notice_code") || null;
    const typeValue = formData.get("type"); // Maps to circular_type
    const fiscal_year_id = formData.get("fiscal_year_id");
    const description = formData.get("description") || null;
    const notice_published_date = formData.get("notice_published_date");

    // 3. Handle Conditional Deadline
    let proposal_submission_deadline = formData.get("proposal_submission_deadline");
    if (typeValue !== "proposal" || !proposal_submission_deadline) {
      proposal_submission_deadline = null;
    }

    // 4. Handle File Upload (Only update if a new file is provided)
    const file = formData.get("attachment");
    let attachmentSqlFragment = ""; // Default: don't touch the column
    let queryParams = [
      title, 
      notice_code, 
      typeValue, 
      fiscal_year_id, 
      description, 
      notice_published_date, 
      proposal_submission_deadline
    ];

    // If a new file is uploaded, process it
    if (file && file.name) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public", "uploads", "circular");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, buffer);
      
      // Update SQL fragment and params to include the new file path
      attachmentSqlFragment = ", attachment = ?";
      queryParams.push(`/uploads/circular/${fileName}`);
    }

    // Add the ID as the last parameter for the WHERE clause
    queryParams.push(id);

    // 5. Execute Update Query
    const query = `
      UPDATE circular 
      SET 
        title = ?, 
        notice_code = ?, 
        circular_type = ?, 
        fiscal_year_id = ?, 
        description = ?, 
        notice_published_date = ?, 
        proposal_submission_deadline = ?
        ${attachmentSqlFragment}
      WHERE id = ?
    `;

    await db.query(query, queryParams);

    return NextResponse.json({ message: "Circular updated successfully" });

  } catch (error) {
    console.error("API Update Error:", error);
    return NextResponse.json({ error: "Failed to update circular" }, { status: 500 });
  }
}