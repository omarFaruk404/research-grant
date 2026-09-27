import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async () => {
  const db = await getDB();

  try {
    // 1. Ongoing Projects (status = 3)
    const [ongoing] = await db.query(`
      SELECT 
        p.id,
        p.code_no,
        p.title,
        p.allocated_budget,
        p.first_allocation_amount,
        p.status,
        u.name AS researcher_name,
        f.name AS faculty_name,
        d.name AS department_name,
        fy.year_label AS fiscal_year,
        r.faculty_id, 
        r.department_id,
        COALESCE(SUM(rp.amount), 0) + COALESCE(p.first_allocation_amount, 0) AS released,
        (p.allocated_budget - (COALESCE(SUM(rp.amount), 0) + COALESCE(p.first_allocation_amount, 0))) AS remaining
      FROM project p
      LEFT JOIN researcher r ON p.researcher_id = r.id
      LEFT JOIN user u ON r.user_id = u.id
      LEFT JOIN faculty f ON r.faculty_id = f.id
      LEFT JOIN department d ON r.department_id = d.id
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      LEFT JOIN researcher_payment rp ON rp.project_id = p.id
      WHERE p.status = 3
      GROUP BY 
        p.id, p.code_no, p.title, p.allocated_budget, p.first_allocation_amount, p.status, 
        u.name, f.name, d.name, fy.year_label, r.faculty_id, r.department_id
      ORDER BY p.id DESC
    `);

    // 2. Completed Projects (status = 4 [Report Submitted] or 5 [Completed])
    const [completed] = await db.query(`
      SELECT 
        p.id,
        p.code_no,
        p.title,
        p.allocated_budget,
        p.first_allocation_amount,
        p.status,
        u.name AS researcher_name,
        f.name AS faculty_name,
        d.name AS department_name,
        fy.year_label AS fiscal_year,
        r.faculty_id,
        r.department_id,
        COALESCE(SUM(rp.amount), 0) + COALESCE(p.first_allocation_amount, 0) AS total_released,
        p.updated_at AS completed_date
      FROM project p
      LEFT JOIN researcher r ON p.researcher_id = r.id
      LEFT JOIN user u ON r.user_id = u.id
      LEFT JOIN faculty f ON r.faculty_id = f.id
      LEFT JOIN department d ON r.department_id = d.id
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      LEFT JOIN researcher_payment rp ON rp.project_id = p.id
      WHERE p.status IN (4, 5)
      GROUP BY 
        p.id, p.code_no, p.title, p.allocated_budget, p.first_allocation_amount, p.status, 
        u.name, f.name, d.name, fy.year_label, r.faculty_id, r.department_id
      ORDER BY p.updated_at DESC
    `);

    return NextResponse.json({ success: true, ongoing, completed });
  } catch (err) {
    console.error("Error fetching researcher payments:", err);
    return NextResponse.json(
      { error: "Failed to fetch researcher payments" },
      { status: 500 }
    );
  }
})