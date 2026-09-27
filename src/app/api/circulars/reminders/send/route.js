import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { sendCircularReminder } from "@/lib/mail/circularMailReminder";

export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const { circular_id, recipient_ids } = body; // recipient_ids is an array of user IDs

    // 1. Validation
    if (!circular_id || !recipient_ids || !Array.isArray(recipient_ids) || recipient_ids.length === 0) {
      return NextResponse.json({ error: "Circular and at least one recipient are required" }, { status: 400 });
    }

    const db = await getDB();

    // 2. Fetch Circular Details
    const [circularRows] = await db.query(
      `
      SELECT 
        c.title, 
        c.circular_type, 
        c.attachment AS file_url, 
        fy.year_label AS fiscal_year 
      FROM circular c
      LEFT JOIN fiscal_year fy ON c.fiscal_year_id = fy.id
      WHERE c.id = ?
      `,
      [circular_id]
    );

    if (circularRows.length === 0) {
      return NextResponse.json({ error: "Circular not found" }, { status: 404 });
    }

    const circularData = circularRows[0];

    // 3. Fetch Recipient Emails
    // ✅ FIX: Removed 'AND status = 1' since the column does not exist
    const [users] = await db.query(
      `SELECT name, email FROM user WHERE id IN (?)`,
      [recipient_ids]
    );

    if (users.length === 0) {
        return NextResponse.json({ error: "No valid recipients found" }, { status: 400 });
    }

    // 4. Send Emails
    const mailObject = {
        title: circularData.title,
        type: circularData.circular_type === 'proposal' ? 'proposal_call' : 'notice',
        fiscal_year: circularData.fiscal_year,
        file_url: circularData.file_url
    };

    console.log(`Sending circular reminder to ${users.length} users...`);
    
    // Call the utility function
    await sendCircularReminder(users, mailObject);

    return NextResponse.json({ 
        success: true, 
        message: `Reminders sent successfully to ${users.length} recipients.` 
    });

  } catch (error) {
    console.error("Send Reminder Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});