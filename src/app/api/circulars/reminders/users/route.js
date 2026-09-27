import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req) => {
  const db = await getDB();

  try {
    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        
        -- Researcher Details
        res.id AS researcher_id,
        res.department_id AS res_dept_id,
        res.faculty_id AS res_faculty_id,
        d_res.name AS res_dept_name,
        f_res.name AS res_faculty_name,

        -- Reviewer Details
        rev.id AS reviewer_id,
        rev.department_id AS rev_dept_id,
        rev.department AS rev_dept_text, -- Text column from reviewer table
        d_rev.name AS rev_dept_name_joined, -- Name from department table
        f_rev.name AS rev_faculty_name -- Faculty name via department table relation

      FROM user u
      LEFT JOIN researcher res ON u.id = res.user_id
      LEFT JOIN reviewer rev ON u.id = rev.user_id
      
      -- Join for Researcher Info
      LEFT JOIN department d_res ON res.department_id = d_res.id
      LEFT JOIN faculty f_res ON res.faculty_id = f_res.id

      -- Join for Reviewer Info
      -- 1. Get Department Name using ID
      LEFT JOIN department d_rev ON rev.department_id = d_rev.id
      -- 2. Get Faculty Name using the Department's faculty_id
      LEFT JOIN faculty f_rev ON d_rev.faculty_id = f_rev.id

      WHERE u.role IN (2,3,4) -- Researcher, Reviewer, or Both
      ORDER BY u.name ASC
    `;

    const [rows] = await db.query(query);

    // Process rows
    const users = rows.map(row => {
      // Logic: If joined name exists (valid ID), use it. Otherwise use the text column.
      const finalRevDeptName = row.rev_dept_name_joined || row.rev_dept_text;

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        
        // Roles Flags
        is_researcher: !!row.researcher_id,
        is_reviewer: !!row.reviewer_id,

        // Researcher Data
        researcher_data: {
          dept_id: row.res_dept_id,
          faculty_id: row.res_faculty_id,
          dept_name: row.res_dept_name,
          faculty_name: row.res_faculty_name
        },

        // Reviewer Data
        reviewer_data: {
          dept_id: row.rev_dept_id, // Nullable
          dept_name: finalRevDeptName, // Resolved Name
          // Even if we don't filter by faculty for reviewers, it's good to have if available via Dept link
          faculty_name: row.rev_faculty_name 
        }
      };
    });

    return NextResponse.json({ success: true, users });

  } catch (error) {
    console.error("User Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
});