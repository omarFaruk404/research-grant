import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/mail/mail"; // ✅ 1. Import Mailer

export const POST = withAuth(async (req, { params }) => {
  try {
    const db = await getDB();
    const body = await req.json();
    
    // ✅ params.id is Project ID (based on your context)
    const projectId = params.id;

    console.log("Review Decision on Project ID:", projectId, body);
    const { review_id, decision } = body; // decision: "accepted" | "rejected"

    if (!review_id || !decision) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // -------------------------------------------------------------
    // 📧 PREPARE EMAIL DATA
    // Fetch Project Title and Researcher Info before updating
    // -------------------------------------------------------------
    const [projectRows] = await db.query(
      `SELECT p.title, u.email, u.name 
       FROM project p
       JOIN researcher r ON p.researcher_id = r.id
       JOIN user u ON r.user_id = u.id
       WHERE p.id = ?`,
      [projectId]
    );

    if (projectRows.length === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { title, email, name } = projectRows[0];

    // 1️⃣ Update Project Report Status
    const newStatus = decision === "accepted" ? 3 : 4; 
    // Note: Ensure status '3' aligns with 'Accepted' in your workflow logic. 
    // Usually, Final Report Accepted might mean Status 5 (Completed). 
    // Adjust '3' to '5' if that is your 'Completed' status.

    await db.execute(
      `UPDATE project_report SET status = ? WHERE project_id = ?`,
      [newStatus, projectId]
    );

    // 2️⃣ Ensure Payment Record Exists
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
    // 📧 SEND NOTIFICATION EMAIL
    // -------------------------------------------------------------
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

    return NextResponse.json({ success: true, message: `Report ${decision} successfully` });

  } catch (err) {
    console.error("Decision Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});