// src/app/api/officer/projects/route.js
import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(req) {
  try {
    const db = await getDB();
    const token = req.cookies.get("token")?.value;

    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "officer") {

      return NextResponse.redirect(
        new URL(`/${decoded.role}/dashboard`, req.url)
      );
    }

const [rows] = await db.query(`
  SELECT rp.id, rp.title, rp.description, rp.status, 
         u.name AS researcher_name, rp.created_at AS submitted_at
  FROM research_projects rp
  JOIN users u ON rp.researcher_id = u.id
  ORDER BY rp.created_at DESC
`);

    return Response.json(rows);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
