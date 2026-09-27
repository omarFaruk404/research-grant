import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { sendWorkReminderEmail, sendCustomEmail } from "@/lib/mail/workReminderMail";

export const GET = withAuth(async (req) => {
  const db = await getDB();
  const { searchParams } = new URL(req.url);

  // Filters
  const tab = searchParams.get("tab") || "researcher";
  const fiscalYearId = searchParams.get("fiscal_year_id") || "all";
  const search = searchParams.get("search") || "";
  
  // Pagination
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  try {
    let query = "";
    let countQuery = "";
    let params = [];
    let countParams = [];

    // --- TAB 1: RESEARCHER PROJECTS ---
    if (tab === "researcher") {
      let whereClause = `WHERE 1=1 `;
      
      if (fiscalYearId !== "all") {
        whereClause += ` AND p.fiscal_year_id = ?`;
        params.push(fiscalYearId);
      }

      if (search) {
        whereClause += ` AND (p.title LIKE ? OR u.name LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      whereClause += ` AND (p.status = 3 OR pr.id IS NOT NULL)`;

      countQuery = `
        SELECT COUNT(DISTINCT p.id) as total 
        FROM project p
        JOIN researcher r ON p.researcher_id = r.id
        JOIN user u ON r.user_id = u.id
        LEFT JOIN project_report pr ON (p.id = pr.project_id AND pr.type = 'final_report')
        ${whereClause}
      `;
      countParams = [...params];

      query = `
        SELECT 
          p.id AS project_id,
          p.title,
          p.status AS project_status,
          p.last_reminder_sent_at,
          p.created_at,
          u.name AS researcher_name,
          u.email AS researcher_email,
          pr.id AS report_id,
          pr.status AS report_status,
          fy.year_label
        FROM project p
        JOIN researcher r ON p.researcher_id = r.id
        JOIN user u ON r.user_id = u.id
        LEFT JOIN project_report pr ON (p.id = pr.project_id AND pr.type = 'final_report')
        LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params.push(limit, offset);
    } 
    
    // --- TAB 2: REVIEWER PENDING TASKS ---
    else if (tab === "reviewer") {
      let whereClause = `WHERE rev.status = 'assigned' `;

      if (fiscalYearId !== "all") {
        whereClause += ` AND p.fiscal_year_id = ?`;
        params.push(fiscalYearId);
      }

      if (search) {
        whereClause += ` AND (p.title LIKE ? OR u.name LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      countQuery = `
        SELECT COUNT(DISTINCT rev.id) as total
        FROM project_review rev
        JOIN project p ON rev.project_id = p.id
        JOIN reviewer r ON rev.reviewer_id = r.id
        JOIN user u ON r.user_id = u.id
        ${whereClause}
      `;
      countParams = [...params];

      query = `
        SELECT 
          rev.id AS review_id,
          rev.review_type, 
          rev.last_reminder_sent_at,
          rev.assigned_at,
          p.title AS project_title,
          p.id AS project_id,
          u.name AS reviewer_name,
          u.email AS reviewer_email,
          fy.year_label
        FROM project_review rev
        JOIN project p ON rev.project_id = p.id
        JOIN reviewer r ON rev.reviewer_id = r.id
        JOIN user u ON r.user_id = u.id
        LEFT JOIN fiscal_year fy ON p.fiscal_year_id = fy.id
        ${whereClause}
        ORDER BY rev.assigned_at DESC
        LIMIT ? OFFSET ?
      `;
      params.push(limit, offset);
    }

    const [countRows] = await db.query(countQuery, countParams);
    const totalItems = countRows[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const [data] = await db.query(query, params);

    return NextResponse.json({
      success: true,
      data,
      meta: { totalItems, totalPages, currentPage: page }
    });

  } catch (error) {
    console.error("Mail Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
});

export const POST = withAuth(async (req) => {
  try {
    const contentType = req.headers.get("content-type") || "";
    const db = await getDB();

    // --- CASE 1: CUSTOM MAIL (Multipart Form Data) ---
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const to = formData.get("to");
      const subject = formData.get("subject");
      const body = formData.get("body");
      const file = formData.get("attachment");

      if (!to || !subject || !body) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      let attachmentData = null;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        attachmentData = {
          filename: file.name,
          content: Buffer.from(arrayBuffer)
        };
      }

      // ⚡️ OPTIMIZATION: FIRE AND FORGET (No await)
      sendCustomEmail({ to, subject, body, attachment: attachmentData })
        .catch(err => console.error("Background Custom Email Failed:", err));
      
      return NextResponse.json({ success: true, message: "Custom email queued for sending." });
    }

    // --- CASE 2: STANDARD REMINDER (JSON) ---
    else {
      const body = await req.json();
      const { email, name, project_title, mail_type, id_to_update, update_table } = body;

      if (!email || !mail_type) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

      // ⚡️ OPTIMIZATION: FIRE AND FORGET (No await)
      sendWorkReminderEmail({
        to: email,
        name: name || "User",
        type: mail_type,
        project: { title: project_title }
      }).catch(err => console.error("Background Reminder Email Failed:", err));

      // 2. Update Database Timestamp (We verify the action was attempted)
      const now = new Date();
      if (update_table === "project") {
        await db.query(`UPDATE project SET last_reminder_sent_at = ? WHERE id = ?`, [now, id_to_update]);
      } else if (update_table === "project_review") {
        await db.query(`UPDATE project_review SET last_reminder_sent_at = ? WHERE id = ?`, [now, id_to_update]);
      }

      return NextResponse.json({ success: true, message: "Reminder queued and logged." });
    }

  } catch (error) {
    console.error("Send Mail Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});