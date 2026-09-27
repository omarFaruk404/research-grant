import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import fs from "fs";
import path from "path";
import { withAuth } from "@/lib/auth";
import bcrypt from "bcrypt";

// ---------- GET REVIEWER PROFILE ----------
export const GET = withAuth(async (req, { params }) => {
  const { id } = await params;
  try {
    const db = await getDB();

    // ✅ FIXED QUERY: Join faculty via department for internal reviewers
    const [rows] = await db.query(
      `SELECT 
        u.id, u.name, u.phone, u.email, u.photo,
        r.designation, r.department_id, r.department AS external_department_name, r.university,
        d.name AS internal_department_name,
        f.name AS faculty_name
      FROM user u
      LEFT JOIN reviewer r ON u.id = r.user_id
      LEFT JOIN department d ON r.department_id = d.id  -- Join dept using ID
      LEFT JOIN faculty f ON d.faculty_id = f.id        -- Join faculty using Dept's faculty_id
      WHERE u.id = ?`,
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Reviewer not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("Error fetching reviewer profile:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

// ---------- UPDATE REVIEWER PROFILE ----------
export const PUT = withAuth(async (req, { params }) => {
  const { id } = await params;
  try {
    const db = await getDB();
    const formData = await req.formData();

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

      if (photoPath) {
        const oldPath = path.join(process.cwd(), "public", photoPath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      photoPath = `/uploads/profile/profile_photo/${uniqueName}`;
    }

    // --- 2. Update Common User Info ---
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

    // --- 3. Update Reviewer Specific Info ---
    // ❌ EXCLUDED: designation, department_id, department, university
    // Just ensuring the row exists/is touched if needed, typically unnecessary if only user table changes.
    // We execute a dummy update to validate the user_id exists in the reviewer table.
    await db.query("UPDATE reviewer SET user_id=? WHERE user_id=?", [id, id]);

    // --- 4. Return Updated Data ---
    const [updated] = await db.query(
      `SELECT 
        u.id, u.name, u.phone, u.email, u.photo,
        r.designation, r.department_id, r.department AS external_department_name, r.university,
        d.name AS internal_department_name,
        f.name AS faculty_name
      FROM user u
      LEFT JOIN reviewer r ON u.id = r.user_id
      LEFT JOIN department d ON r.department_id = d.id
      LEFT JOIN faculty f ON d.faculty_id = f.id
      WHERE u.id=?`,
      [id]
    );

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error("Error updating reviewer:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});