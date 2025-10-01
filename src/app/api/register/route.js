import { NextResponse } from "next/server";

import { getDB, initDB } from "@/lib/db";

export async function POST(req) {
  try {
    await initDB(); // make sure DB exists
    const pool = await getDB();

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // hash password


    // insert into DB
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, email, password, role]
    );

    return NextResponse.json({ success: true, userId: result.insertId });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
