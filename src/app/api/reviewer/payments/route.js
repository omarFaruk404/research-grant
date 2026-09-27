import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req, { params }) => {

  try {
    const { searchParams } = new URL(req.url);
    const reviewerId = searchParams.get("reviewer_id");

    if (!reviewerId) {
      return NextResponse.json(
        { success: false, error: "reviewer_id is required" },
        { status: 400 }
      );
    }

    const db = await getDB();

    /* 🔹 Get ALL payments (Paid & Pending) + Fiscal Year in one query */
    const [payments] = await db.query(
      `
      SELECT
        rp.id,
        rp.project_id,
        rp.payment_type,
        rp.amount,
        rp.status, -- 0 = Pending, 1 = Paid
        rp.created_at,
        rp.payment_date,
        
        p.code_no,
        p.title,
        
        fy.year_label AS fiscal_year
      FROM reviewer_payment rp
      LEFT JOIN project p ON rp.project_id = p.id
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      WHERE rp.reviewer_id = ?
      ORDER BY rp.created_at DESC
      `,
      [reviewerId]
    );

    // We return a single list 'payments'. 
    // The frontend can now simply filter by status if needed, or display all.
    return NextResponse.json({
      success: true,
      payments, 
    });

  } catch (err) {
    console.error("Error fetching reviewer payments:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviewer payments" },
      { status: 500 }
    );
  }
})