"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

// Status Badge Configuration
const STATUS_MAP = {
  0: { label: "Rejected", class: "bg-danger-subtle text-danger" },
  1: { label: "Proposal Submitted", class: "bg-primary-subtle text-primary" },
  2: { label: "Under Review", class: "bg-warning-subtle text-warning-emphasis" },
  3: { label: "Accepted / Ongoing", class: "bg-success-subtle text-success" },
  4: { label: "Report Submitted", class: "bg-info-subtle text-info-emphasis" },
  5: { label: "Completed", class: "bg-secondary-subtle text-secondary" },
};

export default function ProjectsList() {
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
        if (!storedUser) {
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);

        if (!parsedUser?.researcher_id) {
          console.error("No researcher_id found for current user");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `/api/researcher/projects?researcher_id=${parsedUser.researcher_id}`
        );

        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  // Compute unique filter options
  const fiscalYears = [
    ...new Set(projects.map((p) => p.fiscal_year).filter(Boolean)),
  ].sort().reverse();
  
  const statuses = [
    ...new Set(projects.map((p) => p.status).filter((s) => s !== null && s !== undefined)),
  ].sort();

  // Filter Logic
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = [p.title, p.code_no]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesYear = fiscalYear ? p.fiscal_year === fiscalYear : true;
    const matchesStatus = status ? String(p.status) === String(status) : true;

    return matchesSearch && matchesYear && matchesStatus;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
        day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
  );

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* 1. Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 className="fw-bold text-dark mb-1">My Projects</h2>
            <p className="text-secondary mb-0">Track and manage your submitted research projects.</p>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
            <div className="row g-3 align-items-center">
                <div className="col-md-6">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                            </svg>
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0 ps-0"
                            placeholder="Search by title or code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="col-md-3">
                    <select
                        className="form-select text-secondary"
                        value={fiscalYear}
                        onChange={(e) => setFiscalYear(e.target.value)}
                    >
                        <option value="">All Fiscal Years</option>
                        {fiscalYears.map((year) => (
                        <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3">
                    <select
                        className="form-select text-secondary"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        {statuses.map((s) => (
                        <option key={s} value={s}>
                            {STATUS_MAP[s]?.label || `Status ${s}`}
                        </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
      </div>

      {/* 3. Projects Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
                <thead style={{ backgroundColor: "#5c67f2" }}>
                    <tr>
                        <th className="text-white small text-uppercase fw-bold py-3 ps-4" style={{border: "none", width: '50px',backgroundColor: "#5c67f2"}}>#</th>
                        <th className="text-white small text-uppercase fw-bold py-3" style={{border: "none",backgroundColor: "#5c67f2"}}>Code</th>
                        <th className="text-white small text-uppercase fw-bold py-3" style={{border: "none", minWidth: '250px',backgroundColor: "#5c67f2"}}>Project Title</th>
                        <th className="text-white small text-uppercase fw-bold py-3" style={{border: "none",backgroundColor: "#5c67f2"}}>Fiscal Year</th>
                        <th className="text-white small text-uppercase fw-bold py-3 text-center" style={{border: "none",backgroundColor: "#5c67f2"}}>Status</th>
                        <th className="text-white small text-uppercase fw-bold py-3" style={{border: "none",backgroundColor: "#5c67f2"}}>Date</th>
                        <th className="text-white small text-uppercase fw-bold py-3 pe-4 text-end" style={{border: "none",backgroundColor: "#5c67f2"}}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map((p, index) => {
                            const statusInfo = STATUS_MAP[p.status] || { label: "Unknown", class: "bg-secondary-subtle text-secondary" };
                            
                            return (
                                <tr key={p.id}>
                                    <td className="ps-4 fw-medium text-secondary border-bottom-0">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="fw-medium text-dark border-bottom-0">{p.code_no || "-"}</td>
                                    <td className="border-bottom-0">
                                        <Link
                                            href={`/researcher/dashboard/projects/${p.id}`}
                                            className="text-decoration-none fw-bold text-dark text-truncate d-block"
                                            style={{maxWidth: '350px'}}
                                            title={p.title}
                                        >
                                            {p.title}
                                        </Link>
                                    </td>
                                    <td className="border-bottom-0">
                                        <span className="badge bg-light text-secondary border fw-medium">{p.fiscal_year}</span>
                                    </td>
                                    <td className="text-center border-bottom-0">
                                        <span className={`badge rounded-pill px-3 py-2 fw-bold ${statusInfo.class}`} style={{fontSize: '0.75rem'}}>
                                            {statusInfo.label}
                                        </span>
                                    </td>
                                    <td className="text-secondary small border-bottom-0">{formatDate(p.submission_date)}</td>
                                    <td className="pe-4 text-end border-bottom-0">
                                        <div className="d-flex justify-content-end gap-2">
                                            
                                            {/* VIEW BUTTON */}
                                            <Link
                                                href={`/researcher/dashboard/projects/${p.id}`}
                                                className="btn btn-sm btn-light text-primary border-0 d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{ backgroundColor: "#eef2ff", width: "32px", height: "32px" }}
                                                title="View Details"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                                </svg>
                                            </Link>

                                            {/* EDIT BUTTON (Always enabled now) */}
                                            <Link
                                                href={`/researcher/dashboard/projects/${p.id}/edit`}
                                                className="btn btn-sm btn-light text-warning border-0 d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{ backgroundColor: "#fff8e1", width: "32px", height: "32px" }}
                                                title="Edit Proposal"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                                                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                                                </svg>
                                            </Link>

                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center py-5 text-muted border-bottom-0">
                                <div className="mb-2 opacity-25">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-folder2-open" viewBox="0 0 16 16">
                                        <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v10a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 15.5v-12zM2.5 3a.5.5 0 0 0-.5.5V6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5zM14 7H2v8.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V7z"/>
                                    </svg>
                                </div>
                                No projects found matching your criteria.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* 4. Pagination Footer */}
        {totalPages > 1 && (
            <div className="card-footer bg-white border-0 py-3 d-flex justify-content-end">
                <nav>
                    <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link border-0 text-secondary" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>&laquo; Prev</button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                <button className="page-link border-0 rounded-circle mx-1 fw-bold" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link border-0 text-secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next &raquo;</button>
                        </li>
                    </ul>
                </nav>
            </div>
        )}
      </div>
    </div>
  );
}