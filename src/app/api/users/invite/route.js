import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { sendInvitationEmail } from "@/lib/mail/mail";
import crypto from "crypto";

export const POST = withAuth(async (req) => {
  try {
    const db = await getDB();
    const { name, email, role } = await req.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 1. Check if email exists
    const [existing] = await db.query("SELECT id FROM user WHERE email = ?", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "User with this email already exists." }, { status: 409 });
    }

    // 2. Generate Token
    const token = crypto.randomBytes(32).toString("hex");

    // 3. Insert User (Status 0 = Inactive/Pending)
    const [userResult] = await db.query(
      `INSERT INTO user (name, email, role, password, invite_token, status, created_at) VALUES (?, ?, ?, '', ?, 0, NOW())`,
      [name, email, role, token]
    );
    const userId = userResult.insertId;

    // 4. Create Related Profiles (Empty Shells)
    const roleInt = parseInt(role);
    
    // If Researcher (2) or Both (4)
    if (roleInt === 2 || roleInt === 4) {
      await db.query(`INSERT INTO researcher (user_id) VALUES (?)`, [userId]);
    }

    // If Reviewer (3) or Both (4)
    if (roleInt === 3 || roleInt === 4) {
      await db.query(`INSERT INTO reviewer (user_id) VALUES (?)`, [userId]);
    }

    // 5. Send Email
    let roleLabel = roleInt === 2 ? "Researcher" : roleInt === 3 ? "Reviewer" : "Researcher & Reviewer";
    
    await sendInvitationEmail({
      to: email,
      name: name,
      token: token,
      roleLabel: roleLabel
    });

    return NextResponse.json({ success: true, message: "Invitation sent" });

  } catch (error) {
    console.error("Invite Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});