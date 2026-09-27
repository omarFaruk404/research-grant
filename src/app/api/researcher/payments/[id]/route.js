import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req, { params }) => {
  const { id } = await params;
  const db = await getDB();

  try {
    const { searchParams } = new URL(req.url);
    const researcherId = searchParams.get("researcher_id");

    if (!researcherId) {
      return NextResponse.json({ error: "researcher_id is required" }, { status: 400 });
    }

    // Run queries in parallel for performance
    const [projectResult, paymentsResult] = await Promise.all([
      // 1. Fetch Project Details
      db.query(
        `
        SELECT 
          p.id,
          p.title,
          p.code_no,
          p.allocated_budget,
          p.first_allocation_amount,
          p.status,
          fy.year_label AS fiscal_year,
          u.name AS researcher_name,
          f.name AS faculty_name,
          d.name AS department_name
        FROM project p
        LEFT JOIN researcher r ON p.researcher_id = r.id
        LEFT JOIN user u ON r.user_id = u.id
        LEFT JOIN faculty f ON r.faculty_id = f.id
        LEFT JOIN department d ON r.department_id = d.id
        LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
        WHERE p.id = ? AND p.researcher_id = ?
        `,
        [id, researcherId]
      ),
      // 2. Fetch Payment History
      db.query(
        `
        SELECT 
          id,
          amount,
          payment_date,
          payment_note,
          payment_slot
        FROM researcher_payment
        WHERE project_id = ?
        ORDER BY payment_slot ASC, payment_date ASC
        `,
        [id]
      )
    ]);

    const project = projectResult[0][0];
    const payments = paymentsResult[0];

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // --- Calculation Logic ---
    // 1. Sum of additional payments from researcher_payment table
    const totalAdditionalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    
    // 2. Initial allocation from project table
    const firstAlloc = Number(project.first_allocation_amount || 0);
    
    // 3. Total Released = First Alloc + Additional Payments
    const totalReleased = firstAlloc + totalAdditionalPayments;
    
    // 4. Remaining = Allocated - Total Released
    const remaining = Number(project.allocated_budget || 0) - totalReleased;

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        payments,
        totalReleased,
        remaining,
      },
    });

  } catch (err) {
    console.error("Error fetching payment details:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
});