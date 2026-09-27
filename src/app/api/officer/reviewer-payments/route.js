import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async () => {


  const db = await getDB();

  try {
    const [rows] = await db.query(`
      SELECT 
        rp.id AS payment_id,
        rp.payment_type,
        rp.amount,
        rp.status,
        rp.payment_date,
        rp.created_at,
        u.name AS reviewer_name,
        u.email AS reviewer_email,
        p.title AS project_title,
        p.id AS project_id,
        fy.year_label AS fiscal_year
      FROM reviewer_payment rp
      LEFT JOIN reviewer r ON rp.reviewer_id = r.id
      LEFT JOIN user u ON r.user_id = u.id
      LEFT JOIN project p ON rp.project_id = p.id
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      ORDER BY rp.created_at DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("❌ Error fetching reviewer payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviewer payments" },
      { status: 500 }
    );
  }
}
)