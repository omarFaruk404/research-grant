import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const PUT = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const { is_active, year_label } = await req.json();
    const db = await getDB();

    // 1. Handle "Toggle Active Status"
    if (typeof is_active === "number") {
      // REMOVED: The block that deactivated all other years.
      // Now, simply update the specific ID.
      
      await db.query(
        "UPDATE fiscal_year SET is_active = ? WHERE id = ?", 
        [is_active, id]
      );
    }

    // 2. Handle "Edit Label"
    if (year_label !== undefined && year_label.trim() !== "") {
      await db.query(
        "UPDATE fiscal_year SET year_label = ? WHERE id = ?",
        [year_label, id]
      );
    }

    // 3. Return the updated record
    const [updated] = await db.query("SELECT * FROM fiscal_year WHERE id = ?", [id]);

    if (!updated || updated.length === 0) {
        return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error("Error updating fiscal year:", error);
    return NextResponse.json({ error: "Failed to update fiscal year" }, { status: 500 });
  }
});