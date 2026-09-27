import { getDB } from "@/lib/db";
import { NextResponse, Response } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req) => {
  try {
    const db = await getDB();

    const { searchParams } = new URL(req.url);
    const researcherId = searchParams.get("researcher_id");
    console.log("Fetching projects for researcher_id:", researcherId);
    if (!researcherId) {
      return Response.json(
        { error: "researcher_id is required" },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      `
      SELECT 
        p.id,
        p.code_no,
        p.title,
        p.status,
        p.proposal_submission_date AS submission_date,
        fy.year_label AS fiscal_year,
        r.id AS researcher_id,
        u.name AS researcher_name,
        f.name AS faculty,
        d.name AS department
      FROM project p
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      LEFT JOIN researcher r ON p.researcher_id = r.id
      LEFT JOIN user u ON r.user_id = u.id
      LEFT JOIN faculty f ON r.faculty_id = f.id
      LEFT JOIN department d ON r.department_id = d.id
      WHERE p.researcher_id = ?
      ORDER BY p.created_at DESC
      `,
      [researcherId]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("Error loading researcher projects:", err);
    return NextResponse.json(
      { error: "Failed to load projects" },
      { status: 500 }
    );
  }
}
)