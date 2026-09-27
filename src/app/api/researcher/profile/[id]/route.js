import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import fs from "fs";
import path from "path";
import { withAuth } from "@/lib/auth";
import bcrypt from "bcrypt";

// ---------- GET RESEARCHER PROFILE ----------
export const GET = withAuth(async (req, { params }) => {
  const { id } = await params; // user_id
  try {
    const db = await getDB();

    // Joins to get Faculty and Department names
    const [rows] = await db.query(
      `SELECT 
        u.id, u.name, u.phone, u.email, u.photo,
        r.designation, r.faculty_id, r.department_id,
        f.name AS faculty_name, d.name AS department_name
      FROM user u
      LEFT JOIN researcher r ON u.id = r.user_id
      LEFT JOIN faculty f ON r.faculty_id = f.id
      LEFT JOIN department d ON r.department_id = d.id
      WHERE u.id = ?`,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Researcher not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("Error fetching researcher profile:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

// ---------- UPDATE RESEARCHER PROFILE ----------
export const PUT = withAuth(async (req, { params }) => {
  const { id } = await params; // user_id
  try {
    const db = await getDB();
    const formData = await req.formData();

    // Extract allowed fields
    const name = formData.get("name");
    const phone = formData.get("phone");
    const email = formData.get("email");
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
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
      const filePath = path.join(dir, uniqueName);

      fs.writeFileSync(filePath, buffer);

      // Clean up old photo
      if (photoPath) {
        const oldPath = path.join(process.cwd(), "public", photoPath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      photoPath = `/uploads/profile/profile_photo/${uniqueName}`;
    }

    // --- 2. Update Common User Info (Email, Password, Photo) ---
    // Note: We use the 'name' & 'phone' from formData to keep 'user' table redundant columns in sync
    let userUpdateQuery = "UPDATE user SET name=?, phone=?, email=?, photo=?";
    const userParams = [name, phone, email, photoPath];

    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      userUpdateQuery += ", password=?";
      userParams.push(hashedPassword);
    }

    userUpdateQuery += " WHERE id=?";
    userParams.push(id);

    await db.query(userUpdateQuery, userParams);



    // --- 4. Return Updated Data ---
    const [updated] = await db.query(
      `SELECT 
        u.id, u.name, u.phone, u.email, u.photo,
        r.designation, r.faculty_id, r.department_id,
        f.name AS faculty_name, d.name AS department_name
      FROM user u
      LEFT JOIN researcher r ON u.id = r.user_id
      LEFT JOIN faculty f ON r.faculty_id = f.id
      LEFT JOIN department d ON r.department_id = d.id
      WHERE u.id=?`,
      [id]
    );

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error("Error updating researcher:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});