import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const PUT = withAuth(async (req, { params }) => {
  const { id } = params;

  try {
    const db = await getDB();

    // Update project status to 5 (Completed)
    await db.execute(`UPDATE project SET status = 5 WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: "Project marked as completed",
    });
  } catch (err) {
    console.error("Error marking project complete:", err);
    return NextResponse.json(
      { error: "Failed to mark project as completed" },
      { status: 500 }
    );
  }
}
)