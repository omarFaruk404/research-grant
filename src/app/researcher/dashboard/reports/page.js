"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

export default function ResearcherReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Filters ---
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function loadReportsForResearcher() {
      setLoading(true);
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (!storedUser) { setLoading(false); return; }

      try {
        const parsed = JSON.parse(storedUser);
        if (!parsed.researcher_id) { setLoading(false); return; }

        const res = await fetch(`/api/researcher/reports?researcher_id=${parsed.researcher_id}`);
        const data = await res.json();

        if (res.ok) {
          setReports(data);
        } else {
          console.error(data.error);
          setReports([]);
        }
      } catch (err) {
        console.error("Error loading reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReportsForResearcher();
  }, []);

  // --- DERIVED DATA ---

  // 1. Get Unique Years
  const fiscalYears = useMemo(() => {
    const years = reports.map(r => r.fiscal_year).filter(Boolean);
    return [...new Set(years)].sort().reverse();
  }, [reports]);

  // 2. Filter Logic
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const s = search.toLowerCase();
      const matchesSearch = r.project_title?.toLowerCase().includes(s);
      const matchesYear = selectedYear === "all" || r.fiscal_year === selectedYear;
      
      let matchesStatus = true;
      if (selectedStatus !== "all") {
        if (selectedStatus === "submitted") matchesStatus = r.status === 1;
        else if (selectedStatus === "under review") matchesStatus = r.status === 2;
        else if (selectedStatus === "accepted") matchesStatus = r.status === 3;
        else if (selectedStatus === "rejected") matchesStatus = r.status === 4;
      }

      return matchesSearch && matchesYear && matchesStatus;
    });
  }, [reports, search, selectedYear, selectedStatus]);

  // 3. Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- HELPERS ---

  const getStatusBadge = (status) => {
    switch (status) {
      case 1: return <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3">SUBMITTED</span>;
      case 2: return <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3">UNDER REVIEW</span>;
      case 3: return <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3">ACCEPTED</span>;
      case 4: return <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-3">REJECTED</span>;
      default: return <span className="badge rounded-pill bg-secondary px-3">UNKNOWN</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark">Final Reports</h2>
        <p className="text-secondary small mb-0">Manage and track your submitted final reports.</p>
      </div>

      {/* --- FILTERS TOOLBAR --- */}
      <div className="card border-0 shadow-sm mb-4 bg-light rounded-3">
        <div className="card-body py-3">
            <div className="row g-3 align-items-center">
                {/* Search */}
                <div className="col-md-4">
                    <div className="input-group border rounded-3 overflow-hidden">
                        <span className="input-group-text bg-white border-0"><i className="bi bi-search text-muted"></i></span>
                        <input 
                            type="text" 
                            className="form-control border-0 shadow-none" 
                            placeholder="Search by project title..." 
                            value={search} 
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
                        />
                    </div>
                </div>

                {/* Filters Label */}
                <div className="col-md-auto ms-auto">
                    <span className="fw-bold text-secondary small text-uppercase"><i className="bi bi-funnel-fill me-1"></i> Filters:</span>
                </div>

                {/* Year Filter */}
                <div className="col-md-2">
                    <select className="form-select border-0 shadow-none" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        <option value="all">All Years</option>
                        {fiscalYears.map(fy => <option key={fy} value={fy}>{fy}</option>)}
                    </select>
                </div>

                {/* Status Filter */}
                <div className="col-md-2">
                    <select className="form-select border-0 shadow-none" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="submitted">Submitted</option>
                        <option value="under review">Under Review</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>
        </div>
      </div>

      {/* --- REPORTS TABLE --- */}
      {currentItems.length > 0 ? (
        <div className="card border-0 shadow-sm" style={{ borderRadius: "10px", overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="table mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
              <thead style={{ backgroundColor: "#5c67f2" }}>
                <tr>
                  <th className="text-white text-uppercase small fw-bold py-3 ps-4" style={{border:"none" ,backgroundColor: "#5c67f2"}}>Project Title</th>
                  <th className="text-white text-uppercase small fw-bold py-3" style={{border:"none",backgroundColor: "#5c67f2"}}>Fiscal Year</th>
                  <th className="text-white text-uppercase small fw-bold py-3" style={{border:"none",backgroundColor: "#5c67f2"}}>Status</th>
                  <th className="text-white text-uppercase small fw-bold py-3" style={{border:"none",backgroundColor: "#5c67f2"}}>Uploaded Date</th>
                  <th className="text-white text-uppercase small fw-bold py-3 pe-4 text-end" style={{border:"none",backgroundColor: "#5c67f2"}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((r) => (
                  <tr key={r.report_id} className="align-middle border-bottom hover-bg-light">
                    <td className="ps-4 py-3">
                        <div className="fw-bold text-dark text-truncate" style={{maxWidth: "400px"}} title={r.project_title}>
                            {r.project_title}
                        </div>
                    </td>
                    <td className="py-3 text-secondary small">{r.fiscal_year || "-"}</td>
                    <td className="py-3">
                        {getStatusBadge(r.status)}
                    </td>
                    <td className="py-3 text-secondary fw-bold small">
                        {formatDate(r.uploaded_at)}
                    </td>
                    <td className="pe-4 py-3 text-end">
                      <Link 
                        href={`/researcher/dashboard/reports/${r.report_id}`} 
                        className="btn btn-sm btn-light text-primary border-0" 
                        style={{ backgroundColor: "#eef2ff" }}
                        title="View Report Details"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                         </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="alert alert-light text-center mt-4 p-5 shadow-sm rounded">
            <div className="text-muted mb-2"><i className="bi bi-file-earmark-x fs-1"></i></div>
            <p className="text-muted mb-0 fw-bold">No reports found.</p>
        </div>
      )}

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-end mt-4 mb-5">
            <nav>
                <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link border-0 text-dark" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>&laquo; Prev</button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                        <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button onClick={() => paginate(i + 1)} className="page-link border-0" style={currentPage === i + 1 ? { backgroundColor: "#5c67f2", color:"white" } : { color: "#333" }}>{i + 1}</button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link border-0 text-dark" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next &raquo;</button>
                    </li>
                </ul>
            </nav>
        </div>
      )}
    </div>
  );
}