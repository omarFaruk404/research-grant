"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  projectReports,
  projects,
  projectReviews,
  users,
} from "@/lib/dummy";

export default function ReportDetailPage() {
  const params = useParams();
  const { id } = params;
  const report = projectReports.find((r) => r.id === Number(id));

  if (!report) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Report not found.</div>
        <Link href="/officer/dashboard/reports" className="btn btn-secondary">
          Back to Reports
        </Link>
      </div>
    );
  }

  const project = projects.find((p) => p.id === report.project_id);
  const review = projectReviews.find((rev) => rev.project_id === project?.id);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Report Details</h2>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">{report.name}</h5>
          <p>
            <strong>Project:</strong> {project?.title}
          </p>
          <p>
            <strong>Researcher:</strong> {project?.researcher?.name} (
            {project?.researcher?.designation})
          </p>
          <p>
            <strong>Fiscal Year:</strong> {project?.fiscal_year}
          </p>
          <p>
            <strong>Uploaded By:</strong> {report.uploaded_by}
          </p>
          <p>
            <strong>Uploaded At:</strong> {report.uploaded_at}
          </p>
          <p>
            <a href={report.url} className="btn btn-sm btn-outline-primary" target="_blank">
              View Report File
            </a>
          </p>
        </div>
      </div>

      <h5>Reviewer Information</h5>
      {review ? (
        <div className="alert alert-success">
          <p>
            <strong>Reviewer:</strong> {review.reviewer_name}
          </p>
          <p>
            <strong>Status:</strong> {review.status}
          </p>
          <p>
            <strong>Comments:</strong> {review.review_comments}
          </p>
          <p>
            <strong>Total Marks:</strong> {review.total_marks}
          </p>
        </div>
      ) : (
        <div className="alert alert-warning">
          No review submitted yet. You can send this report for review.
        </div>
      )}

      <div className="mt-4">
        {!review ? (
          <button className="btn btn-primary">Send for Review</button>
        ) : (
          <button className="btn btn-success">Mark Project as Completed</button>
        )}
        <Link
          href="/officer/dashboard/reports"
          className="btn btn-secondary ms-2"
        >
          Back
        </Link>
      </div>
    </div>
  );
}
