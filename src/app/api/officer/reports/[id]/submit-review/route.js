import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/mail/mail"; // ✅ 1. Import Mailer

export const POST = withAuth(async (req, { params }) => {
  try {
    const db = await getDB();
    const body = await req.json();
    const reportId = params.id; // Report ID from URL

    // 🔹 Destructure with defaults
    const { 
      review_id, 
      review_comments, 
      total_marks, 
      attachment, 
      status // Expected: "accepted" | "rejected" | undefined
    } = body;

    // 🔹 Validate Breakdown JSON
    let marksBreakdownString = null;
    if (body.marks_breakdown) {
      marksBreakdownString = typeof body.marks_breakdown === 'string' 
        ? body.marks_breakdown 
        : JSON.stringify(body.marks_breakdown);
    }

    if (!review_id) {
      return NextResponse.json({ error: "Missing review_id" }, { status: 400 });
    }

    // 🔹 1️⃣ Update the project_review entry
    await db.execute(
      `
      UPDATE project_review 
      SET review_comments = ?, 
          total_marks = ?, 
          marks_breakdown = ?, 
          attachment = ?, 
          status = 'submitted', 
          submitted_at = NOW()
      WHERE id = ?
      `,
      [
        review_comments || null, 
        total_marks || 0, 
        marksBreakdownString, 
        attachment || null, 
        review_id
      ]
    );

    // 🔹 2️⃣ Get details for Payment & Review Type
    const [reviewRows] = await db.execute(
      `SELECT project_id, reviewer_id, review_type FROM project_review WHERE id = ?`,
      [review_id]
    );

    if (reviewRows.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const { project_id, reviewer_id, review_type } = reviewRows[0];

    // 🔹 3️⃣ Update Report Status (ONLY if decision provided)
    if (status === "accepted" || status === "rejected") {
      const newReportStatus = status === "accepted" ? 3 : 4; // 3 = Accepted, 4 = Rejected
      
      await db.execute(
        `UPDATE project_report SET status = ? WHERE id = ?`,
        [newReportStatus, reportId]
      );
    }

    // 🔹 4️⃣ Create Payment Entry (if it doesn’t exist)
    const paymentType = review_type === 2 ? "final_report_review" : "proposal_review";

    const [existingPayment] = await db.execute(
      `SELECT id FROM reviewer_payment WHERE reviewer_id = ? AND project_id = ? AND payment_type = ?`,
      [reviewer_id, project_id, paymentType]
    );

    if (existingPayment.length === 0) {
      await db.execute(
        `
        INSERT INTO reviewer_payment (reviewer_id, project_id, payment_type, status)
        VALUES (?, ?, ?, 0)
        `,
        [reviewer_id, project_id, paymentType]
      );
    }

    // -------------------------------------------------------------
    // 📧 SEND NOTIFICATION EMAIL TO RESEARCHER (If Decision Made)
    // -------------------------------------------------------------
    if (status === "accepted" || status === "rejected") {
      // A. Fetch Project & Researcher Details using project_id
      const [projectRows] = await db.query(
        `SELECT p.title, u.email, u.name 
         FROM project p
         JOIN researcher r ON p.researcher_id = r.id
         JOIN user u ON r.user_id = u.id
         WHERE p.id = ?`,
        [project_id]
      );

      // B. Send Email
      if (projectRows.length > 0) {
        const { title, email, name } = projectRows[0];
        const emailType = status === "accepted" ? "REPORT_ACCEPTED" : "REPORT_REJECTED";

        if (email) {
          console.log(`Sending ${emailType} email to ${email}...`);
          await sendNotificationEmail({
            to: email,
            name: name,
            type: emailType,
            projectTitle: title,
          });
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ Error submitting review:", err);
    return NextResponse.json(
      { error: "Failed to submit review: " + err.message },
      { status: 500 }
    );
  }
});