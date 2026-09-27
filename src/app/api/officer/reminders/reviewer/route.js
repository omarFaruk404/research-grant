import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/mail/mail";

export const POST = withAuth(async (req) => {
  try {
    const db = await getDB();
    const { reviewer_id, project_id, review_type } = await req.json();

    // 1. Validation
    if (!reviewer_id || !project_id || !review_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Fetch Reviewer and Project Details
    // We join the 'reviewer' table with 'user' to get the email/name
    // We join 'project' to get the title
    const [rows] = await db.query(
      `
      SELECT 
        u.email, 
        u.name, 
        p.title 
      FROM reviewer r
      JOIN user u ON r.user_id = u.id
      JOIN project p ON p.id = ?
      WHERE r.id = ?
      `,
      [project_id, reviewer_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Reviewer or Project not found" }, { status: 404 });
    }

    const { email, name, title } = rows[0];

    // 3. Determine Email Template Type
    // 1 = Proposal, 2 = Final Report
    const notificationType = review_type === 2 ? "REVIEW_REPORT" : "REVIEW_PROPOSAL";

    // 4. Send Email
    if (email) {
      console.log(`Sending reminder (${notificationType}) to ${email}...`);
      await sendNotificationEmail({
        to: email,
        name: name,
        type: notificationType,
        projectTitle: title,
      });
    }

    return NextResponse.json({ success: true, message: "Reminder sent successfully" });

  } catch (error) {
    console.error("Reminder API Error:", error);
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 });
  }
});