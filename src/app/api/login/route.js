import { NextResponse } from "next/server";

import jwt from "jsonwebtoken";
import { getDB, initDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // put in .env

export async function POST(req) {
  try {
    await initDB();
    const pool = await getDB();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // find user
    const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = rows[0];

    // check password
    if (password !== user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // set as httpOnly cookie
    const res = NextResponse.json({ success: true, role: user.role });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
