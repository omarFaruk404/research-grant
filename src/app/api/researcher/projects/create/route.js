import { NextResponse } from "next/server";
import { getDB, initDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Disable body parsing to handle formData
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    await initDB();
    const pool = await getDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "researcher") {

      return NextResponse.redirect(
        new URL(`/${decoded.role}/dashboard`, req.url)
      );
    }

    const formData = await req.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const required_funds = formData.get("required_funds");
    const files = formData.getAll("files");

    // insert project
    const [result] = await pool.query(
      `INSERT INTO research_projects (researcher_id, title, description, required_funds)
       VALUES (?, ?, ?, ?)`,
      [decoded.id, title, description, required_funds]
    );

    const projectId = result.insertId;

    // save files if provided
    if (files.length > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, buffer);

        await pool.query(
          `INSERT INTO project_files (project_id, file_path, file_type) VALUES (?, ?, ?)`,
          [projectId, `/uploads/${fileName}`, file.type]
        );
      }
    }

    return NextResponse.json({ success: true, projectId });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
