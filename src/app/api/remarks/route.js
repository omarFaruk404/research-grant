import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req) => {
  try {
    const db = await getDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'proposal' or 'final_report'

    // Fetch the latest configuration row
    const [rows] = await db.execute(`
      SELECT proposal_criteria, final_report_criteria 
      FROM remarks 
      ORDER BY id DESC 
      LIMIT 1
    `);

    if (!rows.length) {
      return NextResponse.json(
        { error: "No criteria configuration found." }, 
        { status: 404 }
      );
    }

    const config = rows[0];

    // Helper to safely parse JSON from DB
    const parseCriteria = (jsonString) => {
      try {
        return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      } catch (e) {
        console.error("JSON Parse Error:", e);
        return [];
      }
    };

    const proposalCriteria = parseCriteria(config.proposal_criteria);
    const finalReportCriteria = parseCriteria(config.final_report_criteria);

    // 1. Return specific type if requested
    if (type === "proposal") {
      return NextResponse.json({
        success: true,
        type: "proposal",
        criteria: proposalCriteria
      });
    }

    if (type === "final_report") {
      return NextResponse.json({
        success: true,
        type: "final_report",
        criteria: finalReportCriteria
      });
    }
    console.log({proposal_criteria: proposalCriteria, finalReport_criteria: finalReportCriteria});
    // 2. Return both if no type specified
    return NextResponse.json({
      success: true,
      proposal_criteria: proposalCriteria,
      final_report_criteria: finalReportCriteria
    });

  } catch (error) {
    console.error("Error fetching remarks criteria:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
})