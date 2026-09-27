"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ResearcherPayments() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fiscalYears, setFiscalYears] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    faculty: "",
    dept: "",
    fiscal_year: "", 
    status: "" 
  });

  // Fetch Projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/officer/researcher-payments");
      const data = await res.json();
      
      if (data.success) {
        const ongoing = (data.ongoing || []).map(p => ({ ...p, status_label: 'Ongoing', status_code: 3 }));
        const completed = (data.completed || []).map(p => ({ ...p, status_label: 'Completed', status_code: 5 }));
        const allProjects = [...ongoing, ...completed];

        setProjects(allProjects);

        const years = [...new Set(allProjects.map(p => p.fiscal_year).filter(Boolean))].sort().reverse();
        setFiscalYears(years);

        const defaultYear = years.length > 0 ? years[0] : "";
        setFilters(prev => ({ ...prev, fiscal_year: defaultYear }));
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  // Apply Filters
  useEffect(() => {
    let result = projects;

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(s) ||
        p.code_no?.toLowerCase().includes(s) ||
        p.researcher_name?.toLowerCase().includes(s)
      );
    }
    if (filters.fiscal_year && filters.fiscal_year !== "All") {
       result = result.filter(p => p.fiscal_year === filters.fiscal_year);
    }
    if (filters.status) {
       result = result.filter(p => p.status_label === filters.status);
    }

    setFilteredProjects(result);
    setCurrentPage(1); 
  }, [projects, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);

  const renderPagination = (totalItems) => {
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount || 0);
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid px-4 mt-5">
      
      {/* 1. Page Header */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Researcher Payments</h2>
          <p className="text-secondary mb-0">Manage budget allocations and track payment status.</p>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3 d-flex flex-wrap gap-3 align-items-center">
            
            {/* Search */}
            <div className="flex-grow-1" style={{ minWidth: "250px" }}>
                <input
                    name="search"
                    className="form-control border-secondary-subtle"
                    placeholder="Search by code, title, or researcher..."
                    value={filters.search}
                    onChange={handleFilterChange}
                />
            </div>

            {/* Fiscal Year Dropdown */}
            <select name="fiscal_year" className="form-select border-secondary-subtle" style={{ width: "200px" }} value={filters.fiscal_year} onChange={handleFilterChange}>
                <option value="All">All Fiscal Years</option>
                {fiscalYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>

            {/* Status Dropdown */}
            <select name="status" className="form-select border-secondary-subtle" style={{ width: "180px" }} value={filters.status} onChange={handleFilterChange}>
                <option value="">All Status</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
            </select>
        </div>
      </div>

      {/* 3. Main Table */}
      <div className="card border-0 shadow-sm mb-5" style={{ borderRadius: "10px", overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="table mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
            <thead>
              <tr style={{ backgroundColor: "#5c67f2" }}>
                <th className="text-white small fw-bold py-3 ps-4" style={{ backgroundColor: "#5c67f2", border: "none", width: "50px" }}>#</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Code</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Title</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Researcher</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Fiscal Year</th>
                <th className="text-white small fw-bold py-3 text-end" style={{ backgroundColor: "#5c67f2", border: "none" }}>Allocated</th>
                <th className="text-white small fw-bold py-3 text-end" style={{ backgroundColor: "#5c67f2", border: "none" }}>Released</th>
                <th className="text-white small fw-bold py-3 text-center" style={{ backgroundColor: "#5c67f2", border: "none" }}>Status</th>
                <th className="text-white small fw-bold py-3 pe-4 text-end" style={{ backgroundColor: "#5c67f2", border: "none" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((p, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  const isCompleted = p.status_label === 'Completed';
                  
                  return (
                    <tr key={p.id} className="align-middle border-bottom hover-bg-light">
                        <td className="ps-4 py-3 fw-medium text-secondary">{globalIndex}</td>
                        <td className="py-3 fw-medium text-secondary">{p.code_no || "-"}</td>
                        <td className="py-3">
                            <span className="fw-bold text-dark d-block text-truncate" style={{maxWidth: "250px"}} title={p.title}>
                                {p.title}
                            </span>
                        </td>
                        <td className="py-3 text-dark">{p.researcher_name}</td>
                        <td className="py-3 text-secondary">
                            <span className="badge bg-light text-secondary border">{p.fiscal_year}</span>
                        </td>
                        <td className="py-3 text-end fw-medium text-dark">{formatCurrency(p.allocated_budget)}</td>
                        <td className="py-3 text-end text-success">{formatCurrency(p.released || p.total_released)}</td>
                        <td className="py-3 text-center">
                            <span className={`badge rounded-pill px-3 py-2 ${isCompleted ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}`}>
                                {p.status_label}
                            </span>
                        </td>
                        <td className="pe-4 py-3 text-end">
                            <div className="d-flex justify-content-end gap-2">
                                {/* EDIT / MANAGE PAYMENTS */}
                                <Link
                                    href={`/officer/dashboard/payments/researcher-payments/${p.id}`}
                                    className="btn btn-sm btn-light text-warning border-0 d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{ backgroundColor: "#fff8e1", width: "32px", height: "32px" }}
                                    title="Manage Payments"
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
                  <td colSpan={9} className="text-center py-5 text-muted">No projects found matching criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 4. Pagination */}
      {renderPagination(filteredProjects.length)}

    </div>
  );
}