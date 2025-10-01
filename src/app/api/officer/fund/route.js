// src/app/api/officer/fund/route.js
import { getDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function POST(req) {
  try {
    const { projectId, officerId, allocatedAmount } = await req.json();
    const db = await getDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "officer") {

      return NextResponse.redirect(
        new URL(`/${decoded.role}/dashboard`, req.url)
      );
    }


    const [review] = await db.query(
      `SELECT total_score
       FROM reviews WHERE project_id = ?`,
      [projectId]
    );

    if (!review.length) {
      return Response.json({ error: "Project not reviewed yet" }, { status: 400 });
    }

    const { total_score} = review[0];

    if (total_score < 80 ) {
      return Response.json({ error: "Project not eligible for funding" }, { status: 400 });
    }

    // Allocate funds
    await db.query(
      `INSERT INTO funding_allocations (project_id, officer_id, allocated_amount)
       VALUES (?, ?, ?)`,
      [projectId, officerId, allocatedAmount]
    );

    // Update project status
    await db.query(
      `UPDATE research_projects SET status = 'funded' WHERE id = ?`,
      [projectId]
    );

    return Response.json({ message: "Funds allocated successfully" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to allocate funds" }, { status: 500 });
  }
}
