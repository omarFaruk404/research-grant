// src/app/api/officer/reviewers/route.js
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
      SELECT id, name, email 
      FROM users 
      WHERE role = 'reviewer'
      AND id NOT IN (
        SELECT assigned_reviewer_id 
        FROM research_projects 
        WHERE status = 'under_review'
      )
    `);
    return Response.json(rows);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch reviewers" }, { status: 500 });
  }
}
