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

  // Filters
  const [search, setSearch] = useState("");
  const [fiscalYear, setFiscalYear] = useState("");
  const [status, setStatus] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // DELETE MODAL STATE
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, fiscalYear, status]);

  async function loadProjects() {
    try {
      const res = await fetch("/api/officer/projects");
      if (!res.ok) throw new Error(`Server error (${res.status})`);
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

  // --- DELETE LOGIC ---
  const initiateDelete = (project) => {
    setProjectToDelete(project);
    setDeletePassword("");
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const storedUser = localStorage.getItem("user");
      const user = JSON.parse(storedUser);
      
      const res = await fetch(`/api/officer/projects/${projectToDelete.id}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword, currentUserId: user?.user_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete project");
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (err) {
      setDeleteError(err.message || "Incorrect password or server error.");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- DATA FILTERING ---
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
        const matchesStatus = status
          ? String(p.status) === String(status)
          : true;

        return matchesSearch && matchesYear && matchesStatus;
      })
    : [];

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <nav className="d-flex justify-content-end mt-4">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} aria-label="Previous">
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
          
          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}

          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDepartment = (deptName) => {
    if (!deptName) return "-";
    const words = deptName.split(" ");
    if (words.length > 2) {
        return words.slice(0, 2).join(" ") + "...";
    }
    return deptName;
  };

  const getStatusBadgeStyle = (statusCode) => {
    switch (parseInt(statusCode)) {
      case 0: return { bg: "bg-danger-subtle", text: "text-danger" };
      case 1: return { bg: "bg-primary-subtle", text: "text-primary" };
      case 2: return { bg: "bg-warning-subtle", text: "text-warning-emphasis" };
      case 3: return { bg: "bg-success-subtle", text: "text-success" };
      case 5: return { bg: "bg-dark-subtle", text: "text-dark" };
      default: return { bg: "bg-secondary-subtle", text: "text-secondary" };
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-danger m-5">{error}</div>;

  return (
    <div className="container-fluid px-0 mt-5 position-relative "> {/* Removed side padding to maximize space */}
      
      {/* 1. Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-4 px-1">
        <div>
          <h2 className="fw-bold text-dark mb-1">Project Proposals</h2>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3 d-flex flex-wrap gap-3 align-items-center">
          <div className="flex-grow-1" style={{ minWidth: "200px" }}>
            <input
              type="text"
              className="form-control border-secondary-subtle"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select border-secondary-subtle"
            style={{ width: "160px" }}
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
          >
            <option value="">Year</option>
            {fiscalYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            className="form-select border-secondary-subtle"
            style={{ width: "160px" }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{STATUS_MAP[s] || s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Styled Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "10px", overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="table mb-0" style={{ borderCollapse: "separate", borderSpacing: "0", tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr style={{ backgroundColor: "#5c67f2" }}>
                <th className="text-white small fw-bold py-2 ps-3" style={{ width: "5%",backgroundColor: "#5c67f2" }}>#</th>
                <th className="text-white small fw-bold py-2" style={{ width: "10%",backgroundColor: "#5c67f2" }}>Code</th>
                {/* Title: 25% width to allow wrapping */}
                <th className="text-white small fw-bold py-2" style={{ width: "25%",backgroundColor: "#5c67f2" }}>Title</th>
                <th className="text-white small fw-bold py-2" style={{ width: "11%",backgroundColor: "#5c67f2" }}>Researcher</th>
                <th className="text-white small fw-bold py-2" style={{ width: "11%",backgroundColor: "#5c67f2" }}>Dept</th>
                <th className="text-white small fw-bold py-2" style={{ width: "8%",backgroundColor: "#5c67f2" }}>Year</th>
                <th className="text-white small fw-bold py-2" style={{ width: "9%",backgroundColor: "#5c67f2" }}>Date</th>
                <th className="text-white small fw-bold py-2" style={{ width: "10%",backgroundColor: "#5c67f2" }}>Status</th>
                <th className="text-white small fw-bold py-2 pe-3 text-end" style={{ width: "12%",backgroundColor: "#5c67f2" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentProjects.length > 0 ? (
                currentProjects.map((p, idx) => {
                  const statusStyle = getStatusBadgeStyle(p.status);
                  const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  
                  return (
                    <tr key={p.id} className="align-middle border-bottom hover-bg-light">
                      
                      {/* Serial */}
                      <td className="ps-3 py-2 fw-medium text-secondary small">{globalIndex}</td>
                      
                      {/* Code */}
                      <td className="py-2 text-secondary fw-medium small text-truncate" title={p.code_no}>{p.code_no || "-"}</td>
                      
                      {/* Title - Line clamped */}
                      <td className="py-2">
                        <Link 
                          href={`/officer/dashboard/projects/${p.id}`} 
                          className="fw-bold text-dark text-decoration-none d-block small"
                          style={{ 
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: "1.3"
                          }}
                          title={p.title}
                        >
                          {p.title || "Untitled"}
                        </Link>
                      </td>
                      
                      {/* Researcher */}
                      <td className="py-2 text-dark small text-truncate" title={p.researcher_name}>{p.researcher_name || "-"}</td>
                      
                      {/* Dept */}
                      <td className="py-2 text-secondary small text-nowrap" title={p.department}>
                        {formatDepartment(p.department)}
                      </td>
                      
                      {/* Year */}
                      <td className="py-2">
                        <span className="badge bg-light text-secondary border small">{p.fiscal_year || "-"}</span>
                      </td>
                      
                      {/* Date */}
                      <td className="py-2 small text-secondary text-truncate">{formatDate(p.submission_date)}</td>
                      
                      {/* Status */}
                      <td className="py-2">
                        <span className={`badge rounded-pill fw-medium px-2 py-1 small ${statusStyle.bg} ${statusStyle.text}`} style={{ fontSize: "0.75rem"}}>
                          {STATUS_MAP[p.status] || p.status}
                        </span>
                      </td>
                      
                      {/* Actions */}
                      <td className="pe-3 py-2 text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <Link 
                            href={`/officer/dashboard/projects/${p.id}`}
                            className="btn btn-sm btn-light text-primary border-0 d-flex align-items-center justify-content-center p-0"
                            style={{ backgroundColor: "#eef2ff", width: "28px", height: "28px" }}
                            title="View"
                          >
                            <i className="bi bi-eye-fill small"></i>
                          </Link>

                          <Link 
                            href={`/officer/dashboard/projects/${p.id}/edit`} 
                            className="btn btn-sm btn-light text-warning border-0 d-flex align-items-center justify-content-center p-0"
                            style={{ backgroundColor: "#fff8e1", width: "28px", height: "28px" }}
                            title="Edit"
                          >
                            <i className="bi bi-pencil-fill small"></i>
                          </Link>

                          <button 
                            type="button"
                            onClick={() => initiateDelete(p)}
                            className="btn btn-sm btn-light text-danger border-0 d-flex align-items-center justify-content-center p-0"
                            style={{ backgroundColor: "#ffebee", width: "28px", height: "28px" }}
                            title="Delete"
                          >
                             <i className="bi bi-trash-fill small"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 4. Pagination */}
      {renderPagination()}

      {/* 5. Delete Modal (Same as before) */}
      {showDeleteModal && (
        <div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
            <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: "450px", width: "90%" }}>
                <div className="card-header bg-danger text-white py-3 rounded-top-4">
                    <h5 className="mb-0 fw-bold">Confirm Deletion</h5>
                </div>
                <div className="card-body p-4">
                    <p className="text-muted mb-3">Delete <strong className="text-dark">{projectToDelete?.title}</strong>?</p>
                    <div className="mb-3">
                        <input 
                            type="password" 
                            className={`form-control ${deleteError ? "is-invalid" : ""}`}
                            placeholder="Confirm with Password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                        />
                        {deleteError && <div className="invalid-feedback">{deleteError}</div>}
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-light" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                        <button className="btn btn-danger" onClick={handleConfirmDelete} disabled={isDeleting}>Delete</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}