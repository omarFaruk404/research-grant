import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req, { params }) => {

  const { id: projectId } = params;
  const db = await getDB();

  try {
    const { searchParams } = new URL(req.url);
    const reviewerId = searchParams.get("reviewer_id");

    if (!reviewerId) {
      return NextResponse.json(
        { error: "reviewer_id is required" },
        { status: 400 }
      );
    }

    /* 1️⃣ Verify reviewer is assigned to this project */
    const [[assignment]] = await db.query(
      `
      SELECT
        pr.id AS review_id,
        pr.review_type,
        pr.status AS review_status,
        pr.submitted_at,
        p.title,
        p.code_no
      FROM project_review pr
      INNER JOIN project p ON pr.project_id = p.id
      WHERE pr.project_id = ?
        AND pr.reviewer_id = ?
      LIMIT 1
      `,
      [projectId, reviewerId]
    );

    if (!assignment) {
      return NextResponse.json(
        { error: "Access denied or review not found" },
        { status: 404 }
      );
    }

    /* 2️⃣ Fetch reviewer payments for this project */
    const [payments] = await db.query(
      `
      SELECT
        id,
        payment_type,
        amount,
        status,
        payment_date,
        created_at
      FROM reviewer_payment
      WHERE project_id = ?
        AND reviewer_id = ?
      ORDER BY created_at ASC
      `,
      [projectId, reviewerId]
    );

    /* 3️⃣ Calculate totals */
    const totalPaid = payments
      .filter((p) => p.status === 1)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const totalPending = payments
      .filter((p) => p.status === 0)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return NextResponse.json({
      success: true,
      project: {
        project_id: projectId,
        title: assignment.title,
        code_no: assignment.code_no,
        review_type: assignment.review_type,
        review_status: assignment.review_status,
        submitted_at: assignment.submitted_at,
        payments,
        totalPaid,
        totalPending,
      },
    });
  } catch (err) {
    console.error("Error fetching reviewer payment details:", err);
    return NextResponse.json(
      { error: "Failed to fetch reviewer payment details" },
      { status: 500 }
    );
  }
}
)