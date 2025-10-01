import { NextResponse } from "next/server";
import { getDB, initDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(req, { params }) {
  try {
    await initDB();
    const pool = await getDB();

    const token = req.cookies.get("token")?.value;

    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "researcher") {
      // redirect to "/<role>/dashboard"
      return NextResponse.redirect(
        new URL(`/${decoded.role}/dashboard`, req.url)
      );
    }
    const [rows] = await pool.query(
      `SELECT * FROM research_projects WHERE id = ? AND researcher_id = ?`,
      [params.id, decoded.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const project = rows[0];

    const [files] = await pool.query(
      `SELECT * FROM project_files WHERE project_id = ?`,
      [params.id]
    );
    project.files = files;

    const [reviewRows] = await pool.query(
      `SELECT * FROM reviews WHERE project_id = ?`,
      [params.id]
    );
    if (reviewRows.length > 0) {
      project.review = reviewRows[0];
    }

    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}
