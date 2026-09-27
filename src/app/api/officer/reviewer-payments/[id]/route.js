import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/mail/mail"; // ✅ 1. Import Mailer

// GET: payment details by ID
export const GET = withAuth(async (req, { params }) => {
  const { id } = params;
  const db = await getDB();
  
  try {
    const [rows] = await db.query(`
      SELECT 
        rp.id AS payment_id,
        rp.payment_type,
        rp.amount,
        rp.payment_date,
        rp.note,  /* ✅ Added payment_note */
        rp.created_at,
        rp.status,
        u.name AS reviewer_name,
        p.title AS project_title,
        p.id AS project_id,
        fy.year_label AS fiscal_year
      FROM reviewer_payment rp
      LEFT JOIN reviewer r ON rp.reviewer_id = r.id
      LEFT JOIN user u ON r.user_id = u.id
      LEFT JOIN project p ON rp.project_id = p.id
      LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
      WHERE rp.id = ?
    `, [id]);

    if (!rows.length) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment details" },
      { status: 500 }
    );
  }
})

// PUT: release funds (mark as paid)
export const PUT = withAuth(async (req, { params }) => {
  const { id } = params;
  const db = await getDB();
  
  // 1. Extract fields including new ones
  const { amount, payment_date, note, send_email } = await req.json();

  try {
    // 2. Validation
    if (!amount) {
        return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }
    if (!payment_date) {
        return NextResponse.json({ error: "Payment date is required" }, { status: 400 });
    }

    // 3. Update query (Added payment_note)
    await db.query(
      `UPDATE reviewer_payment 
       SET payment_date = ?, 
           amount = ?, 
           note = ?, 
           status = 1 
       WHERE id = ?`,
      [payment_date, amount, note || null, id]
    );

    // -------------------------------------------------------------
    // 📧 SEND NOTIFICATION EMAIL (If flag is true)
    // -------------------------------------------------------------
    if (send_email) {
      // Fetch necessary details for email (Email, Name, Project Title)
      const [rows] = await db.query(`
        SELECT 
          u.email, 
          u.name, 
          p.title AS project_title,
          rp.payment_type
        FROM reviewer_payment rp
        JOIN reviewer r ON rp.reviewer_id = r.id
        JOIN user u ON r.user_id = u.id
        JOIN project p ON rp.project_id = p.id
        WHERE rp.id = ?
      `, [id]);

      if (rows.length > 0) {
        const info = rows[0];
        const reviewTypeLabel = info.payment_type === 'final_report_review' ? "Final Report" : "Proposal";

        if (info.email) {
          console.log(`Sending reviewer payment email to ${info.email}...`);
          
          await sendNotificationEmail({
            to: info.email,
            name: info.name,
            type: "PAYMENT_REVIEWER", // Matches case in lib/email.js
            projectTitle: info.project_title,
            amount: amount,
            reviewType: reviewTypeLabel
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Funds released successfully" });
  } catch (error) {
    console.error("Error releasing funds:", error);
    return NextResponse.json(
      { error: "Failed to release funds" },
      { status: 500 }
    );
  }
})