"use client";
import { useParams } from "next/navigation";
import Link from "next/link";

// Dummy data for report details
const dummyReports = [
  {
    id: 1,
    project_id: 101,
    project_title: "AI in Healthcare",
    project_description: "Using AI to improve diagnosis and patient outcomes.",
    fiscal_year: "2025",
    status: "Reviewed",
    reviewer_name: "Dr. Sarah Lee",
    submitted_at: "2025-08-01",
    final_report_file: "/files/ai-healthcare-final.pdf",
    reviewer_comments: "Well-written report. Strong evidence, clear results.",
    reviewer_marks: {
      feasibility: 18,
      impact: 19,
      usefulness: 17,
      methodology: 18,
      clarity: 19,
    },
  },
  {
    id: 2,
    project_id: 202,
    project_title: "Climate Change Impact Study",
    project_description: "Studying rising sea levels and effects on agriculture.",
    fiscal_year: "2024",
    status: "Pending Review",
    reviewer_name: null,
    submitted_at: "2024-07-12",
    final_report_file: "/files/climate-change-final.pdf",
    reviewer_comments: null,
    reviewer_marks: null,
  },
];

export default function ReportDetailsPage() {
  const { id } = useParams();
  const report = dummyReports.find((r) => r.id === Number(id));

  if (!report) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Report not found</div>
        <Link href="/researcher/dashboard/my-reports" className="btn btn-secondary">
          Back
        </Link>
      </div>
    );
  }

  const totalMarks = report.reviewer_marks
    ? Object.values(report.reviewer_marks).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="container mt-4">
      <h2>Final Report Details</h2>

      <div className="card mt-3">
        <div className="card-body">
          <p><strong>Project Title:</strong> {report.project_title}</p>
          <p><strong>Description:</strong> {report.project_description}</p>
          <p><strong>Fiscal Year:</strong> {report.fiscal_year}</p>
          <p><strong>Status:</strong> {report.status}</p>
          <p><strong>Reviewer:</strong> {report.reviewer_name || "Not Assigned"}</p>
          <p><strong>Submitted At:</strong> {report.submitted_at}</p>
          <p>
            <strong>Final Report File:</strong>{" "}
            <a href={report.final_report_file} target="_blank">
              Download
            </a>
          </p>
        </div>
      </div>

      {/* Reviewer Section */}
      {report.status !== "Pending Review" && (
        <div className="card mt-4">
          <div className="card-header">Reviewer Feedback</div>
          <div className="card-body">
            <p><strong>Comments:</strong> {report.reviewer_comments}</p>

            {/* Marks Table */}
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Marks (out of 20)</th>
                </tr>
              </thead>
              <tbody>
                {report.reviewer_marks &&
                  Object.entries(report.reviewer_marks).map(([category, marks]) => (
                    <tr key={category}>
                      <td>{category}</td>
                      <td>{marks}</td>
                    </tr>
                  ))}
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>{totalMarks} / 100</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Link href="/researcher/dashboard/my-reports" className="btn btn-secondary mt-3">
        Back to My Reports
      </Link>
    </div>
  );
}
