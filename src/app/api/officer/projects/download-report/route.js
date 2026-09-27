import { getDB } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req) => {
  const db = await getDB(); // Ensure await here

  const [rows] = await db.query(`
    SELECT 
      p.id,
      p.code_no,
      p.title,
      p.status,
      p.proposal_submission_date AS submission_date,
      p.proposed_budget,
      p.allocated_budget,
      
      -- Calculate Total Budget Received (Sum of researcher payments)
      COALESCE((
        SELECT SUM(amount) 
        FROM researcher_payment rp 
        WHERE rp.project_id = p.id
      ), 0) AS total_budget_received,

      fy.year_label AS fiscal_year,
      
      -- Researcher Details
      r.id AS researcher_id,
      u.name AS researcher_name,
      f.name AS faculty,
      d.name AS department,

      -- Proposal Reviewer Name (Type 1)
      u_prop.name AS proposal_reviewer_name,

      -- Final Report Reviewer Name (Type 2)
      u_final.name AS final_report_reviewer_name

    FROM project p
    LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
    LEFT JOIN researcher r ON p.researcher_id = r.id
    LEFT JOIN user u ON r.user_id = u.id
    LEFT JOIN faculty f ON r.faculty_id = f.id
    LEFT JOIN department d ON r.department_id = d.id

    -- Join for Proposal Reviewer (Type 1)
    LEFT JOIN project_review rev_prop ON (p.id = rev_prop.project_id AND rev_prop.review_type = 1)
    LEFT JOIN reviewer r_prop ON rev_prop.reviewer_id = r_prop.id
    LEFT JOIN user u_prop ON r_prop.user_id = u_prop.id

    -- Join for Final Report Reviewer (Type 2)
    LEFT JOIN project_review rev_final ON (p.id = rev_final.project_id AND rev_final.review_type = 2)
    LEFT JOIN reviewer r_final ON rev_final.reviewer_id = r_final.id
    LEFT JOIN user u_final ON r_final.user_id = u_final.id

    ORDER BY p.created_at DESC
  `);

  return Response.json(rows);
});