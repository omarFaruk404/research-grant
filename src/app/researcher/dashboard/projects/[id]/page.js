"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Project Status Configuration
const PROJECT_STATUS_MAP = {
  0: { label: "Rejected", class: "bg-danger-subtle text-danger" },
  1: { label: "Proposal Submitted", class: "bg-primary-subtle text-primary" },
  2: { label: "Proposal Under Review", class: "bg-warning-subtle text-warning-emphasis" },
  3: { label: "Accepted / Ongoing", class: "bg-success-subtle text-success" },
  4: { label: "Project Report Submitted", class: "bg-info-subtle text-info-emphasis" },
  5: { label: "Project Completed", class: "bg-secondary-subtle text-secondary" },
};

// Report Status Helper
const getReportStatusInfo = (status) => {
  switch (status) {
    case 1: return { label: "Submitted", color: "text-primary", bg: "bg-primary-subtle", border: "border-primary" };
    case 2: return { label: "Under Review", color: "text-warning-emphasis", bg: "bg-warning-subtle", border: "border-warning" };
    case 3: return { label: "Accepted", color: "text-success", bg: "bg-success-subtle", border: "border-success" };
    case 4: return { label: "Rejected", color: "text-danger", bg: "bg-danger-subtle", border: "border-danger" };
    default: return { label: "Unknown", color: "text-secondary", bg: "bg-light", border: "border-secondary" };
  }
};

const REVIEW_TYPE_MAP = {
  1: "Proposal Review",
  2: "Final Report Review",
};

export default function ResearcherProjectDetails() {
  const { id } = useParams();
  const router = useRouter();
  
  const [project, setProject] = useState(null);
  const [proposalFiles, setProposalFiles] = useState([]);
  const [finalReportFiles, setFinalReportFiles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!storedUser) { setLoading(false); return; }

    try {
      const parsed = JSON.parse(storedUser);
      if (!parsed.researcher_id) { setLoading(false); return; }

      async function fetchProject() {
        try {
          const res = await fetch(`/api/researcher/projects/${id}?researcher_id=${parsed.researcher_id}`);
          const data = await res.json();

          if (!res.ok) {
            console.error(data.error || "Failed to load project");
            setProject(null);
          } else {
            setProject(data.project);
            setProposalFiles(data.proposal_documents || []);
            setFinalReportFiles(data.final_report_documents || []);
            setReviews(data.reviews || []);
          }
        } catch (err) {
          console.error("Error loading project:", err);
        } finally {
          setLoading(false);
        }
      }
      fetchProject();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [id]);

  // Helpers
  const parseBreakdown = (jsonString) => {
    try {
        return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString || {};
    } catch (e) {
        return {};
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getReviewStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'accepted') return 'bg-success';
    if (s === 'rejected') return 'bg-danger';
    if (s === 'submitted') return 'bg-primary';
    return 'bg-secondary';
  };

  if (loading) return <div className="d-flex justify-content-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!project) return <p className="text-center mt-5 text-danger fw-bold">Project not found</p>;

  const projectStatusInfo = PROJECT_STATUS_MAP[project.status] || { label: "Unknown", class: "bg-light text-secondary" };
  const isEditable = project.status !== 5;
  const finalReportStatus = finalReportFiles.length > 0 ? finalReportFiles[0].status : null;
  const reportStatusUI = getReportStatusInfo(finalReportStatus);

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* 1. NAVIGATION BAR */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button 
            onClick={() => router.back()} 
            className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 fw-medium"
        >
            <i className="bi bi-arrow-left"></i> Back
        </button>

        {isEditable ? (
            <Link href={`/researcher/dashboard/projects/${id}/edit`} className="btn btn-primary d-flex align-items-center gap-2 px-4 fw-bold shadow-sm">
                <i className="bi bi-pencil-square"></i> Edit Project
            </Link>
        ) : (
            <button className="btn btn-secondary d-flex align-items-center gap-2 px-4 fw-bold" disabled title="Project is completed.">
                <i className="bi bi-lock-fill"></i> Edit Project (Locked)
            </button>
        )}
      </div>

      {/* 2. PROJECT HEADER CARD */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div className="card-header bg-white p-4 border-bottom">
            <div className="d-flex justify-content-between align-items-start">
                <div>
                    <h5 className="text-muted small text-uppercase fw-bold mb-1">Project Details</h5>
                    <h2 className="fw-bold text-dark mb-0">{project.title}</h2>
                </div>
                <span className={`badge rounded-pill px-3 py-2 fw-bold ${projectStatusInfo.class}`}>
                    {projectStatusInfo.label}
                </span>
            </div>
        </div>
        <div className="card-body p-4">
            <div className="row g-4">
                <div className="col-md-3">
                    <div className="p-3 bg-light rounded-3 h-100">
                        <small className="text-secondary text-uppercase fw-bold">Project Code</small>
                        <div className="fw-bold text-dark fs-5 mt-1">{project.code_no || "N/A"}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="p-3 bg-light rounded-3 h-100">
                        <small className="text-secondary text-uppercase fw-bold">Fiscal Year</small>
                        <div className="fw-bold text-dark fs-5 mt-1">{project.fiscal_year}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="p-3 bg-light rounded-3 h-100">
                        <small className="text-secondary text-uppercase fw-bold">Proposed Budget</small>
                        <div className="fw-bold text-dark fs-5 mt-1">{formatCurrency(project.proposed_budget)}</div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="p-3 bg-light rounded-3 h-100">
                        <small className="text-secondary text-uppercase fw-bold">Allocated Budget</small>
                        <div className="fw-bold text-success fs-5 mt-1">{formatCurrency(project.allocated_budget)}</div>
                    </div>
                </div>
                <div className="col-12">
                    <h6 className="fw-bold text-secondary">Description / Comments</h6>
                    <div className="p-3 border rounded-3 bg-white text-muted">
                        {project.abstract || "No description provided."}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 3. DOCUMENTS ROW */}
      <div className="row g-4 mb-5">
        {/* Proposal Files */}
        <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-white p-3 border-bottom border-primary border-opacity-25">
                    <h5 className="fw-bold mb-0 text-primary">Proposal Documents</h5>
                </div>
                <div className="card-body p-3">
                    {proposalFiles.length > 0 ? (
                        <div className="d-flex flex-column gap-2">
                            {proposalFiles.map((file, idx) => (
                                <div key={idx} className="d-flex align-items-center justify-content-between p-2 border rounded bg-primary-subtle bg-opacity-10">
                                    <div className="overflow-hidden">
                                        <div className="fw-bold text-truncate" style={{maxWidth: '300px'}} title={file.name}>{file.name}</div>
                                        <small className="text-muted" style={{fontSize: '0.75rem'}}>{formatDate(file.uploaded_at)}</small>
                                    </div>
                                    <a href={file.url} target="_blank" className="btn btn-sm btn-outline-primary bg-white">View</a>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-muted small fst-italic">No proposal documents found.</p>}
                </div>
            </div>
        </div>

        {/* Final Report Files */}
        <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className={`card-header bg-white p-3 border-bottom ${reportStatusUI.border} border-opacity-50 d-flex justify-content-between align-items-center`}>
                    <h5 className={`fw-bold mb-0 ${reportStatusUI.color}`}>Final Report Documents</h5>
                    {finalReportStatus && (
                        <span className={`badge rounded-pill ${reportStatusUI.bg} ${reportStatusUI.color} border ${reportStatusUI.border}`}>
                            {reportStatusUI.label}
                        </span>
                    )}
                </div>
                <div className="card-body p-3">
                    {finalReportFiles.length > 0 ? (
                        <div className="d-flex flex-column gap-2">
                            {finalReportFiles.map((file, idx) => (
                                <div key={idx} className={`d-flex align-items-center justify-content-between p-2 border rounded ${reportStatusUI.bg} bg-opacity-10`}>
                                    <div className="overflow-hidden">
                                        <div className="fw-bold text-dark text-truncate" style={{maxWidth: '300px'}} title={file.name}>{file.name}</div>
                                        <small className="text-muted" style={{fontSize: '0.75rem'}}>{formatDate(file.uploaded_at)}</small>
                                    </div>
                                    <a href={file.url} target="_blank" className={`btn btn-sm btn-outline-${reportStatusUI.color.replace('text-', '')} bg-white`}>View</a>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-muted small fst-italic">No final report submitted yet.</p>}
                </div>
            </div>
        </div>
      </div>

      {/* 4. REVIEWS SECTIONS */}
      <h4 className="fw-bold text-dark mb-3">Evaluations & Reviews</h4>
      
      {reviews.length === 0 ? (
        <div className="alert alert-light text-center p-5 shadow-sm rounded-4">
            <div className="mb-2 text-muted opacity-50"><i className="bi bi-clipboard-x fs-1"></i></div>
            <p className="text-muted mb-0">No reviews recorded yet.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-5">
            {reviews.map((rev) => {
                const breakdown = parseBreakdown(rev.marks_breakdown);
                const criteriaList = Object.keys(breakdown);
                const reviewTitle = rev.review_type ? REVIEW_TYPE_MAP[rev.review_type] : "Review";
                const reviewStatus = rev.status || "Submitted";
                const badgeColor = getReviewStatusColor(reviewStatus);

                return (
                    <div key={rev.id} className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        {/* Review Header */}
                        <div className="card-header bg-primary text-white py-3 px-4 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-3">
                                <span className="fw-bold small text-uppercase">
                                    <i className="bi bi-person-check-fill me-2"></i> {reviewTitle}
                                </span>
                                <span className={`badge rounded-pill ${badgeColor} text-uppercase`} style={{fontSize: '0.7rem'}}>
                                    {reviewStatus}
                                </span>
                            </div>
                            <small className="opacity-75">{formatDate(rev.submitted_at)}</small>
                        </div>
                        
                        <div className="card-body p-4">
                            {/* SECTION 1: Grading Table */}
                            <div className="mb-4">
                                <h6 className="fw-bold text-secondary text-uppercase small mb-3">
                                    <i className="bi bi-calculator me-2"></i> Grading Sheet
                                </h6>
                                
                                <div className="table-responsive border rounded-3">
                                    <table className="table table-striped align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{width: '40%'}} className="ps-3 py-2 text-secondary small text-uppercase">Criteria</th>
                                                <th style={{width: '15%'}} className="text-center text-secondary small text-uppercase">Score</th>
                                                <th style={{width: '45%'}} className="text-secondary small text-uppercase">Specific Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {criteriaList.length > 0 ? (
                                                criteriaList.map((criterion, i) => {
                                                    const item = breakdown[criterion];
                                                    const score = typeof item === 'object' ? item.score : item;
                                                    const remark = typeof item === 'object' ? item.remark : "-";

                                                    return (
                                                        <tr key={i}>
                                                            <td className="ps-3 fw-medium text-dark">{criterion}</td>
                                                            <td className="text-center fw-bold text-primary">{score}/20</td>
                                                            <td className="text-muted small fst-italic">{remark || <span className="text-muted opacity-50">No remark</span>}</td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-3 text-muted">No criteria breakdown available.</td>
                                                </tr>
                                            )}
                                            {/* Total Row */}
                                            <tr className="table-light fw-bold border-top-2">
                                                <td className="ps-3 text-end text-uppercase">Total Score:</td>
                                                <td className="text-center text-success fs-5">{rev.total_marks ?? "N/A"} <span className="text-muted fs-6 small">/100</span></td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* SECTION 2: Overall Feedback (Separate Row) */}
                            <div className="bg-light p-4 rounded-4 border border-light">
                                <h6 className="fw-bold text-secondary text-uppercase small mb-3 border-bottom pb-2">
                                    <i className="bi bi-chat-quote-fill me-2 text-info"></i> Overall Feedback
                                </h6>
                                <div className="text-dark" style={{whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '0.95rem'}}>
                                    {rev.review_comments ? (
                                        rev.review_comments
                                    ) : (
                                        <span className="text-muted fst-italic">No additional written comments provided by the reviewer.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
}