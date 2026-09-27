import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req, { params }) => {
  try {
    const db = await getDB();
const { id } = await params;
const [rows] = await db.execute(
      `
      SELECT 
        pr.*,
        p.title AS project_title,
        p.status AS project_status,
        fy.year_label AS fiscal_year,
        u.name AS uploaded_by_name,
        ru.name AS researcher_name
      FROM project_report pr
      LEFT JOIN project p ON pr.project_id = p.id
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      LEFT JOIN researcher rsh ON p.researcher_id = rsh.id
      LEFT JOIN user ru ON rsh.user_id = ru.id
      LEFT JOIN user u ON pr.uploaded_by = u.id
      WHERE p.id = ? AND pr.type = 'final_report'  -- 👈 ADD THIS
      `,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const report = rows[0];

    // ✅ PARSE DOCUMENTS JSON
    report.documents = report.documents
      ? JSON.parse(report.documents)
      : [];

    // 🔹 Fetch assigned reviewers (final report reviews)
    const [reviews] = await db.execute(
      `
      SELECT 
        prv.*,
        rv.id AS reviewer_id,
        uu.name AS reviewer_name
      FROM project_review prv
      LEFT JOIN reviewer rv ON prv.reviewer_id = rv.id
      LEFT JOIN user uu ON rv.user_id = uu.id
      WHERE prv.project_id = ? AND prv.review_type = 2
      `,
      [report.project_id]
    );

    return NextResponse.json({ report, reviews });
  } catch (err) {
    console.error("Error fetching report:", err);
    return NextResponse.json(
      { error: "Failed to fetch report details" },
      { status: 500 }
    );
  }
}
)