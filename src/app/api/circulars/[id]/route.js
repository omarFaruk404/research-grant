import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const db = await getDB();

    // Updated query matches your table schema ('circular') and includes the join
    const query = `
      SELECT circular.*, fiscal_year.year_label 
      FROM circular 
      LEFT JOIN fiscal_year ON circular.fiscal_year_id = fiscal_year.id 
      WHERE circular.id = ?
    `;

    const [rows] = await db.execute(query, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Circular not found" }, { status: 404 });
    }

    // Return the single object
    return NextResponse.json({ circular: rows[0] }, { status: 200 });

  } catch (error) {
    console.error("Database Error in GET /api/circulars/[id]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}