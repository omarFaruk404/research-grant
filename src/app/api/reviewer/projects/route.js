import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const reviewerId = searchParams.get("reviewer_id");

    if (!reviewerId) {
      return NextResponse.json(
        { error: "reviewer_id is required" },
        { status: 400 }
      );
    }

    const db = await getDB();

    const [rows] = await db.query(
      `
      SELECT
        pr.id AS project_review_id,
        pr.project_id,
        pr.review_type,
        pr.due_date,
        pr.status AS review_status,

        p.title,
        p.code_no,
        p.abstract,
        p.status AS project_status,

        fy.year_label AS fiscal_year

      FROM project_review pr
      INNER JOIN project p ON pr.project_id = p.id
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id

      WHERE pr.reviewer_id = ?
      ORDER BY pr.assigned_at DESC
      `,
      [reviewerId]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Reviewer projects error:", err);
    return NextResponse.json(
      { error: "Failed to load reviewer projects" },
      { status: 500 }
    );
  }
}
)