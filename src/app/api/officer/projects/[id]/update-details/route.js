import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const PATCH = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const { title, code_no } = await req.json();

    if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const db = await getDB();

    // Update Project
    await db.query(
      `UPDATE project SET title = ?, code_no = ? WHERE id = ?`,
      [title, code_no, id]
    );

    return NextResponse.json({ success: true, message: "Project updated" });

  } catch (err) {
    console.error("Error updating project:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
});