"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const STATUS_MAP = {
  0: "Rejected",
  1: "Proposal Submitted",
  2: "Under Review",
  3: "Accepted / Ongoing",
  4: "Report Submitted",
  5: "Completed",
};

const getStatusBadgeStyle = (statusCode) => {
  switch (Number(statusCode)) {
    case 0: return { bg: "bg-danger-subtle", text: "text-danger" };
    case 1: return { bg: "bg-primary-subtle", text: "text-primary" };
    case 2: return { bg: "bg-warning-subtle", text: "text-warning-emphasis" };
    case 3: return { bg: "bg-success-subtle", text: "text-success" };
    case 5: return { bg: "bg-dark-subtle", text: "text-dark" };
    default: return { bg: "bg-secondary-subtle", text: "text-secondary" };
  }
};

export default function ProjectDetailsView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/officer/projects/${id}`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="text-center mt-5 text-secondary">Loading...</div>;
  if (!data?.project) return <div className="text-center mt-5 text-danger">Project not found.</div>;

  const { project, proposal, final_report, proposal_review, final_report_review } = data;
  const statusStyle = getStatusBadgeStyle(project.status);

  // Helper to process keywords
  const problemDomainRaw = project.problem_domain || {};
  const keywords = Array.isArray(problemDomainRaw) 
    ? problemDomainRaw 
    : Object.values(problemDomainRaw);
  const hasKeywords = keywords.length > 0;

  // --- Helper Component to Render a Single Review Block ---
  const renderReview = (title, review) => {
    if (!review) return null;

    let details = [];
    try {
      // 1. Parse string if necessary
      let parsed = review.marks_breakdown;
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }

      // 2. Handle Object structure (Keys = Criteria, Value = {score, remark})
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        details = Object.entries(parsed).map(([key, val]) => ({
          criteria_name: key,
          marks: val.score,
          remarks: val.remark
        }));
      } 
      // 3. Handle Array structure (Legacy support)
      else if (Array.isArray(parsed)) {
        details = parsed;
      }
    } catch (error) {
      console.error("Error parsing review details:", error);
      details = [];
    }

    return (
      <div className="p-4 border-bottom last-border-0">
        <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-clipboard-check-fill"></i> {title}
        </h6>

        {/* 1. Header: Reviewer & Total Marks */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="small text-secondary fw-bold text-uppercase">Reviewer</label>
            <div className="fw-medium text-dark">{review.reviewer_name || "Unknown"}</div>
          </div>
          <div className="col-md-6">
            <label className="small text-secondary fw-bold text-uppercase">Total Score</label>
            <div className="fs-5 fw-bold text-dark">
              {review.total_marks !== undefined ? review.total_marks : "-"} / 100
            </div>
          </div>
        </div>

        {/* 2. Criteria Breakdown Table */}
        {details.length > 0 ? (
          <div className="mb-4">
            <label className="small text-secondary fw-bold text-uppercase mb-2">Evaluation Criteria</label>
            <div className="table-responsive border rounded-3 overflow-hidden">
              <table className="table table-sm table-striped mb-0 small align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '40%' }} className="ps-3 py-2">Criteria</th>
                    <th style={{ width: '10%' }} className="text-center py-2">Marks</th>
                    <th className="py-2">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((item, idx) => (
                    <tr key={idx}>
                      <td className="ps-3 fw-medium">{item.criteria_name || item.criteria || `Criterion ${idx+1}`}</td>
                      <td className="text-center fw-bold">{item.marks}</td>
                      <td className="text-secondary fst-italic">{item.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="alert alert-light border small text-muted mb-4">
            No detailed criteria breakdown available.
          </div>
        )}

        {/* 3. Overall Comments (Separate Row) */}
        <div>
          <label className="small text-secondary fw-bold text-uppercase mb-2">Overall Comments</label>
          <div className="bg-light p-3 rounded-3 border text-secondary small" style={{ minHeight: '60px', whiteSpace: 'pre-line' }}>
            {review.review_comments || "No general comments provided."}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid px-4 mt-5 mb-5">

      {/* --- HEADER --- */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <Link href="/officer/dashboard/projects" className="text-decoration-none text-secondary small fw-bold">
              &larr; BACK
            </Link>
            <span className={`badge rounded-pill fw-medium px-3 py-2 ${statusStyle.bg} ${statusStyle.text}`}>
              {STATUS_MAP[project.status]}
            </span>
          </div>
          <h2 className="fw-bold text-dark">{project.title}</h2>
          <p className="text-secondary">Code: <span className="fw-medium text-dark">{project.code_no || "N/A"}</span></p>
        </div>

        <Link
          href={`/officer/dashboard/projects/${id}/edit`}
          className="btn btn-primary px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2"
          style={{ backgroundColor: "#5c67f2", borderColor: "#5c67f2" }}
        >
          <i className="bi bi-pencil-square"></i> Manage Project
        </Link>
      </div>

      <div className="row g-4">

        {/* --- LEFT COLUMN (Main Content) --- */}
        <div className="col-lg-8">

          {/* 1. Project Info */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold text-dark mb-4">Project Information</h5>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="small text-secondary fw-bold text-uppercase">Researcher</label>
                  <div className="fw-medium text-dark">{project.researcher_name}</div>
                  <div className="small text-muted">{project.researcher_email}</div>
                </div>
                <div className="col-md-6">
                  <label className="small text-secondary fw-bold text-uppercase">Department</label>
                  <div className="fw-medium text-dark">{project.researcher_department}</div>
                  <div className="small text-muted">{project.researcher_faculty}</div>
                </div>
                <div className="col-md-6">
                  <label className="small text-secondary fw-bold text-uppercase">Fiscal Year</label>
                  <div className="fw-medium text-dark">{project.fiscal_year}</div>
                </div>
                <div className="col-md-6">
                  <label className="small text-secondary fw-bold text-uppercase">Submission Date</label>
                  <div className="fw-medium text-dark">{project.submission_date ? new Date(project.submission_date).toLocaleDateString() : "-"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Abstract & Problem Domain */}
          {(project.abstract || hasKeywords) && (
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold text-dark mb-4">Abstract & Details</h5>

                {/* Abstract */}
                {project.abstract && (
                  <div className="mb-4">
                    <label className="small text-primary fw-bold text-uppercase mb-2">Abstract</label>
                    <div className="bg-light p-3 rounded-3 text-dark small" style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                      {project.abstract}
                    </div>
                  </div>
                )}

                {/* Problem Domain - KEYWORDS */}
                {hasKeywords && (
                  <div>
                    <label className="small text-primary fw-bold text-uppercase mb-2">
                        Problem Domain (Keywords)
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                        {keywords.map((keyword, idx) => (
                            <span 
                                key={idx} 
                                className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fw-medium"
                                style={{ fontSize: "0.85rem" }}
                            >
                                {typeof keyword === 'string' ? keyword : JSON.stringify(keyword)}
                            </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Attached Files */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold text-dark mb-4">Attached Documents</h5>
              <div className="row g-4">
                {/* Proposal Files */}
                <div className="col-md-6">
                  <label className="small text-secondary fw-bold text-uppercase mb-2">Proposal Documents</label>
                  {proposal?.documents?.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {proposal.documents.map((doc, idx) => (
                        <a key={idx} href={doc.url} target="_blank" className="btn btn-outline-secondary text-start text-truncate">
                          <i className="bi bi-file-earmark-pdf me-2"></i>{doc.name}
                        </a>
                      ))}
                    </div>
                  ) : <div className="text-muted small fst-italic">No files available.</div>}
                </div>

                {/* Final Report Files */}
                <div className="col-md-6">
                  <label className="small text-secondary fw-bold text-uppercase mb-2">Final Report</label>
                  {final_report?.documents?.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {final_report.documents.map((doc, idx) => (
                        <a key={idx} href={doc.url} target="_blank" className="btn btn-outline-success text-start text-truncate">
                          <i className="bi bi-check-circle me-2"></i>{doc.name}
                        </a>
                      ))}
                    </div>
                  ) : <div className="text-muted small fst-italic">Not submitted yet.</div>}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Reviews Section */}
          {(proposal_review || final_report_review) && (
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-white border-bottom p-4">
                <h5 className="fw-bold mb-0 text-dark">Review Details</h5>
              </div>
              <div className="card-body p-0">
                {renderReview("Proposal Review", proposal_review)}
                {renderReview("Final Report Review", final_report_review)}
              </div>
            </div>
          )}

        </div>

        {/* --- RIGHT COLUMN (Finance) --- */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold text-dark mb-4">Budget</h5>
              <div className="mb-3 pb-3 border-bottom">
                <label className="small text-secondary fw-bold text-uppercase">Proposed</label>
                <div className="fs-4 fw-bold text-dark">৳ {Number(project.proposed_budget).toLocaleString()}</div>
              </div>
              <div>
                <label className="small text-secondary fw-bold text-uppercase">Allocated</label>
                {project.allocated_budget ? (
                  <div className="fs-4 fw-bold text-success">৳ {Number(project.allocated_budget).toLocaleString()}</div>
                ) : (
                  <div className="text-secondary fst-italic">Not allocated</div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}