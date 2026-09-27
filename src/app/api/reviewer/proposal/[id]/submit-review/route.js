import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req, { params }) => {
  try {
    const db = await getDB();
    const reviewId = params.id;

    // We only need total_marks and the combined marks_breakdown object
    const { total_marks, marks_breakdown, review_comments } = await req.json();

    // 1. Validation
    if (total_marks === undefined || total_marks === null) {
      return NextResponse.json({ error: "Total marks are required" }, { status: 400 });
    }

    // 2. Security Check (Lock Status)
    const [[reviewData]] = await db.query(
      `SELECT p.status AS project_status FROM project_review pr JOIN project p ON pr.project_id = p.id WHERE pr.id = ?`,
      [reviewId]
    );

    if (!reviewData) return NextResponse.json({ error: "Review session not found" }, { status: 404 });
    if (reviewData.project_status >= 3) return NextResponse.json({ error: "Review locked." }, { status: 403 });

    // 3. Prepare JSON
    const breakdownString = marks_breakdown ? JSON.stringify(marks_breakdown) : null;

    // 4. Update Database
    // Note: We are NOT using a separate criteria_remarks column anymore.
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
      [total_marks, breakdownString, review_comments || null, reviewId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submit review error:", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
});