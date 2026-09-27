import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req) => {
  try {
    const db = await getDB();
    const { searchParams } = new URL(req.url);
    const fiscalYear = searchParams.get("fiscal_year");

    // 1. Fetch all available fiscal years for the dropdown
    const [fyRows] = await db.execute(`
      SELECT id, year_label 
      FROM fiscal_year 
      ORDER BY year_label DESC
    `);
    const availableYears = fyRows.map((fy) => fy.year_label);

    // --- FILTERS ---
    // Helper to construct WHERE clause based on fiscal year
    const fyCondition = fiscalYear ? `AND fy.year_label = ?` : "";
    const fyParam = fiscalYear ? [fiscalYear] : [];

    // 2. People Counts (Global)
    const [researcherCount] = await db.execute(`SELECT COUNT(*) AS total FROM researcher`);
    const [reviewerCount] = await db.execute(`SELECT COUNT(*) AS total FROM reviewer`);

    // 3. Project Status Counts (Filtered by Fiscal Year)
    // We can fetch all statuses in one query for efficiency
    const [projectStats] = await db.execute(`
      SELECT 
        SUM(CASE WHEN p.status = 1 THEN 1 ELSE 0 END) AS submitted,
        SUM(CASE WHEN p.status = 2 THEN 1 ELSE 0 END) AS under_review,
        SUM(CASE WHEN p.status = 3 THEN 1 ELSE 0 END) AS ongoing,
        SUM(CASE WHEN p.status = 5 THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN p.status = 0 THEN 1 ELSE 0 END) AS rejected
      FROM project p
      LEFT JOIN fiscal_year fy ON fy.id = p.fiscal_year_id
      WHERE 1=1 ${fyCondition}
    `, fyParam);

    const stats = projectStats[0];

    // 4. Pending Reviews (Global - Action Item)
    const [pendingReviews] = await db.execute(
      `SELECT COUNT(*) AS total FROM project_review WHERE status = 'assigned'`
    );

    // 5. Recent Activity Stream
    // A. Recent Project Submissions
    const [recentProjects] = await db.execute(`
      SELECT p.title, p.created_at, 'New Proposal Submitted' as action_type
      FROM project p
      ORDER BY p.created_at DESC
      LIMIT 3
    `);

    // B. Recent Completed Projects
    const [recentCompleted] = await db.execute(`
      SELECT p.title, p.updated_at as created_at, 'Project Completed' as action_type
      FROM project p
      WHERE p.status = 5
      ORDER BY p.updated_at DESC
      LIMIT 3
    `);

    // Merge and Sort Activities
    const rawActivities = [...recentProjects, ...recentCompleted];
    
    const recentActivities = rawActivities
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5) // Show top 5
      .map((item) => ({
        description: `${item.action_type}: ${item.title}`,
        date: new Date(item.created_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric"
        }),
      }));

    return NextResponse.json({
      availableYears,
      totalResearchers: researcherCount[0]?.total || 0,
      totalReviewers: reviewerCount[0]?.total || 0,
      submittedProjects: stats.submitted || 0,
      underReviewProjects: stats.under_review || 0,
      ongoingProjects: stats.ongoing || 0,
      completedProjects: stats.completed || 0,
      rejectedProjects: stats.rejected || 0,
      pendingReviews: pendingReviews[0]?.total || 0,
      recentActivities,
    });

  } catch (err) {
    console.error("Dashboard API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});