import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const PUT = withAuth(async (req, { params }) => {
  const { id } = params; // this is project_report.id

  try {
    const db = await getDB();

    // 1️⃣ Find the related project_id from project_report


    // 2️⃣ Update the project status to Completed (5)
    await db.execute(
      `UPDATE project SET status = 5 WHERE id = ?`,
      [id]
    );
    await db.execute(
      `UPDATE project_report SET status = 3 WHERE project_id = ?`,
      [id]
    );
    return NextResponse.json({
      success: true,
      message: "Project marked as completed",
      project_id: id,
    });
  } catch (err) {
    console.error("Error marking project as completed:", err);
    return NextResponse.json(
      { error: "Failed to mark project as completed" },
      { status: 500 }
    );
  }
})
