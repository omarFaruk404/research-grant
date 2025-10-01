import { NextResponse } from "next/server";
import { getDB, initDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(req) {
  try {
    await initDB();
    const pool = await getDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "reviewer") {

      return NextResponse.redirect(
        new URL(`/${decoded.role}/dashboard`, req.url)
      );
    }

const [rows] = await pool.query(
  `SELECT rp.*, u.name AS researcher_name, rp.created_at AS submitted_at
   FROM research_projects rp
   JOIN users u ON rp.researcher_id = u.id
   WHERE rp.assigned_reviewer_id = ?
   ORDER BY rp.created_at DESC`,
  [decoded.id]
);


    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviewer projects" }, { status: 500 });
  }
}
