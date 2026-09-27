"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const STATUS_MAP = {
  0: "Rejected",
  1: "Proposal Submitted",
  2: "Under Review",
  3: "Accepted / Ongoing",
  4: "Report Submitted",
  5: "Completed",
};

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [fiscalYear, setFiscalYear] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/officer/projects");

        if (!res.ok) {
          throw new Error(`Server error (${res.status})`);
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setProjects(data);
        } else if (Array.isArray(data.projects)) {
          setProjects(data.projects);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
        setError("Unable to load projects. Please try again later.");
        setProjects([]); 
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  /* ✅ DATA FILTERING */
  const fiscalYears = Array.isArray(projects)
    ? [...new Set(projects.map((p) => p.fiscal_year).filter(Boolean))]
    : [];

  const statuses = Array.isArray(projects)
    ? [...new Set(projects.map((p) => p.status).filter((s) => s !== null))]
    : [];

  const filteredProjects = Array.isArray(projects)
    ? projects.filter((p) => {
        const matchesSearch = [p.title, p.researcher_name, p.code_no]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesYear = fiscalYear ? p.fiscal_year === fiscalYear : true;
        const matchesStatus = status ? String(p.status) === String(status) : true;

        return matchesSearch && matchesYear && matchesStatus;
      })
    : [];

  // Helper to format date string
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper for Status Badge Styling
  const getStatusBadgeStyle = (statusCode) => {
    switch (parseInt(statusCode)) {
      case 0: return { bg: "bg-danger-subtle", text: "text-danger" }; // Rejected
      case 1: return { bg: "bg-primary-subtle", text: "text-primary" }; // Submitted
      case 2: return { bg: "bg-warning-subtle", text: "text-warning-emphasis" }; // Review
      case 3: return { bg: "bg-success-subtle", text: "text-success" }; // Accepted
      case 5: return { bg: "bg-dark-subtle", text: "text-dark" }; // Completed
      default: return { bg: "bg-secondary-subtle", text: "text-secondary" };
    }
  };

  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid px-4 mt-5 text-center">
        <div className="alert alert-danger shadow-sm border-0 rounded-3" role="alert">
            {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* 1. Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Project Proposals</h2>
          <p className="text-secondary mb-0">Overview and management of research proposals.</p>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3 d-flex flex-wrap gap-3 align-items-center">
            
            {/* Search Input */}
            <div className="flex-grow-1" style={{ minWidth: "250px" }}>
                <input
                    type="text"
                    className="form-control border-secondary-subtle"
                    placeholder="Search by title, researcher, or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Fiscal Year Select */}
            <select
                className="form-select border-secondary-subtle"
                style={{ width: "200px" }}
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
            >
                <option value="">All Fiscal Years</option>
                {fiscalYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>

            {/* Status Select */}
            <select
                className="form-select border-secondary-subtle"
                style={{ width: "200px" }}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
            >
                <option value="">All Status</option>
                {statuses.map((s) => (
                    <option key={s} value={s}>
                        {STATUS_MAP[s] || s}
                    </option>
                ))}
            </select>
        </div>
      </div>

      {/* 3. Styled Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "10px", overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="table mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
            
            {/* Header */}
            <thead>
              <tr style={{ backgroundColor: "#5c67f2" }}>
                <th className="text-white text-uppercase small fw-bold py-3 ps-4" style={{ backgroundColor: "#5c67f2", border: "none", width: "50px" }}>#</th>
                <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Code</th>
                <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none", minWidth: "250px" }}>Title</th>
                <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Researcher</th>
                {/* Separated Columns */}
                <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Department</th>
                <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Fiscal Year</th>
                
                <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Submitted</th>
                <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Status</th>
                <th className="text-white text-uppercase small fw-bold py-3 pe-4 text-end" style={{ backgroundColor: "#5c67f2", border: "none" }}>Actions</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((p, idx) => {
                    const statusStyle = getStatusBadgeStyle(p.status);
                    return (
                        <tr 
                            key={p.id} 
                            className="align-middle border-bottom hover-bg-light"
                            style={{ transition: "background-color 0.2s" }}
                        >
                            {/* Serial */}
                            <td className="ps-4 py-3 fw-medium text-secondary">{idx + 1}</td>
                            
                            {/* Code */}
                            <td className="py-3 text-secondary fw-medium">{p.code_no || "-"}</td>
                            
                            {/* Title */}
                            <td className="py-3">
                                <Link 
                                    href={`/officer/dashboard/projects/${p.id}`} 
                                    className="fw-bold text-dark text-decoration-none text-truncate d-block"
                                    style={{ maxWidth: "300px" }}
                                    title={p.title}
                                >
                                    {p.title || "Untitled"}
                                </Link>
                            </td>

                            {/* Researcher */}
                            <td className="py-3 text-dark">{p.researcher_name || "-"}</td>

                            {/* Department (New Column) */}
                            <td className="py-3 text-secondary">
                                {p.department || "-"}
                            </td>

                            {/* Fiscal Year (New Column) */}
                            <td className="py-3 text-secondary fw-medium">
                                <span className="badge bg-light text-secondary border border-secondary-subtle">
                                    {p.fiscal_year || "-"}
                                </span>
                            </td>

                            {/* Date */}
                            <td className="py-3 text-secondary small">{formatDate(p.submission_date)}</td>

                            {/* Status Badge */}
                            <td className="py-3">
                                <span className={`badge rounded-pill fw-medium px-3 py-2 ${statusStyle.bg} ${statusStyle.text}`}>
                                    {STATUS_MAP[p.status] || p.status}
                                </span>
                            </td>

                            {/* Actions */}
                            <td className="pe-4 py-3 text-end">
                                <div className="d-flex justify-content-end gap-2">
                                    
                                    {/* View Button */}
                                    <Link 
                                        href={`/officer/dashboard/projects/${p.id}`}
                                        className="btn btn-sm btn-light text-primary border-0 d-inline-flex align-items-center justify-content-center"
                                        title="View Details"
                                        style={{ backgroundColor: "#eef2ff", width: "32px", height: "32px" }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                        </svg>
                                    </Link>

                                    {/* Edit Button */}
                                    <Link 
                                        href={`/officer/dashboard/projects/${p.id}/edit`} 
                                        className="btn btn-sm btn-light text-warning border-0 d-inline-flex align-items-center justify-content-center"
                                        title="Edit Project"
                                        style={{ backgroundColor: "#fff8e1", width: "32px", height: "32px" }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                                        </svg>
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    No projects found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}