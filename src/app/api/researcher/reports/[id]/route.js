import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req, { params }) => {

  const { id } = params; // report_id
  const { searchParams } = new URL(req.url);
  const researcherId = searchParams.get("researcher_id");

  if (!researcherId) {
    return NextResponse.json(
      { error: "researcher_id is required" },
      { status: 400 }
    );
  }

  try {
    const db = await getDB();

    // Fetch the report, ensuring it belongs to this researcher
    const [rows] = await db.execute(
      `
      SELECT 
        pr.id AS report_id,
        pr.type,
        pr.status,
        pr.uploaded_at,
        pr.name,
        pr.url,
        pr.documents,
        pr.project_id,
        p.title AS project_title,
        fy.year_label AS fiscal_year
      FROM project_report pr
      LEFT JOIN project p ON pr.project_id = p.id
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      LEFT JOIN researcher rsh ON p.researcher_id = rsh.id
      WHERE pr.id = ?
        AND pr.type = 'final_report'
        AND rsh.id = ?
      `,
      [id, researcherId]
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const row = rows[0];

    // Build documents array (supports JSON or legacy single file)
    let documents = [];

    if (row.documents) {
      try {
        const parsed = JSON.parse(row.documents);
        if (Array.isArray(parsed)) {
          documents = parsed.map((d) => ({
            name: d.name,
            url: d.url,
            uploaded_at: row.uploaded_at,
          }));
        }
      } catch (e) {
        console.warn("Failed to parse documents JSON for report", id, e);
      }
    }

    // Fallback if no JSON documents but we have old name/url
    if (!documents.length && row.url) {
      documents.push({
        name: row.name || "Final Report",
        url: row.url,
        uploaded_at: row.uploaded_at,
      });
    }

    const report = {
      id: row.report_id,
      project_id: row.project_id,
      project_title: row.project_title,
      fiscal_year: row.fiscal_year,
      status: row.status,
      type: row.type,
      uploaded_at: row.uploaded_at,
    };

    // Fetch reviews for this project's final report (anonymous)
    const [reviews] = await db.execute(
      `
      SELECT
        id,
        review_type,
        review_comments,
        marks_breakdown,
        total_marks,
        submitted_at,
        status
      FROM project_review
      WHERE project_id = ?
        AND review_type = 2
      ORDER BY submitted_at DESC, id DESC
      `,
      [row.project_id]
    );

    return NextResponse.json({
      report,
      documents,
      reviews,
    });
  } catch (err) {
    console.error("Error fetching researcher report:", err);
    return NextResponse.json(
      { error: "Failed to fetch report details" },
      { status: 500 }
    );
  }
}
)