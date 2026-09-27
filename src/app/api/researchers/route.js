import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDB(); // Ensure db connection is awaited if needed
    const [rows] = await db.query(`
      SELECT r.id, u.name
      FROM researcher r
      JOIN user u ON r.user_id = u.id
      WHERE u.role IN (2, 4)
      ORDER BY u.name ASC
    `);
    return Response.json(rows);
  } catch (err) {
    console.error("Error fetching researchers:", err);
    return Response.json([], { status: 500 });
  }
}