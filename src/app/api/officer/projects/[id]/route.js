import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req, { params }) => {
  try {
    const db = await getDB();
    const projectId = params.id;

    /** 1️⃣ Project Core Details */
    const [projectRows] = await db.query(
      `
      SELECT 
        p.id,
        p.title,
        p.code_no,
        p.status,
        p.abstract,
        p.proposed_budget,
        p.allocated_budget,
        p.proposal_submission_date AS submission_date, -- ✅ FIXED: Correct column name aliased for frontend
        p.created_at,
        p.problem_domain,

        -- Fiscal Year
        fy.year_label AS fiscal_year,

        -- Researcher Info
        u.name AS researcher_name,
        u.email AS researcher_email,
        u.phone AS researcher_phone,
        r.designation AS researcher_designation,
        d.name AS researcher_department,
        f.name AS researcher_faculty

      FROM project p
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      LEFT JOIN researcher r ON p.researcher_id = r.id
      LEFT JOIN user u ON r.user_id = u.id
      LEFT JOIN department d ON r.department_id = d.id
      LEFT JOIN faculty f ON r.faculty_id = f.id
      WHERE p.id = ?
      LIMIT 1
      `,
      [projectId]
    );

    const project = projectRows[0];

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Parse problem_domain JSON safely
    try {
        project.problem_domain = project.problem_domain ? JSON.parse(project.problem_domain) : null;
    } catch (e) {
        console.error("Error parsing problem_domain:", e);
        project.problem_domain = null;
    }

    /** 2️⃣ Proposal Documents */
    const [proposalRows] = await db.query(
      `SELECT documents, status, uploaded_at 
       FROM project_report 
       WHERE project_id = ? AND type = 'proposal' 
       ORDER BY uploaded_at DESC LIMIT 1`,
      [projectId]
    );

    /** 3️⃣ Final Report Documents */
    const [finalReportRows] = await db.query(
      `SELECT documents, status, uploaded_at 
       FROM project_report 
       WHERE project_id = ? AND type = 'final_report' 
       ORDER BY uploaded_at DESC LIMIT 1`,
      [projectId]
    );

    /** 4️⃣ Proposal Review */
    const [proposalReviewRows] = await db.query(
      `
      SELECT 
        pr.id AS review_id,
        pr.reviewer_id,
        pr.status,
        pr.due_date,
        pr.submitted_at,
        pr.total_marks,
        pr.marks_breakdown,
        pr.review_comments,
        u.name AS reviewer_name,
        u.email AS reviewer_email,
        rv.designation AS reviewer_designation,
        rv.university AS reviewer_university
      FROM project_review pr
      LEFT JOIN reviewer rv ON pr.reviewer_id = rv.id
      LEFT JOIN user u ON rv.user_id = u.id
      WHERE pr.project_id = ? AND pr.review_type = 1
      ORDER BY pr.id DESC 
      LIMIT 1
      `,
      [projectId]
    );

    /** 5️⃣ Final Report Review */
    const [finalReportReviewRows] = await db.query(
      `
      SELECT 
        pr.id AS review_id,
        pr.status,
        pr.due_date,
        pr.submitted_at,
        pr.total_marks,
        pr.marks_breakdown,
        pr.review_comments,
        u.name AS reviewer_name,
        u.email AS reviewer_email
      FROM project_review pr
      LEFT JOIN reviewer rv ON pr.reviewer_id = rv.id
      LEFT JOIN user u ON rv.user_id = u.id
      WHERE pr.project_id = ? AND pr.review_type = 2
      ORDER BY pr.id DESC 
      LIMIT 1
      `,
      [projectId]
    );

    return NextResponse.json({
      success: true,
      project,
      proposal: proposalRows[0]
        ? { ...proposalRows[0], documents: JSON.parse(proposalRows[0].documents || "[]") }
        : null,
      final_report: finalReportRows[0]
        ? { ...finalReportRows[0], documents: JSON.parse(finalReportRows[0].documents || "[]") }
        : null,
      proposal_review: proposalReviewRows[0] || null,
      final_report_review: finalReportReviewRows[0] || null,
    });

  } catch (err) {
    console.error("Project details API error:", err);
    return NextResponse.json(
      { error: "Failed to load project details" },
      { status: 500 }
    );
  }
})