import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { withAuth } from "@/lib/auth";
import bcrypt from "bcrypt";
import {sendNewUserCredentials} from "@/lib/mail/mail";
// ---------- GET USER BY ID ----------
export const GET = withAuth(async (req, { params }) => {
  try {
    const db = await getDB();
    const userId = params.id;

    // 1. Base User Info
    const [users] = await db.query("SELECT * FROM user WHERE id = ?", [userId]);
    if (!users.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const user = users[0];
    delete user.password; 

    // 2. Researcher Details
    const [researcher] = await db.query(
      `SELECT r.*, f.name AS faculty_name, d.name AS department_name
       FROM researcher r
       LEFT JOIN faculty f ON r.faculty_id = f.id
       LEFT JOIN department d ON r.department_id = d.id
       WHERE r.user_id = ?`,
      [userId]
    );

    // 3. Reviewer Details
    // ✅ UPDATE: Join department -> faculty to get derived faculty name for internal reviewers
    const [reviewer] = await db.query(
      `SELECT 
         r.*, 
         d.name AS internal_department_name, 
         f.name AS internal_faculty_name
       FROM reviewer r
       LEFT JOIN department d ON r.department_id = d.id
       LEFT JOIN faculty f ON d.faculty_id = f.id 
       WHERE r.user_id = ?`,
      [userId]
    );

    return NextResponse.json({
      user,
      researcher: researcher[0] || null,
      reviewer: reviewer[0] || null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
});



// ---------- UPDATE USER ----------
export const PUT = withAuth(async (req, { params }) => {
  try {
    const db = await getDB();
    const userId = params.id;

    const formData = await req.formData();
    const updates = {};
    
    // Convert FormData to object
    formData.forEach((value, key) => {
      if (value !== "" && value !== "null" && value !== "undefined") {
        updates[key] = value;
      }
    });

    // ----- 1. Handle Photo Upload -----
    if (updates.photo && typeof updates.photo !== "string") {
      const buffer = Buffer.from(await updates.photo.arrayBuffer());
      const filename = `${Date.now()}-${updates.photo.name.replace(/\s/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/user");
      
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);
      updates.photo = `/uploads/user/${filename}`;
    } else {
      if (typeof updates.photo !== 'string') delete updates.photo;
    }

    // ----- 2. Handle Password Hashing & Capture Plain Text -----
    let plainPassword = null; 

    if (updates.password) {
      // ✅ Capture plain text BEFORE hashing for the email
      plainPassword = updates.password;

      const saltRounds = 10;
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    } else {
      delete updates.password; 
    }

    // ----- 3. Check & Validate Role Logic -----
    const [current] = await db.query("SELECT role FROM user WHERE id = ?", [userId]);
    if (!current.length) return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    const newRole = updates.role ? parseInt(updates.role) : current[0].role;
    const university = updates.university ? updates.university.trim() : "University of Barishal";
    const isInternal = university.toLowerCase() === "university of barishal";

    // Prevent External Users from being Researchers
    if (!isInternal && (newRole === 2 || newRole === 4)) {
        return NextResponse.json({ error: "External users cannot be assigned as Researchers." }, { status: 400 });
    }

    // ----- 4. Update 'user' Table -----
    const userFields = ["name", "email", "phone", "password", "photo", "role"];
    const userUpdateFields = userFields.filter((f) => f in updates);
    
    if (userUpdateFields.length) {
      const sql = `UPDATE user SET ${userUpdateFields.map((f) => `${f}=?`).join(", ")} WHERE id=?`;
      const values = userUpdateFields.map((f) => updates[f]);
      await db.query(sql, [...values, userId]);
    }

    // ----- 5. Update/Insert 'researcher' Table -----
    if (newRole === 2 || newRole === 4) {
      const [exists] = await db.query("SELECT id FROM researcher WHERE user_id=?", [userId]);
      const facultyId = updates.faculty_id || null;
      const deptId = updates.department_id || null;
      const designation = updates.designation || null;

      if (exists.length) {
        await db.query(
          `UPDATE researcher SET faculty_id=?, department_id=?, designation=?, updated_at=NOW() WHERE user_id=?`,
          [facultyId, deptId, designation, userId]
        );
      } else {
        await db.query(
          `INSERT INTO researcher (user_id, faculty_id, department_id, designation) VALUES (?, ?, ?, ?)`,
          [userId, facultyId, deptId, designation]
        );
      }
    }

    // ----- 6. Update/Insert 'reviewer' Table -----
    if (newRole === 3 || newRole === 4) {
      const [exists] = await db.query("SELECT id FROM reviewer WHERE user_id=?", [userId]);
      const designation = updates.designation || null;
      const internalDeptId = updates.department_id || null;
      const externalDeptText = updates.department_text || null;

      let sql = "";
      let params = [];

      if (exists.length) {
        if (isInternal) {
           sql = `UPDATE reviewer SET designation=?, department_id=?, department=NULL, university=? WHERE user_id=?`;
           params = [designation, internalDeptId, university, userId];
        } else {
           sql = `UPDATE reviewer SET designation=?, department_id=NULL, department=?, university=? WHERE user_id=?`;
           params = [designation, externalDeptText, university, userId];
        }
        await db.query(sql, params);

      } else {
        if (isInternal) {
           sql = `INSERT INTO reviewer (user_id, designation, department_id, department, university) VALUES (?, ?, ?, NULL, ?)`;
           params = [userId, designation, internalDeptId, university];
        } else {
           sql = `INSERT INTO reviewer (user_id, designation, department_id, department, university) VALUES (?, ?, NULL, ?, ?)`;
           params = [userId, designation, externalDeptText, university];
        }
        await db.query(sql, params);
      }
    }

    // ----- 7. Send New User Credentials Email (Only if password changed) -----
    
    if (plainPassword) {
      console.log("Sending updated credentials to:", updates.email);
      
      await sendNewUserCredentials({
        to: updates.email || current[0].email, // Use update email or fallback to existing
        name: updates.name || "User",
        password: plainPassword, // ✅ Send the plain text password captured earlier
      });
    }

    return NextResponse.json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
});