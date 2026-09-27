import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { sendNotificationEmail, sendInvitationEmail } from "@/lib/mail/mail"; 
import crypto from "crypto";

export const POST = withAuth(async (req, { params }) => {
  try {
    const db = await getDB();
    const projectId = params.id;
    const body = await req.json();

    const { 
      reviewer_id, 
      new_reviewer_name, 
      new_reviewer_email, 
      is_invite, // Boolean flag from frontend
      due_date, 
      review_type, 
      assigned_by 
    } = body;

    // 1. Validation
    if (!due_date) {
      return NextResponse.json({ error: "Due date is required" }, { status: 400 });
    }

    let finalReviewerId = reviewer_id;
    let isNewUser = false;

    // -------------------------------------------------------------
    // 🅰️ SCENARIO A: INVITE NEW EXTERNAL REVIEWER
    // -------------------------------------------------------------
    if (is_invite) {
        if (!new_reviewer_name || !new_reviewer_email) {
            return NextResponse.json({ error: "Name and Email required for invitation" }, { status: 400 });
        }

        // A1. Check if email already exists
        const [existing] = await db.query("SELECT id FROM user WHERE email = ?", [new_reviewer_email]);
        if (existing.length > 0) {
            return NextResponse.json({ error: "User with this email already exists. Please select from list." }, { status: 409 });
        }

        // A2. Create User (Status 0 = Inactive)
        const token = crypto.randomBytes(32).toString("hex");
        const [userResult] = await db.query(
            `INSERT INTO user (name, email, role, password, invite_token, status, created_at) VALUES (?, ?, 3, '', ?, 0, NOW())`,
            [new_reviewer_name, new_reviewer_email, token] // Role 3 = Reviewer
        );
        const newUserId = userResult.insertId;

        // A3. Create Reviewer Profile
        const [revResult] = await db.query(`INSERT INTO reviewer (user_id) VALUES (?)`, [newUserId]);
        
        finalReviewerId = revResult.insertId;
        isNewUser = true;

        // A4. Send Invitation Email
        // This email links to /invite page to set password
        console.log(`Sending invitation to new reviewer: ${new_reviewer_email}`);
        await sendInvitationEmail({
            to: new_reviewer_email,
            name: new_reviewer_name,
            token: token,
            roleLabel: "Reviewer"
        });
    } 
    // -------------------------------------------------------------
    // 🅱️ SCENARIO B: EXISTING REVIEWER
    // -------------------------------------------------------------
    else {
        if (!reviewer_id) {
            return NextResponse.json({ error: "Reviewer ID is required" }, { status: 400 });
        }
        // finalReviewerId is already set
    }

    // -------------------------------------------------------------
    // 2️⃣ ASSIGN PROJECT (Common Logic)
    // -------------------------------------------------------------
    
    const finalReviewType = review_type || 1; // 1 = proposal, 2 = final

    await db.query(
      `
      INSERT INTO project_review 
        (project_id, reviewer_id, review_type, assigned_by, due_date, status)
      VALUES (?, ?, ?, ?, ?, 'assigned')
      `,
      [projectId, finalReviewerId, finalReviewType, assigned_by || 1, due_date]
    );

    // 3️⃣ Update project status (Move to 'Under Review')
    await db.query(
      `UPDATE project SET status = 2 WHERE id = ? AND status = 1`,
      [projectId]
    );

    // -------------------------------------------------------------
    // 📧 SEND ASSIGNMENT NOTIFICATION (Only if NOT a new user)
    // -------------------------------------------------------------
    // If it's a new user, they got an Invite email. 
    // If it's an existing user, they get the "You have a new assignment" email.
    
    if (!isNewUser) {
        // Fetch Project Title
        const [projectRows] = await db.query("SELECT title FROM project WHERE id = ?", [projectId]);
        
        // Fetch Reviewer Details
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
                console.log(`Sending assignment notification to existing reviewer: ${email}`);
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
        ? "Reviewer invited and assigned successfully." 
        : "Reviewer assigned successfully.",
    });

  } catch (err) {
    console.error("Error assigning reviewer:", err);
    return NextResponse.json(
      { error: "Failed to assign reviewer: " + err.message },
      { status: 500 }
    );
  }
});