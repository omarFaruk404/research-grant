import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/mail/mail"; // ✅ 1. Import Mailer

export const POST = withAuth(async (req, { params }) => {
  try {
    const db = await getDB();
    const body = await req.json();
    
    // ✅ params.id is Project ID
    const projectId = params.id; 

    const { 
      review_id, 
      review_comments, 
      total_marks, 
      decision, // "accepted" or "rejected"
      marks_breakdown 
    } = body;

    if (!review_id) {
      return NextResponse.json({ error: "Review ID is missing" }, { status: 400 });
    }

    // Prepare JSON string for breakdown
    const breakdownString = marks_breakdown ? JSON.stringify(marks_breakdown) : null;

    // 1️⃣ Update the Review Record (Manual Entry)
    await db.execute(
      `UPDATE project_review 
       SET review_comments = ?, 
           total_marks = ?, 
           marks_breakdown = ?, 
           status = 'submitted', 
           submitted_at = NOW(),
           assigned_by = 1 
       WHERE id = ?`,
      [
        review_comments, 
        total_marks, 
        breakdownString, 
        review_id
      ]
    );

    // 2️⃣ Update Report Status based on Officer Decision
    // 3 = Accepted (Completed), 4 = Rejected (Revision Required)
    const newStatus = decision === "accepted" ? 3 : 4;
    await db.execute(
      `UPDATE project_report SET status = ? WHERE project_id = ?`,
      [newStatus, projectId]
    );

    // 3️⃣ Ensure Payment Record Exists
    const [reviewRows] = await db.execute(
        `SELECT project_id, reviewer_id, review_type FROM project_review WHERE id = ?`,
        [review_id]
    );

    if (reviewRows.length > 0) {
        const { project_id, reviewer_id, review_type } = reviewRows[0];
        const paymentType = review_type === 2 ? "final_report_review" : "proposal_review";

        const [exists] = await db.execute(
            `SELECT id FROM reviewer_payment WHERE reviewer_id=? AND project_id=? AND payment_type=?`,
            [reviewer_id, project_id, paymentType]
        );
        
        if (exists.length === 0) {
            await db.execute(
                `INSERT INTO reviewer_payment (reviewer_id, project_id, payment_type, status) VALUES (?, ?, ?, 0)`,
                [reviewer_id, project_id, paymentType]
            );
        }
    }

    // -------------------------------------------------------------
    // 📧 SEND NOTIFICATION EMAIL TO RESEARCHER
    // -------------------------------------------------------------
    
    // A. Fetch Project & Researcher Details
    const [projectRows] = await db.query(
      `SELECT p.title, u.email, u.name 
       FROM project p
       JOIN researcher r ON p.researcher_id = r.id
       JOIN user u ON r.user_id = u.id
       WHERE p.id = ?`,
      [projectId]
    );

    // B. Send Email if details found
    if (projectRows.length > 0) {
      const { title, email, name } = projectRows[0];
      
      // Determine Notification Type
      const emailType = decision === "accepted" ? "REPORT_ACCEPTED" : "REPORT_REJECTED";

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

    return NextResponse.json({ success: true, message: `Manual review submitted. Report ${decision}.` });

  } catch (err) {
    console.error("Manual Review Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});