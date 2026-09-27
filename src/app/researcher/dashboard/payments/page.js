"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

export default function ResearcherPayments() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]); 
  const [loading, setLoading] = useState(true);

  // --- Filter State ---
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- AUTH & FETCH ---
  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!storedUser) { setLoading(false); return; }

    try {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      if (parsed.researcher_id) {
        fetchProjects(parsed.researcher_id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const fetchProjects = async (researcherId) => {
    try {
      const res = await fetch(`/api/researcher/payments?researcher_id=${researcherId}`);
      const data = await res.json();
      
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- DERIVED DATA ---

  const uniqueYears = useMemo(() => {
    const years = projects.map(p => p.fiscal_year).filter(Boolean);
    return [...new Set(years)].sort().reverse();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const s = search.toLowerCase();
      const matchesSearch = (p.title || "").toLowerCase().includes(s) || (p.code_no || "").toLowerCase().includes(s);
      const matchesYear = filterYear === "all" || p.fiscal_year === filterYear;
      return matchesSearch && matchesYear;
    });
  }, [projects, search, filterYear]);

  // --- PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- HELPERS ---
  const getStatusBadge = (status) => {
    switch (status) {
      case 3: return <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3">ONGOING</span>;
      case 4: return <span className="badge rounded-pill bg-info-subtle text-info-emphasis border border-info-subtle px-3">REPORT SUBMITTED</span>;
      case 5: return <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3">COMPLETED</span>;
      default: return <span className="badge rounded-pill bg-secondary px-3">UNKNOWN</span>;
    }
  };

  const formatMoney = (amount) => {
    return amount ? `৳${Number(amount).toLocaleString()}` : "-";
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!user || !user.researcher_id) return <div className="container mt-5 text-danger text-center">Please log in as a researcher.</div>;

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark">Payment Dashboard</h2>
        <p className="text-secondary small mb-0">Track allocated budgets and payment history.</p>
      </div>

      {/* --- TOOLBAR --- */}
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
                            placeholder="Search by Title or Code..." 
                            value={search} 
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
                        />
                    </div>
                </div>

                {/* Filters Label */}
                <div className="col-md-auto ms-auto">
                    <span className="fw-bold text-secondary small text-uppercase"><i className="bi bi-funnel-fill me-1"></i> Filters:</span>
                </div>

                {/* Fiscal Year Filter */}
                <div className="col-md-3">
                    <select className="form-select border-0 shadow-none" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                        <option value="all">All Fiscal Years</option>
                        {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>
        </div>
      </div>

      {/* --- TABLE --- */}
      {currentItems.length > 0 ? (
        <div className="card border-0 shadow-sm" style={{ borderRadius: "10px", overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="table mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
              <thead style={{ backgroundColor: "#5c67f2" }}>
                <tr>
                  <th className="text-white text-uppercase small fw-bold py-3 ps-4" style={{border:"none",backgroundColor: "#5c67f2"}}>Code</th>
                  <th className="text-white text-uppercase small fw-bold py-3" style={{border:"none",backgroundColor: "#5c67f2"}}>Project Title</th>
                  <th className="text-white text-uppercase small fw-bold py-3" style={{border:"none",backgroundColor: "#5c67f2"}}>Fiscal Year</th>
                  <th className="text-white text-uppercase small fw-bold py-3" style={{border:"none",backgroundColor: "#5c67f2"}}>Status</th>
                  <th className="text-white text-uppercase small fw-bold py-3 text-end" style={{border:"none",backgroundColor: "#5c67f2"}}>Allocated</th>
                  <th className="text-white text-uppercase small fw-bold py-3 text-end" style={{border:"none",backgroundColor: "#5c67f2"}}>Released</th>
                  <th className="text-white text-uppercase small fw-bold py-3 pe-4 text-center" style={{border:"none",backgroundColor: "#5c67f2"}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((p) => (
                  <tr key={p.id} className="align-middle border-bottom hover-bg-light">
                    <td className="ps-4 py-3 fw-medium text-secondary font-monospace">{p.code_no || "-"}</td>
                    <td className="py-3">
                        <div className="fw-bold text-dark text-truncate" style={{maxWidth: "350px"}} title={p.title}>{p.title}</div>
                    </td>
                    <td className="py-3 text-secondary small">{p.fiscal_year || "-"}</td>
                    <td className="py-3">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="py-3 fw-bold text-dark text-end">{formatMoney(p.allocated_budget)}</td>
                    <td className="py-3 text-success fw-medium text-end">
                        {formatMoney(p.total_released)}
                    </td>
                    <td className="pe-4 py-3 text-center">
                      <Link 
                        href={`/researcher/dashboard/payments/${p.id}`} 
                        className="btn btn-sm btn-light text-primary border-0" 
                        style={{ backgroundColor: "#eef2ff" }}
                        title="View Payment Details"
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
            <div className="text-muted mb-2"><i className="bi bi-wallet2 fs-1"></i></div>
            <p className="text-muted mb-0 fw-bold">No payments found matching your criteria.</p>
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