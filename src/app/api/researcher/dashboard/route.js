import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    const db = await getDB();

    // Get researcher
    const [[researcher]] = await db.query(
      `SELECT id FROM researcher WHERE user_id = ?`,
      [userId]
    );

    if (!researcher) {
      return NextResponse.json(
        { error: "Researcher not found" },
        { status: 404 }
      );
    }

    const researcherId = researcher.id;

    // Project status counts
    const [projects] = await db.query(
      `
      SELECT 
        COUNT(*) AS total,
        SUM(status = 1) AS proposal_submitted,
        SUM(status = 2) AS under_review,
        SUM(status = 3) AS ongoing,
        SUM(status = 4) AS final_report_submitted,
        SUM(status = 5) AS completed
      FROM project
      WHERE researcher_id = ?
      `,
      [researcherId]
    );

    // Budget & payments
    const [[budget]] = await db.query(
      `
      SELECT
        COALESCE(SUM(allocated_budget),0) AS allocated,
        COALESCE(SUM(first_allocation_amount),0) AS first_alloc
      FROM project
      WHERE researcher_id = ?
      `,
      [researcherId]
    );

    const [[payments]] = await db.query(
      `
      SELECT COALESCE(SUM(amount),0) AS paid
      FROM researcher_payment
      WHERE researcher_id = ?
      `,
      [researcherId]
    );

    // Final report stats
// Final report stats (FIXED)
const [reports] = await db.query(
  `
  SELECT
    COUNT(*) AS total,
    SUM(pr.status = 3) AS accepted,
    SUM(pr.status = 4) AS rejected
  FROM project_report pr
  JOIN project p ON pr.project_id = p.id
  WHERE pr.type = 'final_report'
    AND p.researcher_id = ?
  `,
  [researcherId]
);


    // Recent activities
    const [recentProjects] = await db.query(
      `
      SELECT title AS description, updated_at AS date
      FROM project
      WHERE researcher_id = ?
      ORDER BY updated_at DESC
      LIMIT 3
      `,
      [researcherId]
    );

    const [recentPayments] = await db.query(
      `
      SELECT 
        CONCAT('Payment received: ৳', amount) AS description,
        created_at AS date
      FROM researcher_payment
      WHERE researcher_id = ?
      ORDER BY created_at DESC
      LIMIT 3
      `,
      [researcherId]
    );

    const recentActivities = [...recentProjects, ...recentPayments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6)
      .map((r) => ({
        description: r.description,
        date: new Date(r.date).toISOString().split("T")[0],
      }));

    return NextResponse.json({
      projects: projects[0],
      budget: {
        allocated: budget.allocated,
        received: payments.paid + budget.first_alloc,
        remaining:
          budget.allocated - (payments.paid + budget.first_alloc),
      },
      reports: reports[0],
      recentActivities,
    });
  } catch (err) {
    console.error("Researcher dashboard error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
)