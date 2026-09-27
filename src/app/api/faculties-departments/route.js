import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDB();

    // Assuming you have proper `faculty` and `department` tables
    const [faculties] = await db.query(
      "SELECT id, name FROM faculty ORDER BY name"
    );
    const [departments] = await db.query(
      "SELECT id, name, faculty_id FROM department ORDER BY name"
    );

    return NextResponse.json({
      faculties,
      departments,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch faculties and departments" },
      { status: 500 }
    );
  }
}
