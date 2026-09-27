import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { sendNotificationEmail, sendInvitationEmail } from "@/lib/mail/mail"; // ✅ Import both mailers
import crypto from "crypto";

export const POST = withAuth(async (req, { params }) => {

  try {
    const db = await getDB();
    const projectId = params.id; // This is the Project ID from the URL
    const body = await req.json();

    const { 
        reviewer_id, 
        new_reviewer_name, 
        new_reviewer_email, 
        is_invite, 
        assigned_by, 
        due_date 
    } = body;

    // 1. Validation
    if (!due_date) {
        return NextResponse.json({ error: "Due date is required" }, { status: 400 });
    }

    let finalReviewerId = reviewer_id;
    let isNewUser = false;

    // ---------------------------------------------------------
    // 🅰️ LOGIC: DETERMINE REVIEWER (Existing OR Invite New)
    // ---------------------------------------------------------
    if (is_invite) {
        // --- INVITE NEW USER ---
        if (!new_reviewer_name || !new_reviewer_email) {
            return NextResponse.json({ error: "Name and Email required for invitation" }, { status: 400 });
        }

        // Check if email exists
        const [existing] = await db.query("SELECT id FROM user WHERE email = ?", [new_reviewer_email]);
        if (existing.length > 0) {
            return NextResponse.json({ error: "User with this email already exists. Please select from list." }, { status: 409 });
        }

        // Create User (Inactive)
        const token = crypto.randomBytes(32).toString("hex");
        const [userResult] = await db.query(
            `INSERT INTO user (name, email, role, password, invite_token, status, created_at) VALUES (?, ?, 3, '', ?, 0, NOW())`,
            [new_reviewer_name, new_reviewer_email, token] // Role 3 = Reviewer
        );
        const newUserId = userResult.insertId;

        // Create Reviewer Profile
        const [revResult] = await db.query(`INSERT INTO reviewer (user_id) VALUES (?)`, [newUserId]);
        
        finalReviewerId = revResult.insertId;
        isNewUser = true;

        // Send Invitation Email
        console.log(`Sending invitation to new reviewer: ${new_reviewer_email}`);
        await sendInvitationEmail({
            to: new_reviewer_email,
            name: new_reviewer_name,
            token: token,
            roleLabel: "Reviewer"
        });

    } else {
        // --- EXISTING USER ---
        if (!reviewer_id) {
            return NextResponse.json({ error: "Reviewer ID is required" }, { status: 400 });
        }
    }

    // ------------------------------------------------------------------
    // STEP 1: Create a NEW ROW in 'project_review' table
    // ------------------------------------------------------------------
    // review_type = 2 indicates this is a Final Report Review.
    const [insertResult] = await db.query(
      `
      INSERT INTO project_review 
      (project_id, reviewer_id, review_type, assigned_by, due_date, status)
      VALUES (?, ?, 2, ?, ?, 'assigned')
      `,
      [projectId, finalReviewerId, assigned_by || 1, due_date]
    );

    // ------------------------------------------------------------------
    // STEP 2: Update the Report Status
    // ------------------------------------------------------------------
    // We mark the 'final_report' for this specific project as "Under Review" (Status 2)
    await db.query(
      `
      UPDATE project_report 
      SET status = 2 
      WHERE project_id = ? AND type = 'final_report'
      `,
      [projectId]
    );

    // -------------------------------------------------------------
    // 📧 SEND EMAIL NOTIFICATION (Only if NOT a new user)
    // -------------------------------------------------------------
    // If it's a new user, they got the invitation email above.
    
    if (!isNewUser) {
        // A. Fetch Project Title
        const [projectRows] = await db.query("SELECT title FROM project WHERE id = ?", [projectId]);

        // B. Fetch Reviewer Details
        const [reviewerRows] = await db.query(
            `SELECT u.email, u.name 
             FROM reviewer r
             JOIN user u ON r.user_id = u.id
             WHERE r.id = ?`,
            [finalReviewerId]
        );

        if (projectRows.length > 0 && reviewerRows.length > 0) {
            const projectTitle = projectRows[0].title;
            const { email, name } = reviewerRows[0];

            if (email) {
                console.log(`Sending assignment email to reviewer: ${email}`);
                
                await sendNotificationEmail({
                    to: email,
                    name: name,
                    type: "REVIEWER_ASSIGNED", 
                    projectTitle: projectTitle
                });
            }
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: isNewUser 
            ? "Reviewer invited and assigned to final report." 
            : "Reviewer assigned to final report successfully.",
        review_id: insertResult.insertId 
    });

  } catch (err) {
    console.error("Error assigning reviewer:", err);
    return NextResponse.json(
      { error: "Failed to assign reviewer: " + err.message },
      { status: 500 }
    );
  }
});