import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import bcrypt from "bcrypt";

export const POST = withAuth(async (req) => {
  try {
    const db = await getDB();
    const { payment_id, password, currentUserId } = await req.json();

    if (!payment_id || !password || !currentUserId) {
      return NextResponse.json(
        { error: "Missing required fields (ID, Password, User ID)" },
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

    // 🗑️ 2. Delete Payment Record
    const [result] = await db.execute(
      `DELETE FROM reviewer_payment WHERE id = ?`,
      [payment_id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment record deleted successfully",
    });

  } catch (err) {
    console.error("Error deleting reviewer payment:", err);
    return NextResponse.json(
      { error: "Failed to delete payment record" },
      { status: 500 }
    );
  }
});