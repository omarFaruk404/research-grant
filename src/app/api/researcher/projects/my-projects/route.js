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
    if (decoded.role !== "researcher") {

      return NextResponse.redirect(
        new URL(`/${decoded.role}/dashboard`, req.url)
      );
    }
    const [rows] = await pool.query(
      `SELECT id, title, status FROM research_projects WHERE researcher_id = ? ORDER BY created_at DESC`,
      [decoded.id]
    );

    return NextResponse.json({ projects: rows });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
