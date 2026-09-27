import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";


export const POST = async (req) => {
  try {
    const { 
      token, 
      password, 
      phone, 
      designation,
      // New Affiliation Fields
      university,
      faculty_id,
      department_id,
      department_name
    } = await req.json();

    if (!token || !password) return NextResponse.json({ error: "Missing required data" }, { status: 400 });

    const db = await getDB();

    // 1. Verify Token & Get User
    // We check status = 0 to ensure this invite hasn't been used yet
    const [users] = await db.query("SELECT id, role FROM user WHERE invite_token = ? AND status = 0", [token]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid or Expired Token" }, { status: 400 });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Update User Table (Activate Account)
    await db.query(
      `UPDATE user SET password = ?, phone = ?, invite_token = NULL, status = 1 WHERE id = ?`,
      [hashedPassword, phone, user.id]
    );

    // 3. Update Related Profiles based on inputs
    // Note: The rows were already INSERTED during the invite phase. We just UPDATE them here.
    // If a user doesn't have a row in a specific table (e.g., they are only a Reviewer), the UPDATE will simply affect 0 rows.

    // --- UPDATE RESEARCHER ---
    // Researchers are usually internal, so we map Faculty ID and Dept ID.
    await db.query(
      `UPDATE researcher 
       SET designation = ?, 
           faculty_id = ?, 
           department_id = ? 
       WHERE user_id = ?`,
      [
        designation, 
        faculty_id || null, 
        department_id || null, 
        user.id
      ]
    );

    // --- UPDATE REVIEWER ---
    // Reviewers can be internal (Dept ID) or External (University Name + Dept Name Text)
    await db.query(
      `UPDATE reviewer 
       SET designation = ?, 
           university = ?, 
           department_id = ?, 
           department = ? 
       WHERE user_id = ?`,
      [
        designation, 
        university, 
        department_id || null, // Linked ID if internal
        department_name || null, // Text string if external (or fallback)
        user.id
      ]
    );

    return NextResponse.json({ success: true, message: "Account created successfully" });

  } catch (error) {
    console.error("Invite Complete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};