import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

// GET: Fetch settings (Unchanged)
export async function GET() {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT * FROM remarks ORDER BY id DESC LIMIT 1");
    
    let data = { proposal_criteria: [], final_report_criteria: [] };

    if (rows.length > 0) {
      data.proposal_criteria = rows[0].proposal_criteria ? JSON.parse(rows[0].proposal_criteria) : [];
      data.final_report_criteria = rows[0].final_report_criteria ? JSON.parse(rows[0].final_report_criteria) : [];
      data.id = rows[0].id;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// POST: Save/Update ONLY the provided criteria
export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getDB();

    // Check if a row exists
    const [existing] = await db.query("SELECT id FROM remarks ORDER BY id DESC LIMIT 1");
    const rowId = existing.length > 0 ? existing[0].id : null;

    // --- CASE 1: Save Proposal Criteria ---
    if (body.proposal_criteria) {
        const json = JSON.stringify(body.proposal_criteria);
        if (rowId) {
            await db.query("UPDATE remarks SET proposal_criteria = ? WHERE id = ?", [json, rowId]);
        } else {
            await db.query("INSERT INTO remarks (proposal_criteria) VALUES (?)", [json]);
        }
    }

    // --- CASE 2: Save Final Report Criteria ---
    if (body.final_report_criteria) {
        const json = JSON.stringify(body.final_report_criteria);
        if (rowId) {
            await db.query("UPDATE remarks SET final_report_criteria = ? WHERE id = ?", [json, rowId]);
        } else {
            await db.query("INSERT INTO remarks (final_report_criteria) VALUES (?)", [json]);
        }
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully" });

  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}