import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req, { params }) => {
  try {
    const db = await getDB();
    const reviewId = params.id;

    // Destructure fields (marks_breakdown now contains both scores and specific remarks)
    const { total_marks, marks_breakdown, review_comments } = await req.json();

    // 1. Validation
    if (total_marks === undefined || total_marks === null) {
      return NextResponse.json(
        { error: "Total marks are required" },
        { status: 400 }
      );
    }

    // 2. Security Check: Prevent editing if Project is Completed (Status 5)
    const [[reviewData]] = await db.query(
      `
      SELECT 
        p.status AS project_status,
        pr.reviewer_id,
        pr.project_id
      FROM project_review pr
      JOIN project p ON pr.project_id = p.id
      WHERE pr.id = ?
      `,
      [reviewId]
    );

    if (!reviewData) {
      return NextResponse.json({ error: "Review session not found" }, { status: 404 });
    }

    // Lock if Project Status is 5 (Completed)
    if (reviewData.project_status === 5) {
      return NextResponse.json(
        { error: "This review is locked because the project is already marked as Completed." },
        { status: 403 }
      );
    }

    // 3. Prepare Data
    const breakdownString = marks_breakdown ? JSON.stringify(marks_breakdown) : null;

    // 4. Perform Update (Submit Review)
    await db.query(
      `
      UPDATE project_review
      SET
        total_marks = ?,
        marks_breakdown = ?, 
        review_comments = ?,
        status = 'submitted',
        submitted_at = NOW()
      WHERE id = ?
      `,
      [
        total_marks, 
        breakdownString, 
        review_comments || null, 
        reviewId
      ]
    );

    // 5. Create Reviewer Payment Entry
    const paymentType = "final_report_review";
    const { reviewer_id, project_id } = reviewData;

    if (reviewer_id && project_id) {
        const [existingPayment] = await db.query(
            `SELECT id FROM reviewer_payment WHERE reviewer_id = ? AND project_id = ? AND payment_type = ?`,
            [reviewer_id, project_id, paymentType]
        );

        if (existingPayment.length === 0) {
            await db.query(
                `INSERT INTO reviewer_payment (reviewer_id, project_id, payment_type, status) VALUES (?, ?, ?, 0)`,
                [reviewer_id, project_id, paymentType]
            );
            console.log(`✅ Payment entry created for Reviewer ${reviewer_id} (${paymentType})`);
        }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submit final report review error:", err);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
});