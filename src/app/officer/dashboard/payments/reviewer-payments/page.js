"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ReviewerPayments() {
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [fiscalYear, setFiscalYear] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await fetch("/api/officer/reviewer-payments");
      const data = await res.json();
      setPayments(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error loading reviewer payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let data = payments;

    if (search) {
      data = data.filter((p) =>
        [p.reviewer_name, p.project_title]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (fiscalYear) data = data.filter((p) => p.fiscal_year === fiscalYear);
    if (type) data = data.filter((p) => p.payment_type === type);

    if (status) {
      const statusValue = status === "Paid" ? 1 : 0;
      data = data.filter((p) => p.status === statusValue);
    }

    setFiltered(data);
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [search, fiscalYear, type, status, payments]);

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- MODAL HANDLERS ---
  const initiateDelete = (paymentId) => {
    setPaymentToDelete(paymentId);
    setDeletePassword("");
    setIsDeleted(false);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowDeleteModal(false);
    setPaymentToDelete(null);
    setDeletePassword("");
    setIsDeleted(false);
  };

  const confirmDelete = async () => {
    if (!deletePassword) return alert("Please enter your password.");
    
    setIsDeleting(true);
    try {
      const res = await fetch("/api/officer/reviewer-payments/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            payment_id: paymentToDelete,
            password: deletePassword,
            currentUserId: 1 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const updatedList = payments.filter((p) => p.payment_id !== paymentToDelete);
        setPayments(updatedList);
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

  const fiscalYears = [...new Set(payments.map((p) => p.fiscal_year))].filter(Boolean);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount || 0);
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid px-4 mt-5 position-relative pb-5">
      
      {/* 1. Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Reviewer Payments</h2>
          <p className="text-secondary mb-0">Track and manage honorariums for proposal and report reviews.</p>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3 d-flex flex-wrap gap-3 align-items-center">
            <div className="flex-grow-1" style={{ minWidth: "250px" }}>
                <input type="text" className="form-control border-secondary-subtle" placeholder="Search reviewer or project..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="form-select border-secondary-subtle" style={{ width: "180px" }} value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)}>
                <option value="">All Fiscal Years</option>
                {fiscalYears.map((fy) => <option key={fy}>{fy}</option>)}
            </select>
            <select className="form-select border-secondary-subtle" style={{ width: "200px" }} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">All Types</option>
                <option value="proposal_review">Proposal Review</option>
                <option value="final_report_review">Final Report Review</option>
            </select>
            <select className="form-select border-secondary-subtle" style={{ width: "150px" }} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
            </select>
        </div>
      </div>

      {/* 3. Styled Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "10px", overflow: "hidden" }}>
        <div className="table-responsive">
            <table className="table mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
                <thead>
                    <tr style={{ backgroundColor: "#5c67f2" }}>
                        <th className="text-white small fw-bold py-3 ps-4" style={{ width: "50px", backgroundColor: "#5c67f2" }}>#</th>
                        <th className="text-white small fw-bold py-3" style={{ backgroundColor: "#5c67f2" }}>Reviewer</th>
                        <th className="text-white small fw-bold py-3"style={{ backgroundColor: "#5c67f2" }}>Project</th>
                        <th className="text-white small fw-bold py-3"style={{ backgroundColor: "#5c67f2" }}>Fiscal Year</th>
                        <th className="text-white small fw-bold py-3"style={{ backgroundColor: "#5c67f2" }}>Type</th>
                        <th className="text-white small fw-bold py-3 text-end" style={{ backgroundColor: "#5c67f2" }}>Amount</th>
                        <th className="text-white small fw-bold py-3 text-center" style={{ backgroundColor: "#5c67f2" }}>Status</th>
                        <th className="text-white small fw-bold py-3 pe-4 text-end" style={{ backgroundColor: "#5c67f2" }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map((p, index) => (
                            <tr key={p.payment_id} className="align-middle border-bottom hover-bg-light">
                                <td className="ps-4 py-3 fw-medium text-secondary">{indexOfFirstItem + index + 1}</td>
                                <td className="py-3 fw-bold text-dark">{p.reviewer_name}</td>
                                <td className="py-3">
                                    <span className="d-block text-truncate text-secondary" style={{maxWidth: "300px"}} title={p.project_title}>{p.project_title}</span>
                                </td>
                                <td className="py-3 text-secondary"><span className="badge bg-light text-secondary border">{p.fiscal_year}</span></td>
                                <td className="py-3 text-secondary small text-uppercase fw-medium">{p.payment_type === "proposal_review" ? "Proposal Review" : "Final Report Review"}</td>
                                <td className="py-3 text-end text-dark fw-medium">{p.amount ? formatCurrency(p.amount) : "-"}</td>
                                <td className="py-3 text-center">
                                    <span className={`badge rounded-pill px-3 py-2 ${p.status === 1 ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning-emphasis"}`}>
                                        {p.status === 1 ? "Paid" : "Pending"}
                                    </span>
                                </td>
                                <td className="pe-4 py-3 text-end">
                                    <div className="d-flex justify-content-end gap-2">
                                        <Link href={`/officer/dashboard/payments/reviewer-payments/${p.payment_id}`} className="btn btn-sm btn-light text-warning border-0 d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: "#fff8e1", width: "32px", height: "32px" }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/></svg>
                                        </Link>
                                        <button onClick={() => initiateDelete(p.payment_id)} className="btn btn-sm btn-light text-danger border-0 d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: "#fee2e2", width: "32px", height: "32px" }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : <tr><td colSpan="8" className="text-center py-5 text-muted">No payments found.</td></tr>}
                </tbody>
            </table>
        </div>
      </div>

      {/* 4. Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-end mt-4">
            <nav>
                <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link border-0 text-dark" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>&laquo; Prev</button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                        <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button onClick={() => paginate(i + 1)} className="page-link border-0" style={currentPage === i + 1 ? { backgroundColor: "#5c67f2", color: "white" } : { color: "#333" }}>{i + 1}</button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link border-0 text-dark" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next &raquo;</button>
                    </li>
                </ul>
            </nav>
        </div>
      )}

      {/* --- CUSTOM DELETE MODAL --- */}
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
                                    <p className="text-muted mb-4">Are you sure you want to delete this payment record? This action <strong>cannot be undone</strong>.</p>
                                    <label className="form-label fw-bold small text-uppercase text-secondary">Enter your password to confirm</label>
                                    <input type="password" className="form-control form-control-lg bg-light" placeholder="Password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} autoFocus />
                                </div>
                                <div className="modal-footer bg-light border-0">
                                    <button type="button" className="btn btn-link text-secondary text-decoration-none fw-medium" onClick={closeModal} disabled={isDeleting}>Cancel</button>
                                    <button type="button" className="btn btn-danger fw-bold px-4" onClick={confirmDelete} disabled={isDeleting}>
                                        {isDeleting ? <span><span className="spinner-border spinner-border-sm me-2"></span>Deleting...</span> : "Delete Record"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="modal-header bg-success text-white border-0 justify-content-center"><h5 className="modal-title fw-bold">Deleted Successfully</h5></div>
                                <div className="modal-body p-5 text-center">
                                    <div className="mb-3 text-success"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg></div>
                                    <h5 className="fw-bold text-dark">Payment Record Deleted</h5>
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