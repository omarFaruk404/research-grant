import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { withAuth } from "@/lib/auth";
import bcrypt from "bcrypt"; 
import { sendNewUserCredentials } from "@/lib/mail/mail"; // ✅ 1. Import Mailer

export const POST = withAuth(async (req) => {
  try {
    const db = await getDB();
    const formData = await req.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const password = formData.get("password"); // Plain text password
    
    // Support both numeric and string roles
    const roleInput = formData.get("role"); 
    const role = isNaN(parseInt(roleInput)) ? roleInput : parseInt(roleInput);

    const designation = formData.get("designation");
    const facultyId = formData.get("faculty_id");
    const departmentId = formData.get("department_id");
    const university = formData.get("university")?.trim();
    
    const departmentText = formData.get("department_text")?.trim() || formData.get("department_name")?.trim() || null;

    // 🔒 Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 🖼️ Handle optional photo upload
    let photoPath = null;
    const file = formData.get("photo");
    if (file && file.size > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads/user");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      photoPath = `/uploads/user/${fileName}`;
    }

    // 🧍 Insert base user with HASHED PASSWORD
    const [userResult] = await db.query(
      "INSERT INTO user (name, phone, email, password, role, photo) VALUES (?, ?, ?, ?, ?, ?)",
      [name, phone, email, hashedPassword, roleInput, photoPath] 
    );
    const userId = userResult.insertId;

    // ---------------------------------------------------------
    // 👩‍🔬 RESEARCHER ROLE (Role 2 or 4)
    // ---------------------------------------------------------
    if (role === 2 || role === 4 || role === "researcher" || role === "both") {
      await db.query(
        "INSERT INTO researcher (user_id, faculty_id, department_id, designation) VALUES (?, ?, ?, ?)",
        [userId, facultyId || null, departmentId || null, designation || null]
      );
    }

    // ---------------------------------------------------------
    // 🧑‍🏫 REVIEWER ROLE (Role 3 or 4)
    // ---------------------------------------------------------
    if (role === 3 || role === 4 || role === "reviewer" || role === "both") {
      
      const isInternal = university?.toLowerCase() === "university of barishal";

      if (isInternal) {
        // ✅ Internal: Insert 'department_id', set 'department' (text) to NULL
        await db.query(
          "INSERT INTO reviewer (user_id, designation, department_id, department, university) VALUES (?, ?, ?, NULL, ?)",
          [userId, designation || null, departmentId || null, university]
        );
      } else {
        // 🌍 External: Insert 'department' (text), set 'department_id' to NULL
        await db.query(
          "INSERT INTO reviewer (user_id, designation, department_id, department, university) VALUES (?, ?, NULL, ?, ?)",
          [userId, designation || null, departmentText, university]
        );
      }
    }

    // ✅ SEND CREDENTIALS EMAIL
    // We send the PLAIN text password so the user can log in.
    if (email) {
      console.log(`Sending credentials to ${email}...`);
      await sendNewUserCredentials({
        to: email,
        name: name,
        password: password 
      });
    }

    return NextResponse.json({
      success: true,
      message: "User added and email sent successfully",
      user_id: userId,
    });

  } catch (err) {
    console.error("Error adding user:", err);
    // Return detailed error for debugging if needed (e.g., Duplicate entry)
    return NextResponse.json({ error: err.message || "Failed to add user" }, { status: 500 });
  }
});