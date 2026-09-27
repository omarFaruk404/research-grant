"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function ReviewerPayments() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Data State
  const [allPayments, setAllPayments] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); 
  const [yearFilter, setYearFilter] = useState(""); 

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!storedUser) { setLoading(false); return; }

    try {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      if (parsed.reviewer_id) fetchPayments(parsed.reviewer_id);
      else setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const fetchPayments = async (reviewerId) => {
    try {
      const res = await fetch(`/api/reviewer/payments?reviewer_id=${reviewerId}`);
      const data = await res.json();
      
      if (data.success) {
        const rawPayments = data.payments || [];
        
        // 1. Normalize Data
        const formatted = rawPayments.map(p => ({
          ...p,
          status: p.status === 1 ? 'paid' : 'pending'
        }));
        setAllPayments(formatted);

        // 2. Extract & Sort Fiscal Years (Descending)
        const uniqueYears = [...new Set(formatted.map(p => p.fiscal_year).filter(Boolean))];
        uniqueYears.sort((a, b) => b.localeCompare(a));
        
        setFiscalYears(uniqueYears);

        // 3. Set Default Filter
        if (uniqueYears.length > 0) {
            setYearFilter(uniqueYears[0]);
        } else {
            setYearFilter("All");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering Logic ---
  const filteredPayments = useMemo(() => {
    return allPayments.filter(p => {
      const matchesSearch = (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
                            (p.code_no || "").toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "All" ? true : p.status === statusFilter.toLowerCase();
      const matchesYear = yearFilter === "All" ? true : p.fiscal_year === yearFilter;

      return matchesSearch && matchesStatus && matchesYear;
    });
  }, [allPayments, search, statusFilter, yearFilter]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedData = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <nav className="container-fluid px-4 mt-5 position-relative">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link shadow-none" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
              <button className="page-link shadow-none" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link shadow-none" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (!user || !user.reviewer_id) return <div className="p-5 text-center text-danger fw-bold">Reviewer information not found.</div>;

  const currentTotal = filteredPayments
    .filter(p => p.status === 'paid')
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  return (
    <div className="container-fluid py-4">
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
            <h3 className="fw-bold text-dark mb-0">Payment History</h3>
            <p className="text-muted mb-0 mt-1">Track your remuneration for reviewed proposals and reports.</p>
        </div>

      </div>

      {/* Filters Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Search</label>
                    <div className="input-group">
                        <span className="input-group-text bg-light border-0"><i className="bi bi-search text-muted"></i></span>
                        <input
                            type="text"
                            className="form-control bg-light border-0"
                            placeholder="Project title or code..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>
                <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Fiscal Year</label>
                    <select 
                        className="form-select border-0 bg-light fw-medium"
                        value={yearFilter}
                        onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
                    >
                        {fiscalYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                        <option value="All">All Years</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Payment Status</label>
                    <select 
                        className="form-select border-0 bg-light fw-medium"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>
            </div>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "10px", overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="table mb-0" style={{ borderCollapse: "separate", borderSpacing: "0", tableLayout: "fixed", width: "100%" }}>
            
            {/* Table Header: Fixed Widths applied here */}
            <thead>
              <tr style={{ backgroundColor: "#5c67f2" }}>
                <th className="text-white small fw-bold py-3 ps-4" style={{ backgroundColor: "#5c67f2", border: "none", width: "60px" }}>#</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none", width: "130px" }}>Code</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none", width: "30%", minWidth: "250px" }}>Title</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none", width: "120px" }}>Fiscal Year</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none", width: "140px" }}>Type</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none", width: "120px" }}>Amount</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none", width: "120px" }}>Status</th>
                <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none", width: "130px" }}>Date</th>
                <th className="text-white small fw-bold py-3 pe-4 text-end" style={{ backgroundColor: "#5c67f2", border: "none", width: "80px" }}>Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((p, idx) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isPaid = p.status === 'paid';

                  return (
                    <tr
                      key={p.id}
                      className="align-middle border-bottom hover-bg-light"
                      style={{ transition: "background-color 0.2s" }}
                    >
                      <td className="ps-4 py-3 fw-medium text-secondary text-truncate">{globalIndex}</td>
                      <td className="py-3 text-secondary fw-medium text-truncate" title={p.code_no}>{p.code_no || "-"}</td>
                      
                      {/* Title: Truncates if too long */}
                      <td className="py-3">
                        <div className="fw-bold text-dark text-truncate" title={p.title}>
                            {p.title}
                        </div>
                      </td>

                      <td className="py-3">
                         <span className="badge bg-light text-dark border">{p.fiscal_year || "-"}</span>
                      </td>

                      <td className="py-3">
                         <span className="badge bg-white text-secondary border fw-normal shadow-sm text-truncate" style={{maxWidth: "100%"}}>
                             {p.payment_type === "proposal_review" ? "Proposal" : "Final Report"}
                         </span>
                      </td>

                      <td className="py-3 text-dark fw-bold text-truncate">
                         ৳ {p.amount ? p.amount.toLocaleString() : "—"}
                      </td>

                      <td className="py-3">
                        {isPaid ? (
                             <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                                 Paid
                             </span>
                        ) : (
                             <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 rounded-pill">
                                 Pending
                             </span>
                        )}
                      </td>

                      <td className="py-3 text-secondary small text-truncate">
                        {isPaid && p.payment_date 
                            ? new Date(p.payment_date).toLocaleDateString("en-GB") 
                            : "—"
                        }
                      </td>

                      <td className="pe-4 py-3 text-end">
                        <div className="d-flex justify-content-end">
                           <button
                             onClick={() => router.push(`/reviewer/dashboard/payments/${p.project_id}`)}
                             className="btn btn-sm btn-light text-primary border-0 d-flex align-items-center justify-content-center"
                             title="View Details"
                             style={{ backgroundColor: "#eef2ff", width: "32px", height: "32px" }}
                           >
                             <i className="bi bi-eye-fill"></i>
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-filter-circle fs-2 mb-2 text-secondary"></i>
                        <span>No payments found matching the selected filters.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {renderPagination()}

      <style jsx>{`
        .hover-bg-light:hover { background-color: #f8f9fa; }
        .form-select:focus, .form-control:focus {
            box-shadow: none;
            border-color: #5c67f2;
        }
      `}</style>
    </div>
  );
}