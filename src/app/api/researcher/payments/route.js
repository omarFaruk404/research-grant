import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const researcherId = searchParams.get("researcher_id");

    if (!researcherId) {
      return NextResponse.json({ success: false, error: "researcher_id is required" }, { status: 400 });
    }

    const db = await getDB();

    // ✅ Single Query for ALL funded projects (Status >= 3)
    // Status 3: Accepted/Ongoing
    // Status 4: Report Submitted
    // Status 5: Completed
    const [projects] = await db.query(
      `
      SELECT 
        p.id,
        p.code_no,
        p.title,
        p.allocated_budget,
        p.first_allocation_amount,
        p.status,
        fy.year_label AS fiscal_year,
        u.name AS researcher_name,
        
        -- Calculate Total Released: First Allocation + Sum of Payments
        COALESCE(p.first_allocation_amount, 0) + COALESCE(SUM(rp.amount), 0) AS total_released,
        
        -- Calculate Remaining: Allocated - Total Released
        (p.allocated_budget - (COALESCE(p.first_allocation_amount, 0) + COALESCE(SUM(rp.amount), 0))) AS remaining,

        p.updated_at AS last_updated
      FROM project p
      LEFT JOIN researcher r ON p.researcher_id = r.id
      LEFT JOIN user u ON r.user_id = u.id
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      LEFT JOIN researcher_payment rp ON rp.project_id = p.id
      WHERE p.researcher_id = ? 
        AND p.status >= 3 
      GROUP BY p.id, u.name, fy.year_label
      ORDER BY p.id DESC
      `,
      [researcherId]
    );

    return NextResponse.json({ success: true, projects });

  } catch (err) {
    console.error("Error fetching researcher payments:", err);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
});