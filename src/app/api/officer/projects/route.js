import { getDB } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req) => {
  const db = getDB();   


  const [rows] = await db.query(`
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
    ORDER BY p.created_at DESC
  `);

  return Response.json(rows);
}
)