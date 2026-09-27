"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/* ---------- Status Label Rules (FIXED) ---------- */
const reviewerStatusLabel = (status) => {
  // Check for Database Enum values ('submitted')
  // We explicitly check for 'submitted' (or 1). Everything else is Pending.
  if (status === 'submitted' || status === 1) {
      return { label: "Reviewed", class: "bg-success-subtle text-success" };
  }
  
  if (status === 'rejected' || status === 0) {
      return { label: "Rejected", class: "bg-danger-subtle text-danger" };
  }

  // Default to Pending (covers 'assigned' and null)
  return { label: "Pending", class: "bg-warning-subtle text-warning-emphasis" };
};

/* ---------- Review Type Configuration ---------- */
const reviewTypeConfig = (reviewType, reviewId) => {
  if (reviewType === 1) {
    return {
      label: "Proposal Review",
      badgeClass: "bg-info-subtle text-info-emphasis",
      link: `/reviewer/dashboard/proposal/${reviewId}`,
    };
  }
  return {
    label: "Final Report Review",
    badgeClass: "bg-primary-subtle text-primary",
    link: `/reviewer/dashboard/final_report/${reviewId}`,
  };
};

export default function ReviewerProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [fiscalYear, setFiscalYear] = useState("");
  const [status, setStatus] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function loadProjects() {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const user = JSON.parse(storedUser);
        if (!user?.reviewer_id) return;

        const res = await fetch(
          `/api/reviewer/projects?reviewer_id=${user.reviewer_id}`
        );

        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Failed to load reviewer projects", err);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  // Filter Logic
  const fiscalYears = [...new Set(projects.map((p) => p.fiscal_year).filter(Boolean))];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = [p.title, p.code_no]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesYear = fiscalYear ? p.fiscal_year === fiscalYear : true;

    // Use the fixed status label function for filtering
    // Note: p.review_status should be used if available, falling back to p.project_status
    // Assuming the API returns the review status in one of these fields.
    const statusField = p.review_status || p.project_status; 
    const currentStatusLabel = reviewerStatusLabel(statusField).label;
    
    const matchesStatus = status ? currentStatusLabel === status : true;

    return matchesSearch && matchesYear && matchesStatus;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1); // Reset pagination on filter change
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <nav className="d-flex justify-content-end mt-3">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>&laquo;</button>
          </li>
          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>&raquo;</button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* 1. Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Assigned Reviews</h2>
          <p className="text-secondary mb-0">Manage and evaluate research proposals and reports.</p>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3 d-flex flex-wrap gap-3 align-items-center">
            {/* Search */}
            <div className="flex-grow-1" style={{ minWidth: "250px" }}>
                <input
                    type="text"
                    className="form-control border-secondary-subtle"
                    placeholder="Search by title or code..."
                    value={search}
                    onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                />
            </div>

            {/* Fiscal Year */}
            <select
                className="form-select border-secondary-subtle"
                style={{ width: "200px" }}
                value={fiscalYear}
                onChange={(e) => handleFilterChange(setFiscalYear, e.target.value)}
            >
                <option value="">All Fiscal Years</option>
                {fiscalYears.map((fy) => (
                    <option key={fy} value={fy}>{fy}</option>
                ))}
            </select>

            {/* Status */}
            <select
                className="form-select border-secondary-subtle"
                style={{ width: "200px" }}
                value={status}
                onChange={(e) => handleFilterChange(setStatus, e.target.value)}
            >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Rejected">Rejected</option>
            </select>
        </div>
      </div>

      {/* 3. Projects Table */}
      <div className="card border-0 shadow-sm mb-5" style={{ borderRadius: "10px", overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="table mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
            <thead>
              <tr style={{ backgroundColor: "#5c67f2" }}>
                <th className="text-white small fw-bold py-3 ps-4" style={{ backgroundColor: "#5c67f2", border: "none", width: "50px" }}>#</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Code</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Title</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Type</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Fiscal Year</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Due Date</th>
                <th className="text-white small fw-bold py-3 text-center" style={{ backgroundColor: "#5c67f2", border: "none" }}>Status</th>
                <th className="text-white small fw-bold py-3 pe-4 text-end" style={{ backgroundColor: "#5c67f2", border: "none" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((p, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  const reviewMeta = reviewTypeConfig(p.review_type, p.project_review_id);
                  // Prefer review_status if available (strings 'assigned'/'submitted'), fallback to project_status
                  const statusInfo = reviewerStatusLabel(p.review_status || p.project_status);

                  return (
                    <tr key={p.project_review_id} className="align-middle border-bottom hover-bg-light">
                      <td className="ps-4 py-3 fw-medium text-secondary">{globalIndex}</td>
                      <td className="py-3 fw-medium text-secondary">{p.code_no || "-"}</td>
                      <td className="py-3">
                         <span className="fw-bold text-dark d-block text-truncate" style={{maxWidth: "300px"}} title={p.title}>
                            {p.title}
                         </span>
                      </td>
                      <td className="py-3">
                         <span className={`badge border ${reviewMeta.badgeClass} rounded-pill`}>
                            {reviewMeta.label}
                         </span>
                      </td>
                      <td className="py-3">
                         <span className="badge bg-light text-secondary border">{p.fiscal_year || "-"}</span>
                      </td>
                      <td className="py-3 text-secondary small">{formatDate(p.due_date)}</td>
                      <td className="py-3 text-center">
                        <span className={`badge rounded-pill px-3 py-2 ${statusInfo.class}`}>
                            {statusInfo.label}
                        </span>
                      </td>
                      <td className="pe-4 py-3 text-end">
                         <Link
                            href={reviewMeta.link}
                            className="btn btn-sm btn-light text-primary border-0 d-inline-flex align-items-center justify-content-center"
                            style={{ backgroundColor: "#eef2ff", height: "32px", padding: "0 12px" }}
                            title="Open Review"
                         >
                            <span className="fw-bold small me-1">Review</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-circle-fill" viewBox="0 0 16 16">
                                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"/>
                            </svg>
                         </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    No assigned reviews found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 4. Pagination */}
      {renderPagination()}

    </div>
  );
}