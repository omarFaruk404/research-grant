import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req) => {
  try {
    const db = await getDB();

    const [rows] = await db.execute(`
      SELECT 
        pr.id AS report_id,
        pr.name AS report_name,
        pr.type,
        pr.status,
        pr.uploaded_at,
        pr.url,
        p.id AS project_id,
        p.title AS project_title,
        fy.year_label AS fiscal_year,
        u.name AS uploaded_by,
        rsh.id AS researcher_id,
        ru.name AS researcher_name
      FROM project_report pr
      LEFT JOIN project p ON pr.project_id = p.id
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      LEFT JOIN researcher rsh ON p.researcher_id = rsh.id
      LEFT JOIN user ru ON rsh.user_id = ru.id
      LEFT JOIN user u ON pr.uploaded_by = u.id
      WHERE pr.type = 'final_report'
      ORDER BY fy.year_label DESC, pr.uploaded_at DESC
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Error fetching reports:", err);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
)