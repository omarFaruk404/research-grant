import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDB();

    const [rows] = await db.query(`
      SELECT r.id AS reviewer_id, u.name, u.email
      FROM reviewer r
      JOIN user u ON r.user_id = u.id
      WHERE u.role IN (3, 4)
      ORDER BY u.name ASC
    `);
// console.log("Fetched reviewers:", rows);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Error fetching reviewers:", err);
    return NextResponse.json({ error: "Failed to fetch reviewers" }, { status: 500 });
  }
}
