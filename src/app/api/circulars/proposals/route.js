import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDB();
    
    // Fetch circulars ONLY from active fiscal years
    // We join the tables to check the is_active status
    const [circulars] = await db.query(`
      SELECT 
        c.id, 
        c.title, 
        c.fiscal_year_id,
        c.proposal_published_date, 
        c.proposal_submission_deadline 
      FROM circular c
      JOIN fiscal_year fy ON c.fiscal_year_id = fy.id
      WHERE c.circular_type = 'proposal' 
        AND fy.is_active = 1
      ORDER BY c.id DESC
    `);

    return NextResponse.json(circulars);
  } catch (error) {
    console.error("Error fetching proposal circulars:", error);
    return NextResponse.json(
      { error: "Failed to fetch circulars" }, 
      { status: 500 }
    );
  }
}