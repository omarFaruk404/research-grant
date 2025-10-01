import { NextResponse } from "next/server";
import { getDB, initDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function POST(req) {
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

    const {
      projectId,
      feasibility,
      impact,
      importance,
      innovation,
      completeness,
      comments,
    } = await req.json();

    // Insert or update the review
    await pool.query(
      `INSERT INTO reviews (
         project_id, reviewer_id, feasibility_score, impact_score, importance_score, innovation_score, completeness_score, comments
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         feasibility_score = VALUES(feasibility_score),
         impact_score = VALUES(impact_score),
         importance_score = VALUES(importance_score),
         innovation_score = VALUES(innovation_score),
         completeness_score = VALUES(completeness_score),
         comments = VALUES(comments),
         updated_at = CURRENT_TIMESTAMP`,
      [
        projectId,
        decoded.id,
        feasibility,
        impact,
        importance,
        innovation,
        completeness,
        comments
      ]
    );

    // Calculate total score
    const totalScore =
      Number(feasibility) +
      Number(impact) +
      Number(importance) +
      Number(innovation) +
      Number(completeness);

    // Set project status based on score
    const newStatus = totalScore < 80 ? "not_eligible" : "reviewed";

    await pool.query(`UPDATE research_projects SET status = ? WHERE id = ?`, [
      newStatus,
      projectId,
    ]);

    return NextResponse.json({
      message: "Review submitted successfully",
      totalScore,
      status: newStatus,
    });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
