import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { sendNotificationEmail, sendInvitationEmail } from "@/lib/mail/mail"; // ✅ Import both mailers
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
        is_invite, // Boolean flag
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

    // ---------------------------------------------------------
    // 🅰️ LOGIC: DETERMINE REVIEWER (Existing OR Invite New)
    // ---------------------------------------------------------
    if (is_invite) {
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
        // Validating Existing Reviewer
        if (!reviewer_id) {
            return NextResponse.json({ error: "Reviewer ID is required" }, { status: 400 });
        }
    }

    // Determine Types
    const finalReviewType = review_type || 1; // 1 = proposal, 2 = final
    const paymentType = finalReviewType === 2 ? "final_report_review" : "proposal_review";

    // ---------------------------------------------------------
    // 1️⃣ CLEANUP: Remove Old Pending Data
    // ---------------------------------------------------------
    
    // A. Remove the existing *pending* review assignment
    await db.query(
      `DELETE FROM project_review 
       WHERE project_id = ? 
         AND review_type = ?`,
      [projectId, finalReviewType]
    );

    // B. Remove the existing *pending* payment record (status 0)
    // We don't want orphan unpaid records for the old reviewer
    await db.query(
      `DELETE FROM reviewer_payment 
       WHERE project_id = ? 
         AND payment_type = ? 
         AND status = 0`,
      [projectId, paymentType]
    );

    // ---------------------------------------------------------
    // 2️⃣ INSERT: Create New Assignment & Payment
    // ---------------------------------------------------------

    // A. Insert new Reviewer Assignment
    await db.query(
      `INSERT INTO project_review 
        (project_id, reviewer_id, review_type, assigned_by, due_date, status)
       VALUES (?, ?, ?, ?, ?, 'assigned')`,
      [projectId, finalReviewerId, finalReviewType, assigned_by || 1, due_date]
    );

    // B. Create new Reviewer Payment Entry
    await db.query(
      `INSERT INTO reviewer_payment 
        (reviewer_id, project_id, payment_type, status)
       VALUES (?, ?, ?, 0)`,
      [finalReviewerId, projectId, paymentType]
    );

    // ---------------------------------------------------------
    // 3️⃣ STATUS: Ensure Project is in correct state
    // ---------------------------------------------------------
    
    // Ensure project status is still 'Under Review' (2)
    await db.query(
      `UPDATE project SET status = 2 WHERE id = ?`,
      [projectId]
    );

    // ---------------------------------------------------------
    // 📧 SEND EMAIL NOTIFICATION (Only if NOT a new user)
    // ---------------------------------------------------------
    // If new user, they got the invite email above.
    
    if (!isNewUser) {
        // A. Fetch Project Title
        const [projectRows] = await db.query("SELECT title FROM project WHERE id = ?", [projectId]);

        // B. Fetch New Reviewer User Details
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
                console.log(`Sending reassignment email to reviewer: ${email}`);
                
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
        ? "Reviewer invited and reassigned successfully." 
        : "Reviewer reassigned successfully.",
    });

  } catch (err) {
    console.error("Error reassigning reviewer:", err);
    return NextResponse.json(
      { error: "Failed to reassign reviewer: " + err.message },
      { status: 500 }
    );
  }
});