import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import fs from "fs";
import path from "path";
import { withAuth } from "@/lib/auth";
import bcrypt from "bcrypt"; // 1. Import bcrypt

// ---------- GET OFFICER PROFILE ----------
export const GET = withAuth(async (req, { params }) => {
  const { id } = params;
  try {
    const db = await getDB();

    const [rows] = await db.query(
      `SELECT 
        u.id, u.name, u.phone, u.email, u.photo,
        o.faculty_id, o.department_id,
        f.name AS faculty_name, d.name AS department_name
      FROM user u
      LEFT JOIN officer o ON u.id = o.user_id
      LEFT JOIN faculty f ON o.faculty_id = f.id
      LEFT JOIN department d ON o.department_id = d.id
      WHERE u.id = ?`,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Officer not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("Error fetching profile:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

// ---------- UPDATE OFFICER PROFILE ----------
export const PUT = withAuth(async (req, { params }) => {
  const { id } = params;
  try {
    const db = await getDB();
    const formData = await req.formData();

    const name = formData.get("name");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const faculty_id = formData.get("faculty_id") || null;
    const department_id = formData.get("department_id") || null;
    const newPassword = formData.get("new_password");
    const confirmPassword = formData.get("confirm_password");
    const file = formData.get("photo");

    // --- 1. Handle Photo Upload ---
    const [old] = await db.query("SELECT photo FROM user WHERE id=?", [id]);
    let photoPath = old[0]?.photo || null;

    if (file && typeof file === "object") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const dir = path.join(process.cwd(), "public", "uploads", "profile", "profile_photo");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const ext = path.extname(file.name);
      // Using global crypto if available or simple random logic
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
      const filePath = path.join(dir, uniqueName);

      fs.writeFileSync(filePath, buffer);

      // Remove old photo if exists
      if (photoPath) {
        const oldPath = path.join(process.cwd(), "public", photoPath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      photoPath = `/uploads/profile/profile_photo/${uniqueName}`;
    }

    // --- 2. Update Basic User Info ---
    await db.query(
      "UPDATE user SET name=?, phone=?, email=?, photo=? WHERE id=?",
      [name, phone, email, photoPath, id]
    );

    // --- 3. Insert or Update Officer Info ---
    const [exists] = await db.query("SELECT id FROM officer WHERE user_id=?", [id]);
    if (exists.length) {
      await db.query(
        "UPDATE officer SET faculty_id=?, department_id=? WHERE user_id=?",
        [faculty_id, department_id, id]
      );
    } else {
      await db.query(
        "INSERT INTO officer (user_id, faculty_id, department_id) VALUES (?, ?, ?)",
        [id, faculty_id, department_id]
      );
    }

    // --- 4. Password Change with BCrypt ---
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await db.query("UPDATE user SET password=? WHERE id=?", [hashedPassword, id]);
    }

    // --- 5. Return Updated User ---
    const [updated] = await db.query(
      `SELECT 
        u.id, u.name, u.phone, u.email, u.photo,
        o.faculty_id, o.department_id,
        f.name AS faculty_name, d.name AS department_name
      FROM user u
      LEFT JOIN officer o ON u.id = o.user_id
      LEFT JOIN faculty f ON o.faculty_id = f.id
      LEFT JOIN department d ON o.department_id = d.id
      WHERE u.id=?`,
      [id]
    );

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error("Error updating officer:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});