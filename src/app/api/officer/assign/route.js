// src/app/api/officer/assign/route.js
import { getDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function POST(req) {
  try {
    const { projectId, reviewerId } = await req.json();
    const db = await getDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "officer") {

      return NextResponse.redirect(
        new URL(`/${decoded.role}/dashboard`, req.url)
      );
    }

    await db.query(
      `UPDATE research_projects 
       SET assigned_reviewer_id = ?, status = 'under_review' 
       WHERE id = ?`,
      [reviewerId, projectId]
    );

    return Response.json({ message: "Reviewer assigned successfully" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to assign reviewer" }, { status: 500 });
  }
}
