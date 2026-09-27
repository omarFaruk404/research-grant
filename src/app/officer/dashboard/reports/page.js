"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Fetch reports
  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("/api/officer/reports");
        const data = await res.json();
        
        setReports(data);
        setFilteredReports(data);

        // Collect fiscal years
        const years = [...new Set(data.map((r) => r.fiscal_year))].filter(Boolean);
        setFiscalYears(years);
      } catch (err) {
        console.error("Error loading reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...reports];

    if (selectedYear) {
      result = result.filter((r) => r.fiscal_year === selectedYear);
    }

    if (selectedStatus) {
      const statusMap = { "submitted": 1, "under review": 2, "accepted": 3, "rejected": 4 };
      result = result.filter(r => r.status === statusMap[selectedStatus]);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.researcher_name?.toLowerCase().includes(s) ||
          r.project_title?.toLowerCase().includes(s)
      );
    }

    setFilteredReports(result);
    setCurrentPage(1); 
  }, [search, selectedYear, selectedStatus, reports]);

  // --- DELETE HANDLERS ---
  const initiateDelete = (report) => {
    setReportToDelete(report);
    setDeletePassword("");
    setIsDeleted(false);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowDeleteModal(false);
    setReportToDelete(null);
    setDeletePassword("");
    setIsDeleted(false);
  };

  const confirmDelete = async () => {
    if (!deletePassword) return alert("Please enter your password.");
    
    setIsDeleting(true);
    try {
      const res = await fetch("/api/officer/reports/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            report_id: reportToDelete.report_id, // Use the report ID directly
            project_id: reportToDelete.project_id, // Need this to revert project status
            password: deletePassword,
            currentUserId: 1 // ⚠️ Replace with actual logged-in user ID
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const updatedList = reports.filter((r) => r.report_id !== reportToDelete.report_id);
        setReports(updatedList);
        setIsDeleted(true);
      } else {
        alert("❌ Error: " + (data.error || "Failed to delete"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
        setIsDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 1: return { label: "Submitted", class: "bg-primary-subtle text-primary" };
      case 2: return { label: "Under Review", class: "bg-warning-subtle text-warning-emphasis" };
      case 3: return { label: "Accepted", class: "bg-success-subtle text-success" };
      case 4: return { label: "Rejected", class: "bg-danger-subtle text-danger" };
      default: return { label: "Unknown", class: "bg-secondary-subtle text-secondary" };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstItem, indexOfLastItem);

  const renderPagination = (totalItems, currentPage, setCurrentPage) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
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
          <h2 className="fw-bold text-dark mb-1">Final Reports</h2>
          <p className="text-secondary mb-0">Overview and management of submitted final reports.</p>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3 d-flex flex-wrap gap-3 align-items-center">
            
            <div className="flex-grow-1" style={{ minWidth: "250px" }}>
                <input type="text" className="form-control border-secondary-subtle" placeholder="Search by researcher or project title..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <select className="form-select border-secondary-subtle" style={{ width: "200px" }} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <option value="">All Years</option>
                {fiscalYears.map((fy) => <option key={fy} value={fy}>{fy}</option>)}
            </select>

            <select className="form-select border-secondary-subtle" style={{ width: "200px" }} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under review">Under Review</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
            </select>
        </div>
      </div>

      {/* 3. Reports Table */}
      <div className="card border-0 shadow-sm mb-5" style={{ borderRadius: "10px", overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="table mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
            <thead>
              <tr style={{ backgroundColor: "#5c67f2" }}>
                <th className="text-white small fw-bold py-3 ps-4" style={{ width: "50px",backgroundColor: "#5c67f2" }}>#</th>
                <th className="text-white small fw-bold py-3" style={{backgroundColor: "#5c67f2"}}>Project Title</th>
                <th className="text-white small fw-bold py-3" style={{backgroundColor: "#5c67f2"}}>Researcher</th>
                <th className="text-white small fw-bold py-3" style={{backgroundColor: "#5c67f2"}}>Fiscal Year</th>
                <th className="text-white small fw-bold py-3" style={{backgroundColor: "#5c67f2"}}>Uploaded At</th>
                <th className="text-white small fw-bold py-3 text-center" style={{backgroundColor: "#5c67f2"}}>Status</th>
                <th className="text-white small fw-bold py-3 pe-4 text-end" style={{backgroundColor: "#5c67f2"}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentReports.length > 0 ? (
                currentReports.map((r, index) => {
                  const badge = getStatusBadge(r.status);
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  
                  return (
                    <tr key={r.report_id} className="align-middle border-bottom hover-bg-light">
                      <td className="ps-4 py-3 fw-medium text-secondary">{globalIndex}</td>
                      <td className="py-3">
                        <span className="fw-bold text-dark d-block text-truncate" style={{maxWidth: "350px"}} title={r.project_title}>
                            {r.project_title}
                        </span>
                      </td>
                      <td className="py-3 text-dark">{r.researcher_name}</td>
                      <td className="py-3 text-secondary">
                        <span className="badge bg-light text-secondary border">{r.fiscal_year}</span>
                      </td>
                      <td className="py-3 text-secondary small">{formatDate(r.uploaded_at)}</td>
                      <td className="py-3 text-center">
                        <span className={`badge rounded-pill px-3 py-2 ${badge.class}`}>
                            {badge.label}
                        </span>
                      </td>
                      <td className="pe-4 py-3 text-end">
                        <div className="d-flex justify-content-end gap-2">
                            <Link href={`/officer/dashboard/reports/${r.project_id}`} className="btn btn-sm btn-light text-primary border-0 d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: "#eef2ff", width: "32px", height: "32px" }} title="View Details">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>
                            </Link>
                            
                            {/* DELETE BUTTON */}
                            <button onClick={() => initiateDelete(r)} className="btn btn-sm btn-light text-danger border-0 d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: "#fee2e2", width: "32px", height: "32px" }} title="Delete Report">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/></svg>
                            </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={7} className="text-center py-5 text-muted">No reports found matching your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 4. Pagination */}
      {renderPagination(filteredReports.length, currentPage, setCurrentPage)}

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && (
        <>
            <div className="modal-backdrop show" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}></div>
            <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg overflow-hidden">
                        {!isDeleted ? (
                            <>
                                <div className="modal-header bg-danger text-white border-0">
                                    <h5 className="modal-title fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i> Confirm Deletion</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <p className="text-muted mb-4">You are about to delete this <strong>Final Report</strong>. <br/><br/>⚠️ This will also <strong>delete all associated reviews</strong> and revert the Project Status to <strong>Ongoing</strong>.</p>
                                    <label className="form-label fw-bold small text-uppercase text-secondary">Enter your password to confirm</label>
                                    <input type="password" className="form-control form-control-lg bg-light" placeholder="Password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} autoFocus />
                                </div>
                                <div className="modal-footer bg-light border-0">
                                    <button type="button" className="btn btn-link text-secondary text-decoration-none fw-medium" onClick={closeModal} disabled={isDeleting}>Cancel</button>
                                    <button type="button" className="btn btn-danger fw-bold px-4" onClick={confirmDelete} disabled={isDeleting}>
                                        {isDeleting ? <span><span className="spinner-border spinner-border-sm me-2"></span>Deleting...</span> : "Delete Report"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="modal-header bg-success text-white border-0 justify-content-center"><h5 className="modal-title fw-bold">Deleted Successfully</h5></div>
                                <div className="modal-body p-5 text-center">
                                    <div className="mb-3 text-success"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg></div>
                                    <h5 className="fw-bold text-dark">Report Deleted</h5>
                                    <p className="text-secondary">The report and associated reviews have been removed. Project status reverted.</p>
                                </div>
                                <div className="modal-footer bg-light border-0 justify-content-center"><button type="button" className="btn btn-success fw-bold px-5" onClick={closeModal}>Close</button></div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
      )}

    </div>
  );
}