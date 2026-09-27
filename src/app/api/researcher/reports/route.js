import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const researcherId = searchParams.get("researcher_id");

    if (!researcherId) {
      return NextResponse.json(
        { error: "researcher_id is required" },
        { status: 400 }
      );
    }

    const db = await getDB();

    const [rows] = await db.execute(
      `
      SELECT 
        pr.id AS report_id,
        pr.type,
        pr.status,
        pr.uploaded_at,
        pr.documents,              -- JSON column (if you need it later)
        p.id AS project_id,
        p.title AS project_title,
        fy.year_label AS fiscal_year
      FROM project_report pr
      LEFT JOIN project p ON pr.project_id = p.id
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      WHERE pr.type = 'final_report'
        AND p.researcher_id = ?
      ORDER BY fy.year_label DESC, pr.uploaded_at DESC
      `,
      [researcherId]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Error fetching researcher reports:", err);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
)