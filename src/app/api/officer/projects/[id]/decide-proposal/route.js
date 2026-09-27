import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/mail/mail";

export const POST = withAuth(async (req, { params }) => {
  try {
    const db = await getDB();
    const projectId = params.id;

    const { decision } = await req.json();
    // decision: "accept" | "reject"

    if (!["accept", "reject"].includes(decision)) {
      return NextResponse.json(
        { error: "Invalid decision" },
        { status: 400 }
      );
    }

    // 1. Fetch Project & Researcher Details for Email
    // We need the Project Title and the Researcher's Name/Email
    const [rows] = await db.query(
      `SELECT p.title, u.email, u.name 
       FROM project p
       JOIN researcher r ON p.researcher_id = r.id
       JOIN user u ON r.user_id = u.id
       WHERE p.id = ?`,
      [projectId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { title, email, name } = rows[0];

    // 2. Update Project Status
    const newStatus = decision === "accept" ? 3 : 0;

    await db.query(
      `UPDATE project SET status = ?, updated_at = NOW() WHERE id = ?`,
      [newStatus, projectId]
    );

    // 3. Send Notification Email
    // Determine type based on decision
    const emailType = decision === "accept" ? "PROPOSAL_ACCEPTED" : "PROPOSAL_REJECTED";

    if (email) {
      console.log(`Sending ${emailType} email to ${email}...`);
      await sendNotificationEmail({
        to: email,
        name: name,
        type: emailType,
        projectTitle: title,
      });
    }

    return NextResponse.json({
      success: true,
      project_status: newStatus,
      message: `Project ${decision}ed and researcher notified.`,
    });

  } catch (err) {
    console.error("Decision error:", err);
    return NextResponse.json(
      { error: "Failed to update project status" },
      { status: 500 }
    );
  }
});