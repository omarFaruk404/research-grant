import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req, { params }) => {
  const { id } = params;
  const db = await getDB();

  try {
    const body = await req.json();
    const { allocated_budget } = body;

    if (!allocated_budget || isNaN(allocated_budget)) {
      return NextResponse.json(
        { error: "Invalid budget amount." },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `UPDATE project SET allocated_budget = ? WHERE id = ?`,
      [allocated_budget, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Allocated budget updated successfully.",
    });
  } catch (error) {
    console.error("Error setting allocated budget:", error);
    return NextResponse.json(
      { error: "Failed to update allocated budget." },
      { status: 500 }
    );
  }
}
)