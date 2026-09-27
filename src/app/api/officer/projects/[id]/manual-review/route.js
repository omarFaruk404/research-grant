import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/mail/mail"; // ✅ 1. Import Mailer

export const POST = withAuth(async (req, { params }) => {

  try {
    const db = await getDB();
    const projectId = params.id;
    const body = await req.json();

    const { 
      reviewer_id, 
      total_marks, 
      review_comments, 
      review_type, 
      status, 
      marks_breakdown
    } = body;

    console.log("Received manual review submission:", { reviewer_id, projectId, total_marks, status });

    if (!reviewer_id || !total_marks || typeof status === "undefined") {
      return NextResponse.json(
        { error: "Reviewer, total marks, and status are required" },
        { status: 400 }
      );
    }

    const finalReviewType = review_type || 1; // Default to 1 (Proposal)
    const paymentType = finalReviewType === 2 ? "final_report_review" : "proposal_review";
    const breakdownString = marks_breakdown ? JSON.stringify(marks_breakdown) : null;

    // 🧩 1️⃣ Check if review exists & Upsert
    const [existingReview] = await db.query(
      `SELECT id FROM project_review WHERE project_id = ? AND review_type = ?`,
      [projectId, finalReviewType]
    );

    if (existingReview.length > 0) {
      console.log(`Updating existing review (ID: ${existingReview[0].id})`);
      await db.query(
        `UPDATE project_review 
         SET reviewer_id = ?, total_marks = ?, marks_breakdown = ?, review_comments = ?, status = 'submitted', submitted_at = NOW(), assigned_by = 1
         WHERE id = ?`,
        [reviewer_id, total_marks, breakdownString, review_comments || null, existingReview[0].id]
      );
    } else {
      console.log(`Inserting new review for Project ${projectId}`);
      await db.query(
        `INSERT INTO project_review (project_id, reviewer_id, review_type, assigned_by, submitted_at, total_marks, marks_breakdown, review_comments, status)
         VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, 'submitted')`,
        [projectId, reviewer_id, finalReviewType, 1, total_marks, breakdownString, review_comments || null]
      );
    }

    // 🧩 2️⃣ Update Project Status
    await db.query(`UPDATE project SET status = ? WHERE id = ?`, [status, projectId]);

    // 🧩 3️⃣ Create Reviewer Payment
    const [existingPayment] = await db.query(
      `SELECT id FROM reviewer_payment WHERE reviewer_id = ? AND project_id = ? AND payment_type = ?`,
      [reviewer_id, projectId, paymentType]
    );

    if (existingPayment.length === 0) {
      await db.query(
        `INSERT INTO reviewer_payment (reviewer_id, project_id, payment_type, status) VALUES (?, ?, ?, 0)`,
        [reviewer_id, projectId, paymentType]
      );
      console.log(`✅ Payment entry created for Reviewer ${reviewer_id} (${paymentType})`);
    }

    // 🧩 4️⃣ SEND EMAIL NOTIFICATION TO RESEARCHER
    // Fetch Researcher Details
    const [projectRows] = await db.query(
      `SELECT p.title, u.email, u.name 
       FROM project p
       JOIN researcher r ON p.researcher_id = r.id
       JOIN user u ON r.user_id = u.id
       WHERE p.id = ?`,
      [projectId]
    );

    if (projectRows.length > 0) {
      const { title, email, name } = projectRows[0];
      
      // Determine Notification Type
      let notificationType = null;
      
      // Status 3 = Accepted / Ongoing
      // Status 0 = Rejected (or 4 depending on your map, assumed logic below based on standard flows)
      // Status 5 = Completed (Final Report Accepted)
      
      if (finalReviewType === 1) { // Proposal Review
        if (status === 3) notificationType = "PROPOSAL_ACCEPTED";
        else if (status === 0 || status === 4) notificationType = "PROPOSAL_REJECTED";
      } else if (finalReviewType === 2) { // Final Report Review
        if (status === 5) notificationType = "REPORT_ACCEPTED"; // Completed
        else if (status === 0 || status === 4) notificationType = "REPORT_REJECTED"; // Revision Needed
      }

      if (notificationType && email) {
        console.log(`Sending ${notificationType} email to ${email}...`);
        await sendNotificationEmail({
          to: email,
          name: name,
          type: notificationType,
          projectTitle: title,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Manual review processed successfully",
    });

  } catch (err) {
    console.error("❌ Error submitting manual review:", err);
    return NextResponse.json({ error: "Failed to submit manual review" }, { status: 500 });
  }
});