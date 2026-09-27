import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const reviewerId = searchParams.get("reviewer_id");
    const fiscalYear = searchParams.get("fiscal_year");

    if (!reviewerId) {
      return NextResponse.json({ success: false, error: "Reviewer ID missing" }, { status: 400 });
    }

    const db = await getDB();

    // Base query filter
    let yearFilter = "";
    const params = [reviewerId];
    
    // If filtering by fiscal year, we need to join project table
    if (fiscalYear) {
      yearFilter = ` AND p.fiscal_year_id IN (SELECT id FROM fiscal_year WHERE year_label = ?)`;
      params.push(fiscalYear);
    }

    // 1. Pending Reviews (Status = 'assigned')
    const [[pending]] = await db.query(
      `SELECT COUNT(*) as count 
       FROM project_review pr
       JOIN project p ON pr.project_id = p.id
       WHERE pr.reviewer_id = ? AND pr.status = 'assigned' ${yearFilter}`,
      params
    );

    // 2. Completed Reviews (Status = 'submitted')
    const [[completed]] = await db.query(
      `SELECT COUNT(*) as count 
       FROM project_review pr
       JOIN project p ON pr.project_id = p.id
       WHERE pr.reviewer_id = ? AND pr.status = 'submitted' ${yearFilter}`,
      params
    );

    // 3. Earnings (Paid & Pending)
    // Note: Payment table logic might differ, assuming simple sum here based on previous structure
    // We reuse params if yearFilter is applied to payment -> project link
    const [[earnings]] = await db.query(
        `SELECT 
            SUM(CASE WHEN rp.status = 1 THEN rp.amount ELSE 0 END) as total_paid,
            SUM(CASE WHEN rp.status = 0 THEN rp.amount ELSE 0 END) as total_pending
         FROM reviewer_payment rp
         JOIN project p ON rp.project_id = p.id
         WHERE rp.reviewer_id = ? ${yearFilter}`,
        params
    );

    // 4. Recent Activity (Last 5 reviews submitted)
    const [recent] = await db.query(
      `SELECT 
          pr.submitted_at as date,
          p.title,
          p.code_no as project_code,
          'submitted' as type,
          CONCAT('Submitted review for ', p.title) as description
       FROM project_review pr
       JOIN project p ON pr.project_id = p.id
       WHERE pr.reviewer_id = ? AND pr.status = 'submitted'
       ORDER BY pr.submitted_at DESC
       LIMIT 5`,
      [reviewerId]
    );

    // 5. Get Fiscal Years list for dropdown
    const [years] = await db.query(`SELECT year_label FROM fiscal_year ORDER BY id DESC`);

    return NextResponse.json({
      success: true,
      availableYears: years.map(y => y.year_label),
      stats: {
        pendingReviews: pending.count,
        completedReviews: completed.count,
        totalEarnings: earnings.total_paid || 0,
        pendingEarnings: earnings.total_pending || 0,
        recentActivities: recent
      }
    });

  } catch (err) {
    console.error("Reviewer stats error:", err);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
})