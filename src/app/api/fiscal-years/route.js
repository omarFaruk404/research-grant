import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDB();
    const [rows] = await db.query(
      "SELECT id, year_label, is_active, created_at FROM fiscal_year ORDER BY created_at DESC"
    );
    return Response.json(rows);
  } catch (err) {
    console.error("Error fetching fiscal years:", err);
    return Response.json([], { status: 500 });
  }
}

export async function POST(req) {
  try {
    const db = await getDB();
    const { year_label, is_active = 0 } = await req.json();

    if (!year_label || year_label.trim() === "") {
      return Response.json({ error: "Year label is required" }, { status: 400 });
    }

    const [result] = await db.execute(
      "INSERT INTO fiscal_year (year_label, is_active) VALUES (?, ?)",
      [year_label, is_active]
    );

    const [newYear] = await db.query(
      "SELECT id, year_label, is_active, created_at FROM fiscal_year WHERE id = ?",
      [result.insertId]
    );

    return Response.json(newYear[0]);
  } catch (err) {
    console.error("Error adding fiscal year:", err);
    return Response.json({ error: "Failed to add fiscal year" }, { status: 500 });
  }
}
