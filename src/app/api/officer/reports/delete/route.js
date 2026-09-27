import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import bcrypt from "bcrypt";

export const POST = withAuth(async (req) => {
  try {
    const db = await getDB();
    const { report_id, project_id, password, currentUserId } = await req.json();

    if (!report_id || !project_id || !password || !currentUserId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔒 1. Verify User Password
    const [userRows] = await db.execute(
      `SELECT password FROM user WHERE id = ?`, 
      [currentUserId]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const storedPassword = userRows[0].password;
    const isMatch = await bcrypt.compare(password, storedPassword);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect password. Deletion denied." },
        { status: 403 }
      );
    }

    // 🗑️ 2. Delete Associated Reviews
    // Delete reviews linked to this project where type is 2 (Final Report Review)
    // Note: We use project_id here because project_review links via project_id
    await db.execute(
      `DELETE FROM project_review WHERE project_id = ? AND review_type = 2`,
      [project_id]
    );

    // 🗑️ 3. Delete The Final Report
    const [deleteResult] = await db.execute(
      `DELETE FROM project_report WHERE id = ?`,
      [report_id]
    );

    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        { error: "Report not found or already deleted" },
        { status: 404 }
      );
    }

    // 🔄 4. Revert Project Status
    // Set project status back to 3 (Ongoing / Report Pending)
    await db.execute(
      `UPDATE project SET status = 3 WHERE id = ?`,
      [project_id]
    );

    return NextResponse.json({
      success: true,
      message: "Report deleted and project status reverted successfully",
    });

  } catch (err) {
    console.error("Error deleting report:", err);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
});