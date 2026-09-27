import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDB();

    // Fetch Ongoing (status 3) and Completed (status 5) projects
    const [rows] = await db.query(`
      SELECT 
        p.id, p.title, p.status, p.created_at,
        u.name AS researcher_name, 
        f.name AS faculty_name,
        d.name AS department_name
      FROM project p
      LEFT JOIN researcher r ON p.researcher_id = r.id
      LEFT JOIN user u ON r.user_id = u.id
      LEFT JOIN faculty f ON r.faculty_id = f.id
      LEFT JOIN department d ON r.department_id = d.id
      WHERE p.status IN (3,5)
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    const ongoing = rows.filter((p) => p.status === 3);
    const completed = rows.filter((p) => p.status === 5);

    return NextResponse.json({ ongoing, completed });
  } catch (error) {
    console.error("Error loading home projects:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
