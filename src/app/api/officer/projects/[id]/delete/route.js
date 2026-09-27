import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import bcrypt from "bcrypt"; // 1. Import bcrypt

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const db = await getDB();
    const { id } = params; // Project ID from URL

    const { password, currentUserId } = await req.json(); // Password from body
    console.log("project id", id);

    if (!id || !password || !currentUserId) {
      return NextResponse.json(
        { error: "Missing project ID, password, or user ID" },
        { status: 400 }
      );
    }

    // 🔒 1️⃣ VERIFY OFFICER PASSWORD
    const [userRows] = await db.execute(
      `SELECT password FROM user WHERE id = ?`, 
      [currentUserId]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const storedPassword = userRows[0].password;
    
    // ✅ 2️⃣ SECURE COMPARISON WITH BCRYPT
    const isMatch = await bcrypt.compare(password, storedPassword);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect password. Deletion denied." },
        { status: 403 }
      );
    }

    // 🗑️ 3️⃣ PERFORM CASCADING DELETE
    // We delete child records first to prevent Foreign Key constraint errors
    
    // A. Delete Reviews
    await db.execute(`DELETE FROM project_review WHERE project_id = ?`, [id]);
    
    // B. Delete Reports
    await db.execute(`DELETE FROM project_report WHERE project_id = ?`, [id]);
    
    // C. Delete Payments (If exists)
    await db.execute(`DELETE FROM reviewer_payment WHERE project_id = ?`, [id]);

    // D. Delete The Project (Parent Table)
    const [result] = await db.execute(`DELETE FROM project WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Project not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Project and related data deleted successfully" 
    });

  } catch (err) {
    console.error("❌ Delete API Error:", err);
    return NextResponse.json(
      { error: "Server error during deletion" },
      { status: 500 }
    );
  }
});