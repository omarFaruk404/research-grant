"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function CircularsPage() {
  const router = useRouter();
  
  // --- Data State ---
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filter State ---
  const [filterType, setFilterType] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCirculars();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterYear]);

  const fetchCirculars = async () => {
    try {
      const res = await fetch("/api/circulars");
      const data = await res.json();
      
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data.circulars) {
        list = data.circulars;
      }
      setCirculars(list);
    } catch (error) {
      console.error("Failed to fetch circulars:", error);
    } finally {
        setLoading(false);
    }
  };

  // --- DERIVED DATA ---

  // 1. Extract Unique Fiscal Years for Dropdown
  const uniqueYears = useMemo(() => {
    const years = circulars.map(c => c.year_label).filter(Boolean);
    return [...new Set(years)].sort().reverse();
  }, [circulars]);

  // 2. Filter Logic
  const filteredCirculars = useMemo(() => {
    return circulars.filter(c => {
      const matchesType = filterType === "all" || c.circular_type === filterType;
      const matchesYear = filterYear === "all" || c.year_label === filterYear;
      return matchesType && matchesYear;
    });
  }, [circulars, filterType, filterYear]);

  // 3. Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCirculars.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCirculars.length / itemsPerPage);

  // --- ACTIONS ---
  const handleView = (id) => {
    router.push(`/researcher/dashboard/circulars/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const getTypeBadgeClass = (type) => {
    if (type === "proposal") return "bg-success-subtle text-success";
    if (type === "notice") return "bg-primary-subtle text-primary";
    return "bg-secondary-subtle text-secondary";
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark">Circulars Archive</h2>
        <p className="text-secondary small mb-0">View and manage past and current circulars.</p>
      </div>

      {/* --- FILTERS TOOLBAR --- */}
      <div className="card border-0 shadow-sm mb-4 bg-light rounded-3">
        <div className="card-body py-3">
            <div className="row g-3 align-items-center">
                <div className="col-md-auto">
                    <span className="fw-bold text-secondary small text-uppercase"><i className="bi bi-funnel-fill me-1"></i> Filters:</span>
                </div>
                {/* Type Filter */}
                <div className="col-md-3">
                    <select 
                        className="form-select border-0 shadow-none" 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        aria-label="Filter by Type"
                    >
                        <option value="all">All Types</option>
                        <option value="proposal">Proposals</option>
                        <option value="notice">Notices</option>
                    </select>
                </div>
                {/* Fiscal Year Filter */}
                <div className="col-md-3">
                    <select 
                        className="form-select border-0 shadow-none" 
                        value={filterYear} 
                        onChange={(e) => setFilterYear(e.target.value)}
                        aria-label="Filter by Fiscal Year"
                    >
                        <option value="all">All Fiscal Years</option>
                        {uniqueYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div className="col text-end">
                    <span className="badge bg-white text-dark border">
                        Total: {filteredCirculars.length}
                    </span>
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
                  <th className="text-white text-uppercase small fw-bold py-3 ps-4" style={{ backgroundColor: "#5c67f2", border: "none" }}>Title</th>
                  <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Fiscal Year</th>
                  <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Notice Code</th>
                  <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Type</th>
                  <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Published Date</th>
                  <th className="text-white text-uppercase small fw-bold py-3 pe-4 text-end" style={{ backgroundColor: "#5c67f2", border: "none" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((c) => (
                  <tr key={c.id} className="align-middle border-bottom hover-bg-light">
                    <td className="ps-4 py-3">
                      <div className="fw-bold text-dark">{c.title}</div>
                    </td>
                    <td className="py-3 text-secondary fw-medium">{c.year_label || "-"}</td>
                    <td className="py-3 text-secondary fw-medium">{c.notice_code || "-"}</td>
                    <td className="py-3">
                      <span className={`badge rounded-pill px-3 py-2 fw-bold ${getTypeBadgeClass(c.circular_type)}`} style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                        {c.circular_type ? c.circular_type.toUpperCase() : "UNKNOWN"}
                      </span>
                    </td>
                    <td className="py-3 text-secondary fw-bold">{formatDate(c.notice_published_date)}</td>
                    <td className="pe-4 py-3 text-end">
                        <button onClick={(e) => { e.stopPropagation(); handleView(c.id); }} className="btn btn-sm btn-light text-primary border-0" style={{ backgroundColor: "#eef2ff" }} title="View Details">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="alert alert-light text-center mt-4 p-5 shadow-sm rounded">
            <div className="text-muted mb-2"><i className="bi bi-search fs-1"></i></div>
            <p className="text-muted mb-0 fw-bold">No circulars matches your filters.</p>
        </div>
      )}

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4 mb-5">
            <nav>
                <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link border-0 text-dark" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                            &laquo; Prev
                        </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                        <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button 
                                onClick={() => paginate(i + 1)} 
                                className="page-link border-0"
                                style={currentPage === i + 1 ? { backgroundColor: "#5c67f2" } : { color: "#333" }}
                            >
                                {i + 1}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link border-0 text-dark" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                            Next &raquo;
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
      )}
    </div>
  );
}