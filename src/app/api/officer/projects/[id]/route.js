import { getDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(req, { params }) {
  try {
    const db = await getDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "officer") {

      return NextResponse.redirect(
        new URL(`/${decoded.role}/dashboard`, req.url)
      );
    }
    // Get project info
    const [projects] = await db.query(
      `SELECT rp.id, rp.title, rp.description, rp.status, 
              u.name as researcher_name, rp.required_funds
       FROM research_projects rp
       JOIN users u ON rp.researcher_id = u.id
       WHERE rp.id = ?`,
      [params.id]
    );

    if (!projects.length) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projects[0];

    // Get uploaded files
    const [files] = await db.query(
      `SELECT id, file_path, file_type, uploaded_at 
       FROM project_files 
       WHERE project_id = ?`,
      [params.id]
    );

    // Get review if exists
const [reviews] = await db.query(
  `SELECT r.id, 
          r.feasibility_score, 
          r.impact_score, 
          r.importance_score, 
          r.innovation_score, 
          r.completeness_score, 
          r.total_score, 
          r.comments, 
          u.name AS reviewer_name
   FROM reviews r
   JOIN users u ON r.reviewer_id = u.id
   WHERE r.project_id = ?`,
  [params.id]
);


    return Response.json({
      ...project,
      files,
      review: reviews.length ? reviews[0] : null,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}
