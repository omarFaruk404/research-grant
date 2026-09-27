"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const STATUS_LABEL = {
  1: "Submitted",
  2: "Under Review",
  3: "Accepted",
  4: "Rejected",
};

const REVIEW_TYPE_MAP = {
  1: "Proposal Review",
  2: "Final Report Review",
};

export default function ResearcherReportDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [report, setReport] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!storedUser) { setLoading(false); return; }

    try {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);

      if (!parsed.researcher_id) { setLoading(false); return; }

      async function fetchReport() {
        try {
          const res = await fetch(`/api/researcher/reports/${id}?researcher_id=${parsed.researcher_id}`);
          const data = await res.json();

          if (!res.ok) {
            console.error(data.error || "Failed to load report");
            setReport(null);
          } else {
            setReport(data.report);
            setDocuments(data.documents || []);
            setReviews(data.reviews || []);
          }
        } catch (err) {
          console.error("Error loading report:", err);
        } finally {
          setLoading(false);
        }
      }
      fetchReport();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [id]);

  // --- HELPERS ---
  const getStatusBadge = (status) => {
    switch (status) {
      case 1: return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill">SUBMITTED</span>;
      case 2: return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 rounded-pill">UNDER REVIEW</span>;
      case 3: return <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">ACCEPTED</span>;
      case 4: return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill">REJECTED</span>;
      default: return <span className="badge bg-secondary px-3 py-2 rounded-pill">UNKNOWN</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const parseBreakdown = (jsonString) => {
    try {
        return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString || {};
    } catch (e) {
        return {};
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!report) return <div className="text-center mt-5 text-danger fw-bold">Report not found.</div>;

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* --- HEADER --- */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
            <Link href="/researcher/dashboard/reports" className="text-decoration-none text-secondary small fw-bold mb-2 d-inline-block">
              &larr; BACK TO REPORTS
            </Link>
            <h2 className="fw-bold text-dark mb-1">Report Details</h2>
            <p className="text-muted small mb-0">View submission status and reviewer evaluation.</p>
        </div>
        <div className="text-end">
            {getStatusBadge(report.status)}
        </div>
      </div>

      {/* --- PROJECT INFO CARD --- */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
            <h5 className="fw-bold text-dark mb-3 text-truncate">{report.project_title}</h5>
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-light p-3 rounded-circle text-primary"><i className="bi bi-calendar-event fs-5"></i></div>
                        <div>
                            <div className="text-uppercase text-secondary fw-bold small">Fiscal Year</div>
                            <div className="fw-bold text-dark">{report.fiscal_year || "-"}</div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-light p-3 rounded-circle text-success"><i className="bi bi-cloud-upload fs-5"></i></div>
                        <div>
                            <div className="text-uppercase text-secondary fw-bold small">Submitted On</div>
                            <div className="fw-bold text-dark">{formatDate(report.uploaded_at)}</div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-light p-3 rounded-circle text-info"><i className="bi bi-folder2-open fs-5"></i></div>
                        <div>
                            <div className="text-uppercase text-secondary fw-bold small">Files Attached</div>
                            <div className="fw-bold text-dark">{documents.length} Document(s)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- FILES SECTION --- */}
      {documents.length > 0 && (
          <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-white p-4 border-bottom">
                  <h6 className="fw-bold mb-0 text-dark">Attached Documents</h6>
              </div>
              <div className="card-body p-4">
                  <div className="d-flex flex-wrap gap-3">
                      {documents.map((doc, idx) => (
                          <div key={idx} className="p-3 bg-light border rounded-3 d-flex align-items-center gap-3" style={{minWidth: '300px'}}>
                              <div className="bg-white p-2 rounded border text-danger"><i className="bi bi-file-earmark-pdf-fill fs-5"></i></div>
                              <div className="flex-grow-1 overflow-hidden">
                                  <div className="fw-bold text-dark text-truncate" title={doc.name}>{doc.name}</div>
                                  <small className="text-secondary">{formatDate(doc.uploaded_at)}</small>
                              </div>
                              <a href={doc.url} target="_blank" className="btn btn-sm btn-white border shadow-sm text-primary"><i className="bi bi-download"></i></a>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- REVIEWS SECTION --- */}
      <h5 className="fw-bold text-dark mb-3">Reviewer Evaluations</h5>
      
      {reviews.length === 0 ? (
          <div className="alert alert-light text-center p-5 border shadow-sm rounded-4">
              <i className="bi bi-chat-square-text fs-1 text-muted opacity-25"></i>
              <p className="text-muted mt-3 mb-0">No reviews have been submitted yet.</p>
          </div>
      ) : (
          <div className="d-flex flex-column gap-5">
              {reviews.map((rev) => {
                  const breakdown = parseBreakdown(rev.marks_breakdown);
                  const criteriaList = Object.keys(breakdown);
                  const totalMarks = rev.total_marks || 0;

                  return (
                      <div key={rev.id} className="card border-0 shadow-lg rounded-4 overflow-hidden">
                          {/* Header */}
                          <div className="card-header bg-primary text-white py-3 px-4 d-flex justify-content-between align-items-center">
                              <span className="fw-bold small text-uppercase">
                                  <i className="bi bi-person-check-fill me-2"></i>
                                  {REVIEW_TYPE_MAP[rev.review_type] || "Review"}
                              </span>
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
                                                  <td className="text-center text-success fs-5">{totalMarks} <span className="text-muted fs-6 small">/100</span></td>
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