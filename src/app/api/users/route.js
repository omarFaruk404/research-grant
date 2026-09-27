import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async () => {
  try {
    const db = await getDB();

    // 1. Fetch Active Researchers (Role 2 or 4)
    const [researchers] = await db.query(`
      SELECT 
        r.id AS researcher_id,
        r.user_id,
        r.designation,
        u.name AS user_name,
        u.email,
        u.phone,
        f.name AS faculty_name,
        d.name AS department_name
      FROM researcher r
      JOIN user u ON r.user_id = u.id
      LEFT JOIN faculty f ON r.faculty_id = f.id
      LEFT JOIN department d ON r.department_id = d.id
      WHERE u.role IN (2, 4)  -- ✅ Only fetch if active Role is Researcher or Both
      ORDER BY u.name
    `);

    // 2. Fetch Active Reviewers (Role 3 or 4)
    const [reviewers] = await db.query(`
      SELECT 
        rv.id AS reviewer_id,
        rv.user_id,
        rv.designation,
        -- Logic: If internal department ID exists, use that name. 
        -- Else, use the manual text entered in 'department' column.
        COALESCE(d.name, rv.department) AS department, 
        rv.university,
        u.name AS user_name,
        u.email,
        u.phone
      FROM reviewer rv
      JOIN user u ON rv.user_id = u.id
      LEFT JOIN department d ON rv.department_id = d.id
      WHERE u.role IN (3, 4)  -- ✅ Only fetch if active Role is Reviewer or Both
      ORDER BY u.name
    `);

    return NextResponse.json({ researchers, reviewers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
});