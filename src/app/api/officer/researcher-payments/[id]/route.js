import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/mail/mail"; // ✅ 1. Import Mailer

// 1. GET: Fetch Project Details & All Payments
export const GET = withAuth(async (req, { params }) => {
  const { id } = params;
  const db = await getDB();

  try {
    const [[project]] = await db.query(
      `
      SELECT 
        p.id,
        p.title,
        p.code_no,
        p.allocated_budget,
        p.status,
        u.name AS researcher_name,
        u.email AS researcher_email,
        f.name AS faculty_name,
        d.name AS department_name
      FROM project p
      LEFT JOIN researcher r ON p.researcher_id = r.id
      LEFT JOIN user u ON r.user_id = u.id
      LEFT JOIN faculty f ON r.faculty_id = f.id
      LEFT JOIN department d ON r.department_id = d.id
      WHERE p.id = ?
      `,
      [id]
    );

    if (!project)
      return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Fetch all payments (ordered by slot/date)
    const [payments] = await db.query(
      `SELECT * FROM researcher_payment WHERE project_id = ? ORDER BY payment_date ASC, id ASC`,
      [id]
    );

    // Calculate totals
    const totalReleased = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const remaining = (project.allocated_budget || 0) - totalReleased;

    return NextResponse.json({
      success: true,
      project: { ...project, payments, totalReleased, remaining },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch project payments" }, { status: 500 });
  }
});

// 2. POST: Add a New Payment
export const POST = withAuth(async (req, { params }) => {
  const { id } = params;
  const db = await getDB();
  const body = await req.json();

  try {
    if (body.type === "add_payment") {
      // ✅ Updated Query: Fetch Email, Name, and Title for Notification
      const [[proj]] = await db.query(
        `
        SELECT 
          p.allocated_budget, 
          p.researcher_id, 
          p.title, 
          u.email, 
          u.name 
        FROM project p
        JOIN researcher r ON p.researcher_id = r.id
        JOIN user u ON r.user_id = u.id
        WHERE p.id = ?
        `,
        [id]
      );

      if (!proj)
        return NextResponse.json({ error: "Project not found" }, { status: 404 });

      // 1. Calculate existing totals
      const [existingPayments] = await db.query(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM researcher_payment WHERE project_id = ?`,
        [id]
      );

      const totalReleased = parseFloat(existingPayments[0].total);
      const remaining = parseFloat(proj.allocated_budget) - totalReleased;

      // 2. Validate Amount
      const amount = parseFloat(body.amount);
      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
      }
      
      if (amount > remaining) {
        return NextResponse.json({ error: "Amount exceeds remaining balance" }, { status: 400 });
      }

      // 3. Validate Date
      if (!body.payment_date) {
        return NextResponse.json({ error: "Payment date is required" }, { status: 400 });
      }

      // 4. Calculate next slot
      const [[slot]] = await db.query(
        `SELECT COUNT(*) + 1 AS next_slot FROM researcher_payment WHERE project_id = ?`,
        [id]
      );

      // 5. Insert Payment
      await db.query(
        `
        INSERT INTO researcher_payment (project_id, researcher_id, amount, payment_date, payment_note, payment_slot)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            id, 
            proj.researcher_id, 
            amount, 
            body.payment_date, 
            body.note || "", 
            slot.next_slot
        ]
      );

      // -------------------------------------------------------------
      // 📧 SEND NOTIFICATION EMAIL (If flag is true)
      // -------------------------------------------------------------
      if (body.send_email && proj.email) {
        console.log(`Sending payment notification to ${proj.email}...`);
        
        await sendNotificationEmail({
          to: proj.email,
          name: proj.name,
          type: "PAYMENT_RESEARCHER", // Matches case in lib/email.js
          projectTitle: proj.title,
          amount: amount
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request type." }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update project payments" }, { status: 500 });
  }
});

// 3. PUT: Update an Existing Payment (Edit)
export const PUT = withAuth(async (req) => {
  try {
    const { payment_id, amount, note, payment_date } = await req.json();
    const db = await getDB();

    if (!payment_id || !amount || !payment_date) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    await db.query(
      `UPDATE researcher_payment 
       SET amount = ?, payment_note = ?, payment_date = ? 
       WHERE id = ?`,
      [amount, note, payment_date, payment_id]
    );

    return NextResponse.json({ success: true, message: "Payment updated successfully" });

  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
});

// 4. DELETE: Remove a Payment
export const DELETE = withAuth(async (req) => {
  try {
    const { payment_id } = await req.json();
    const db = await getDB();

    if (!payment_id) {
      return NextResponse.json({ success: false, error: "Payment ID required" }, { status: 400 });
    }

    await db.query(`DELETE FROM researcher_payment WHERE id = ?`, [payment_id]);

    return NextResponse.json({ success: true, message: "Payment deleted successfully" });

  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
});