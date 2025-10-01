import { NextResponse } from "next/server";
import { getDB, initDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(req, { params }) {
  try {
    await initDB();
    const pool = await getDB();

    // get token from cookies
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "reviewer") {

      return NextResponse.redirect(
        new URL(`/${decoded.role}/dashboard`, req.url)
      );
    }
    
    // ✅ fetch project only if assigned to this reviewer
    const [rows] = await pool.query(
      `SELECT p.*, r.name AS researcher_name
       FROM research_projects p
       JOIN users r ON p.researcher_id = r.id
       WHERE p.id = ? AND p.assigned_reviewer_id = ?`,
      [params.id, decoded.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found or not assigned" }, { status: 404 });
    }

    const project = rows[0];

    // fetch files
    const [files] = await pool.query(
      `SELECT * FROM project_files WHERE project_id = ?`,
      [params.id]
    );
    project.files = files;

    // fetch review (if already submitted)
    const [reviewRows] = await pool.query(
      `SELECT * FROM reviews WHERE project_id = ? AND reviewer_id = ?`,
      [params.id, decoded.id]
    );

    if (reviewRows.length > 0) {
      project.review = reviewRows[0];
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Reviewer project fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}
