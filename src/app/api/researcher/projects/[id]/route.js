import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req, { params }) => {
  try {
    const { id } = await params; // Await params for Next.js 15+
    const db = await getDB();

    // Optional: verify project belongs to this researcher (from query param)
    const { searchParams } = new URL(req.url);
    const researcherId = searchParams.get("researcher_id");

    const projectParams = researcherId ? [id, researcherId] : [id];

    // 1. Fetch Project Details
    const [projects] = await db.query(
      `
      SELECT 
        p.id,
        p.code_no,
        p.title,
        p.status,
        p.abstract,
        p.proposed_budget,
        p.allocated_budget,
        p.final_report_submission_due_date,
        p.fiscal_year_id,  -- ✅ ADDED THIS (Required for Dropdown)
        p.circular_id,     -- ✅ ADDED THIS (Required for Dropdown)
        fy.year_label AS fiscal_year
      FROM project p
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      WHERE p.id = ?
      ${researcherId ? "AND p.researcher_id = ?" : ""}
      LIMIT 1
      `,
      projectParams
    );

    if (projects.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const project = projects[0];

    // 2. Fetch Project Reports (Documents)
    const [reports] = await db.query(
      `
      SELECT 
        id,
        type,
        documents,
        status,
        uploaded_at
      FROM project_report
      WHERE project_id = ?
      ORDER BY uploaded_at DESC, id DESC
      `,
      [id]
    );

    const proposalDocuments = [];
    const finalReportDocuments = [];

    for (const report of reports) {
      let docs = report.documents;

      if (typeof docs === "string") {
        try {
          docs = JSON.parse(docs);
        } catch {
          docs = [];
        }
      }

      if (!Array.isArray(docs)) {
        docs = [];
      }

      const mappedDocs = docs.map((doc) => ({
        name: doc.name,
        url: doc.url,
        status: report.status, // Report status (1=submitted, 2=under review, 3=accepted, 4=rejected)
        type: report.type,
        uploaded_at: report.uploaded_at,
      }));

      if (report.type === "proposal") {
        proposalDocuments.push(...mappedDocs);
      } else if (report.type === "final_report") {
        finalReportDocuments.push(...mappedDocs);
      }
    }

    // 3. Fetch Reviews (Both Proposal & Final Report)
    // Removed 'AND review_type = 1' to include ALL reviews
    // Removed 'AND status = submitted' to show all reviews (e.g. accepted/rejected/completed)
    // You might want to filter out 'assigned' status if you don't want researchers to see empty reviews.
    const [reviews] = await db.query(
      `
      SELECT 
        id,
        review_type,
        total_marks,
        review_comments,
        submitted_at,
        marks_breakdown,
        status 
      FROM project_review
      WHERE project_id = ?
        AND status IN ('submitted', 'accepted', 'rejected', 'completed') 
      ORDER BY submitted_at DESC, id DESC
      `,
      [id]
    );

    return NextResponse.json({
      project,
      proposal_documents: proposalDocuments,
      final_report_documents: finalReportDocuments,
      reviews,
    });
  } catch (err) {
    console.error("Error fetching researcher project details:", err);
    return NextResponse.json(
      { error: "Failed to load project details" },
      { status: 500 }
    );
  }
});