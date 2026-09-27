import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { withAuth } from "@/lib/auth";          


export const POST = withAuth(async (req, { params }) => {
    try {
        const db = await getDB();

        // Parse FormData
        const formData = await req.formData();
        const file = formData.get("file");
        const uploadedBy = formData.get("uploaded_by");

        if (!file || !uploadedBy) {
            return NextResponse.json(
                { error: "File and uploaded_by are required" },
                { status: 400 }
            );
        }

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), "public", "uploads", "reports");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Save file
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = path.join(uploadDir, fileName);
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        const dbPath = `/uploads/reports/${fileName}`;

        // Debug values
        console.log("Inserting into project_report:", {
            project_id: params.id,
            fileName,
            dbPath,
            uploadedBy
        });

        // Insert record into DB
        const [result] = await db.query(
            `INSERT INTO project_report 
   (project_id, status, type, name, url, uploaded_by) 
   VALUES (?, 1, 'final_report', ?, ?, ?)`,
            [params.id, fileName, dbPath, uploadedBy]
        );


        console.log("Insert result:", result);

        // Update project status
        await db.query(
            `UPDATE project SET status = 4, updated_at = NOW() WHERE id = ?`,
            [params.id]
        );
        console.log("Project status updated to 4 for project:", params.id);

        return NextResponse.json({
            success: true,
            report_id: result.insertId,
            file_url: dbPath,
            new_status: 4,
        });
    } catch (err) {
        console.error("Failed to upload final report:", err.message);
        if (err.sqlMessage) console.error("SQL Error:", err.sqlMessage);
        return NextResponse.json(
            { error: "Failed to upload final report", details: err.sqlMessage },
            { status: 500 }
        );
    }
}
)