"use client";
import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";

const STATUS_MAP = {
  0: "Rejected",
  1: "Proposal Submitted",
  2: "Proposal Under Review",
  3: "Project Accepted / Ongoing",
  4: "Project Report Submitted",
  5: "Project Completed",
};

export default function DownloadReport() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [fiscalYear, setFiscalYear] = useState("");
  const [status, setStatus] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/officer/projects/download-report");
        const data = await res.json();
        // Ensure data is an array
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  // Reset to Page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, fiscalYear, status]);

  // --- DERIVED DATA & PAGINATION (useMemo for performance) ---
  
  const { currentProjects, totalPages, fiscalYears, statuses } = useMemo(() => {
    // 1. Get Unique Dropdown Options
    const years = [...new Set(projects.map((p) => p.fiscal_year).filter(Boolean))];
    const stats = [...new Set(projects.map((p) => p.status).filter((s) => s !== null))];

    // 2. Filter Data
    const filtered = projects.filter((p) => {
      const matchesSearch = [p.title, p.researcher_name, p.code_no]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesYear = fiscalYear ? p.fiscal_year === fiscalYear : true;
      const matchesStatus = status ? String(p.status) === String(status) : true;
      return matchesSearch && matchesYear && matchesStatus;
    });

    // 3. Calculate Pagination Indices
    const totalPg = Math.ceil(filtered.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // 4. Slice Data for Current Page (This fixes the accumulation bug)
    // We strictly slice from FirstItem to LastItem (e.g., 10 to 20)
    const slicedProjects = filtered.slice(indexOfFirstItem, indexOfLastItem);

    return { 
      currentProjects: slicedProjects, 
      totalPages: totalPg, 
      fiscalYears: years, 
      statuses: stats,
      // Pass full filtered list for export if needed separately, but we handle export in handler
      fullFiltered: filtered 
    };
  }, [projects, search, fiscalYear, status, currentPage]);


  // --- HANDLERS ---

  const handleDownload = () => {
    // Re-run filter logic for export to ensure we get ALL pages, not just current
    const filteredForExport = projects.filter((p) => {
        const matchesSearch = [p.title, p.researcher_name, p.code_no].join(" ").toLowerCase().includes(search.toLowerCase());
        const matchesYear = fiscalYear ? p.fiscal_year === fiscalYear : true;
        const matchesStatus = status ? String(p.status) === String(status) : true;
        return matchesSearch && matchesYear && matchesStatus;
    });

    if (filteredForExport.length === 0) {
      alert("No data to export.");
      return;
    }

    const exportData = filteredForExport.map((p) => ({
      "Project Code": p.code_no || "N/A",
      "Title": p.title,
      "Researcher Name": p.researcher_name,
      "Faculty": p.faculty || "N/A",
      "Department": p.department || "N/A",
      "Status": STATUS_MAP[p.status] || p.status,
      "Fiscal Year": p.fiscal_year,
      "Submission Date": p.submission_date ? p.submission_date.split("T")[0] : "N/A",
      "Proposed Budget": p.proposed_budget || 0,
      "Allocated Budget": p.allocated_budget || 0,
      "Total Budget Received": p.total_budget_received || 0,
      "Proposal Reviewer": p.proposal_reviewer_name || "Not Assigned",
      "Final Report Reviewer": p.final_report_reviewer_name || "Not Assigned"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    // Adjust column width
    const wscols = Object.keys(exportData[0]).map(() => ({ wch: 20 }));
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Projects Report");
    const fileName = `Projects_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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

  // --- RENDER PAGINATION ---
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <nav className="d-flex justify-content-end mt-4">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button 
                className="page-link" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
          
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            return (
                <li key={i} className={`page-item ${currentPage === pageNum ? "active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(pageNum)}>
                    {pageNum}
                </button>
                </li>
            );
          })}

          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button 
                className="page-link" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid px-0 mt-5 position-relative">
      
      {/* 1. Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-4 px-1">
        <div>
          <h2 className="fw-bold text-dark mb-1">Download Reports</h2>
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
            <option value="">All Years</option>
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
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{STATUS_MAP[s] || s}</option>
            ))}
          </select>
          
          <button
            className="btn btn-success d-flex align-items-center fw-bold text-white px-4"
            onClick={handleDownload}
            style={{ height: '38px' }}
          >
            <i className="bi bi-file-earmark-excel me-2"></i> Export Excel
          </button>
        </div>
      </div>

      {/* 3. Styled Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "10px", overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="table mb-0" style={{ borderCollapse: "separate", borderSpacing: "0", tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr style={{ backgroundColor: "#5c67f2" }}>
                <th className="text-white small fw-bold py-2 ps-3" style={{ width: "5%", backgroundColor: "#5c67f2" }}>#</th>
                <th className="text-white small fw-bold py-2" style={{ width: "15%", backgroundColor: "#5c67f2" }}>Code</th>
                <th className="text-white small fw-bold py-2" style={{ width: "35%", backgroundColor: "#5c67f2" }}>Title</th>
                <th className="text-white small fw-bold py-2" style={{ width: "20%", backgroundColor: "#5c67f2" }}>Researcher</th>
                <th className="text-white small fw-bold py-2" style={{ width: "15%", backgroundColor: "#5c67f2" }}>Status</th>
                <th className="text-white small fw-bold py-2 pe-3 text-end" style={{ width: "10%", backgroundColor: "#5c67f2" }}>Year</th>
              </tr>
            </thead>
            <tbody>
              {currentProjects.length > 0 ? (
                currentProjects.map((p, idx) => {
                  const statusStyle = getStatusBadgeStyle(p.status);
                  const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  
                  return (
                    // ✅ FIX: Use `${p.id}-${idx}` to ensure uniqueness even if data has duplicates
                    <tr key={`${p.id}-${idx}`} className="align-middle border-bottom hover-bg-light">
                      {/* Serial */}
                      <td className="ps-3 py-3 fw-medium text-secondary small">{globalIndex}</td>
                      
                      {/* Code */}
                      <td className="py-3 text-secondary fw-bold small text-truncate" title={p.code_no}>{p.code_no || "-"}</td>
                      
                      {/* Title */}
                      <td className="py-3">
                        <span 
                          className="fw-bold text-dark d-block small"
                          style={{ 
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: "1.3"
                          }}
                          title={p.title}
                        >
                          {p.title || "Untitled"}
                        </span>
                      </td>
                      
                      {/* Researcher */}
                      <td className="py-3 text-dark small text-truncate" title={p.researcher_name}>{p.researcher_name || "-"}</td>
                      
                      {/* Status */}
                      <td className="py-3">
                        <span className={`badge rounded-pill fw-medium px-2 py-1 small ${statusStyle.bg} ${statusStyle.text}`} style={{ fontSize: "0.75rem"}}>
                          {STATUS_MAP[p.status] || p.status}
                        </span>
                      </td>
                      
                      {/* Fiscal Year */}
                      <td className="py-3 pe-3 text-end">
                        <span className="badge bg-light text-secondary border small">{p.fiscal_year || "-"}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    No projects found matching the criteria.
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