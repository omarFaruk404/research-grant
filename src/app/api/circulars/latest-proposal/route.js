import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDB();
    
    // Fetch ONLY the latest 'proposal' type circular
    const [rows] = await db.query(`
      SELECT 
        c.id, 
        c.title, 
        c.notice_code, 
        c.circular_type as type, 
        c.notice_published_date, 
        c.proposal_submission_deadline as submission_deadline, 
        c.attachment, 
        f.year_label as fiscal_year
      FROM circular c
      LEFT JOIN fiscal_year f ON c.fiscal_year_id = f.id
      WHERE c.circular_type = 'proposal'  -- ✅ FIXED: Used actual column name instead of alias
      ORDER BY c.notice_published_date DESC
      LIMIT 1
    `);

    // Return the single object or null if none exist
    return NextResponse.json({ latestProposal: rows[0] || null });
  } catch (error) {
    console.error("Error fetching latest proposal:", error);
    return NextResponse.json({ error: "Failed to fetch latest proposal" }, { status: 500 });
  }
}