import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const db = await getDB();
  // Find user with this token and status 0 (Inactive)
  const [users] = await db.query("SELECT id, name, email FROM user WHERE invite_token = ? AND status = 0", [token]);

  if (users.length === 0) {
    return NextResponse.json({ error: "Invalid Token" }, { status: 404 });
  }

  return NextResponse.json({ success: true, user: users[0] });
};