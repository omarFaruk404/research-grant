import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

// ---------- GET: Fetch All Faculties & Departments ----------
export const GET = withAuth(async (req) => {
  try {
    const db = await getDB();
    const [faculties] = await db.query("SELECT * FROM faculty ORDER BY name");
    const [departments] = await db.query("SELECT * FROM department ORDER BY name");
    return NextResponse.json({ faculties, departments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
});

// ---------- POST: Add New Entry ----------
export const POST = withAuth(async (req) => {
  try {
    const db = await getDB();
    const { type, name, faculty_id } = await req.json();

    if (type === "faculty") {
      await db.query("INSERT INTO faculty (name) VALUES (?)", [name]);
      return NextResponse.json({ message: "Faculty added successfully" });
    }

    if (type === "department") {
      if (!faculty_id)
        return NextResponse.json({ error: "Faculty ID is required" }, { status: 400 });
      await db.query("INSERT INTO department (faculty_id, name) VALUES (?, ?)", [
        faculty_id,
        name,
      ]);
      return NextResponse.json({ message: "Department added successfully" });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add entry" }, { status: 500 });
  }
});

// ---------- PUT: Update Existing Entry ----------
export const PUT = withAuth(async (req) => {
  try {
    const db = await getDB();
    const { id, type, name, faculty_id } = await req.json();

    if (!id || !name) {
      return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });
    }

    // 1. Update Faculty
    if (type === "faculty") {
      await db.query("UPDATE faculty SET name = ? WHERE id = ?", [name, id]);
      return NextResponse.json({ message: "Faculty updated successfully" });
    }

    // 2. Update Department
    if (type === "department") {
      if (!faculty_id) {
        return NextResponse.json({ error: "Faculty ID is required for departments" }, { status: 400 });
      }
      
      await db.query(
        "UPDATE department SET name = ?, faculty_id = ? WHERE id = ?", 
        [name, faculty_id, id]
      );
      return NextResponse.json({ message: "Department updated successfully" });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
});