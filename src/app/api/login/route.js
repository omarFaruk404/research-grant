import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { SignJWT } from "jose"; 
import bcrypt from "bcrypt"; 

// 2. Define Secret
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function POST(req) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password and role are required" },
        { status: 400 }
      );
    }

    const db = await getDB();

    // 🔍 Step 1: Load user by EMAIL ONLY
    const [users] = await db.query(
      `SELECT 
          u.*,
          o.id  AS officer_id,
          r.id  AS researcher_id,
          rv.id AS reviewer_id
        FROM user u
        LEFT JOIN officer    o  ON u.id = o.user_id
        LEFT JOIN researcher r  ON u.id = r.user_id
        LEFT JOIN reviewer   rv ON u.id = rv.user_id
        WHERE u.email = ?
        LIMIT 1`,
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = users[0];

    // 🔒 Step 2: Verify Password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 🎯 Map requested role string → numeric code
    let requestedRoleNumber;
    if (role === "officer") requestedRoleNumber = 1;
    else if (role === "researcher") requestedRoleNumber = 2;
    else if (role === "reviewer") requestedRoleNumber = 3;
    else {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const dbRole = user.role; 

    // ✅ Check if user is allowed to login as requested role
    let allowed = false;

    if (requestedRoleNumber === 1 && dbRole === 1) {
      allowed = true;
    } else if (
      requestedRoleNumber === 2 &&
      (dbRole === 2 || dbRole === 4) 
    ) {
      allowed = true;
    } else if (
      requestedRoleNumber === 3 &&
      (dbRole === 3 || dbRole === 4) 
    ) {
      allowed = true;
    }

    if (!allowed) {
      return NextResponse.json(
        { error: `You are not registered as ${role}` },
        { status: 403 }
      );
    }

    // 🔁 Map numeric → current_role string
    let currentRoleString = "researcher";
    if (requestedRoleNumber === 1) currentRoleString = "officer";
    else if (requestedRoleNumber === 2) currentRoleString = "researcher";
    else if (requestedRoleNumber === 3) currentRoleString = "reviewer";

    // 🔹 3. GENERATE JWT TOKEN
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('100y') // ✅ UPDATED: Set to 100 years (effectively infinite)
    .sign(SECRET_KEY);

    // ✅ Success: return token + user info
    return NextResponse.json({
      token, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_photo: user.photo,
        role: dbRole,                
        current_role: currentRoleString,
        officer_id: user.officer_id || null,
        researcher_id: user.researcher_id || null,
        reviewer_id: user.reviewer_id || null,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}