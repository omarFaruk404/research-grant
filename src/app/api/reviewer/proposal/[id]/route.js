import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req, { params }) => {


  try {
    const db = await getDB();
    const reviewId = params.id;

    /** 1️⃣ Review + Project */
    const [[row]] = await db.query(
      `
      SELECT
        pr.id AS project_review_id,
        pr.status AS review_status,
        pr.total_marks,
        pr.review_comments,
        pr.submitted_at,
        pr.marks_breakdown,
        
        p.id AS project_id,
        p.title,
        p.abstract,
        p.proposed_budget,
        p.status AS project_status, 

        fy.year_label AS fiscal_year

      FROM project_review pr
      INNER JOIN project p ON pr.project_id = p.id
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      WHERE pr.id = ? AND pr.review_type = 1
      `,
      [reviewId]
    );

    if (!row) {
      return NextResponse.json(
        { error: "Proposal review not found" },
        { status: 404 }
      );
    }

    /** 2️⃣ Proposal documents */
    const [[proposalRow]] = await db.query(
      `
      SELECT documents
      FROM project_report
      WHERE project_id = ? AND type = 'proposal'
      ORDER BY uploaded_at DESC
      LIMIT 1
      `,
      [row.project_id]
    );

    return NextResponse.json({
      proposal: {
        ...row,
        documents: proposalRow
          ? JSON.parse(proposalRow.documents || "[]")
          : [],
      },
    });
  } catch (err) {
    console.error("Reviewer proposal error:", err);
    return NextResponse.json(
      { error: "Failed to load proposal review" },
      { status: 500 }
    );
  }
})