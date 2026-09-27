import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req, { params }) => {
  try {
    const db = await getDB();
    const reviewId = params.id;

    /** Review + Project */
    const [[row]] = await db.query(
      `
      SELECT
        pr.id AS project_review_id,
        pr.status AS review_status,
        pr.total_marks,
        pr.marks_breakdown, 
        pr.review_comments,
        pr.submitted_at,

        p.id AS project_id,
        p.title,
        p.status AS project_status,
        p.allocated_budget,
        p.abstract,

        fy.year_label AS fiscal_year
      FROM project_review pr
      INNER JOIN project p ON pr.project_id = p.id
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      WHERE pr.id = ? AND pr.review_type = 2
      `,
      [reviewId]
    );

    if (!row) {
      return NextResponse.json(
        { error: "Final report review not found" },
        { status: 404 }
      );
    }

    /** Final report documents */
    const [[reportRow]] = await db.query(
      `
      SELECT documents
      FROM project_report
      WHERE project_id = ? AND type = 'final_report'
      ORDER BY uploaded_at DESC
      LIMIT 1
      `,
      [row.project_id]
    );

    return NextResponse.json({
      report: {
        ...row,
        documents: reportRow
          ? JSON.parse(reportRow.documents || "[]")
          : [],
      },
    });
  } catch (err) {
    console.error("Final report reviewer error:", err);
    return NextResponse.json(
      { error: "Failed to load final report review" },
      { status: 500 }
    );
  }
})