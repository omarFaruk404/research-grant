import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const pool = getDB();

    const [rows] = await pool.query(
      `
      SELECT 
        rp.id, 
        rp.title, 
        rp.status, 
        u.name AS researcher_name,
        rp.created_at
      FROM research_projects rp
      JOIN users u ON rp.researcher_id = u.id
      ORDER BY rp.created_at DESC
      LIMIT 5
      `
    );

    return NextResponse.json({ projects: rows });
  } catch (error) {
    console.error("❌ Error fetching recent projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent projects" },
      { status: 500 }
    );
  }
}
