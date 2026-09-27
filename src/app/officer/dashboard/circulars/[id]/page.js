"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CircularDetailsPage() {
  const router = useRouter();
  const params = useParams(); // Unwrap not strictly needed here as standard hooks handle it, but good practice in React 19
  const [circular, setCircular] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all circulars and find the matching one
        // (Since your current GET API returns all rows)
        const res = await fetch(`/api/circulars`);
        const data = await res.json();
        
        // Handle array response directly or nested object
        const allCirculars = Array.isArray(data) ? data : (data.circulars || []);
        const found = allCirculars.find((c) => c.id == params.id);
        
        setCircular(found || null);
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  if (loading) return <div className="p-5 text-center text-muted">Loading details...</div>;
  if (!circular) return <div className="p-5 text-center text-danger">Circular not found.</div>;

  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Helper for Badge styling
  const getTypeBadgeClass = (type) => {
    if (type === "proposal") return "bg-primary-subtle text-primary border border-primary-subtle";
    if (type === "notice") return "bg-info-subtle text-info-emphasis border border-info-subtle";
    return "bg-secondary-subtle text-secondary border border-secondary-subtle";
  };

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      {/* Header with Back Button */}
      <div className="d-flex align-items-center mb-4">
        <button 
          onClick={() => router.back()} 
          className="btn btn-outline-secondary btn-sm me-3"
        >
          ← Back
        </button>
        <h2 className="fw-bold mb-0 text-dark">Circular Details</h2>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 border-bottom">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <h4 className="mb-1 fw-bold text-primary">{circular.title}</h4>
              <span className={`badge rounded-pill ${getTypeBadgeClass(circular.circular_type)}`}>
                {circular.circular_type?.toUpperCase()}
              </span>
            </div>
            <div className="text-end">
              <small className="text-muted d-block">Published On</small>
              <span className="fw-medium">{formatDate(circular.notice_published_date)}</span>
            </div>
          </div>
        </div>

        <div className="card-body p-4">
          <div className="row g-4 mb-4">
            {/* Meta Data Columns */}
            <div className="col-md-4">
              <div className="p-3 bg-light rounded-3 h-100">
                <small className="text-uppercase text-muted fw-bold" style={{ fontSize: "0.75rem" }}>Notice Code</small>
                <p className="mb-0 fw-semibold fs-5">{circular.notice_code || "N/A"}</p>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="p-3 bg-light rounded-3 h-100">
                <small className="text-uppercase text-muted fw-bold" style={{ fontSize: "0.75rem" }}>Fiscal Year</small>
                <p className="mb-0 fw-semibold fs-5">{circular.year_label || "N/A"}</p>
              </div>
            </div>

            {/* Conditional Deadline Box */}
            {circular.circular_type === 'proposal' && (
              <div className="col-md-4">
                <div className="p-3 bg-danger-subtle text-danger-emphasis rounded-3 h-100 border border-danger-subtle">
                  <small className="text-uppercase fw-bold" style={{ fontSize: "0.75rem" }}>Submission Deadline</small>
                  <p className="mb-0 fw-bold fs-5 text-danger">
                    {formatDate(circular.proposal_submission_deadline)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <h5 className="fw-bold text-dark mt-4 mb-3 border-bottom pb-2">Description</h5>
          <div className="text-secondary" style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
            {circular.description || "No description provided."}
          </div>

          {/* Attachment Section */}
          {circular.attachment && (
            <div className="mt-5 pt-3 border-top">
              <h6 className="fw-bold mb-3">Attachment</h6>
              <div className="d-flex align-items-center p-3 border rounded bg-light" style={{ maxWidth: "400px" }}>
                <div className="me-3 text-danger">
                  {/* File Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
                    <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                    <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                  </svg>
                </div>
                <div className="flex-grow-1 overflow-hidden">
                  <div className="text-truncate fw-medium text-dark">Document Attachment</div>
                  <small className="text-muted">Click to download</small>
                </div>
                <a
                  href={circular.attachment} // Path is stored as /uploads/... in DB
                  download
                  target="_blank"
                  className="btn btn-sm btn-primary ms-3"
                >
                  Download
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}