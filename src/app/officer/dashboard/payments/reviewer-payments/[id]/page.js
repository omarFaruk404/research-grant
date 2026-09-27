"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ReviewerPaymentDetails() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [note, setNote] = useState("");
  const [sendEmail, setSendEmail] = useState(true); // Default checked

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ amount: "", date: "", note: "" });

  // ✅ Load payment details
  useEffect(() => {
    loadPayment();
  }, [id]);

  async function loadPayment() {
    try {
      const res = await fetch(`/api/officer/reviewer-payments/${id}`);
      const data = await res.json();

      if (res.ok) {
        setPayment(data);
        // Initialize form with existing data or defaults
        setAmount(data.amount ? data.amount.toString() : "");
        setNote(data.note || "");
        
        if(data.payment_date) {
             setPaymentDate(new Date(data.payment_date).toISOString().split("T")[0]);
        } else {
             setPaymentDate(new Date().toISOString().split("T")[0]);
        }
      } else {
        console.error("Failed to load:", data.error);
      }
    } catch (err) {
      console.error("Error loading payment:", err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Release funds (First Time Payment)
  async function releaseFunds() {
    if (!amount || amount <= 0) return alert("Please enter a valid payment amount.");
    if (!paymentDate) return alert("Please select the payment date."); 
    
    if (!confirm("Are you sure you want to release funds? This action marks the payment as complete.")) return;

    try {
      const res = await fetch(`/api/officer/reviewer-payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            amount: parseFloat(amount),
            payment_date: paymentDate,
        note: note,
            send_email: sendEmail // ✅ Pass flag to API
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("✅ Funds released successfully!");
        loadPayment(); // Reload to refresh state
      } else {
        alert("❌ Failed to release funds: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error releasing funds:", err);
      alert("An error occurred while releasing funds.");
    }
  }

  // ✅ Open Edit Modal (For already paid items)
  const openEditModal = () => {
    setEditForm({
        amount: payment.amount,
        date: new Date(payment.payment_date).toISOString().split("T")[0],
        note: payment.note || ""
    });
    setShowEditModal(true);
  };

  // ✅ Handle Update (Edit existing payment)
  const handleUpdatePayment = async () => {
      if (!editForm.amount || editForm.amount <= 0) return alert("Invalid amount");
      if (!editForm.date) return alert("Date required");

      try {
        const res = await fetch(`/api/officer/reviewer-payments/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                amount: parseFloat(editForm.amount),
                payment_date: editForm.date,
                note: editForm.note,
                send_email: false // Typically don't resend email on minor edits, or add a checkbox if needed
            }),
        });

        if (res.ok) {
            alert("Payment updated successfully.");
            setShowEditModal(false);
            loadPayment();
        } else {
            alert("Failed to update payment.");
        }
      } catch (e) { console.error(e); }
  };

  // Helper Formatters
  const formatCurrency = (amt) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amt || 0);
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A";

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!payment) return <div className="alert alert-danger m-5">Payment record not found.</div>;

  const isPaid = payment.status === 1 || !!payment.payment_date;

  return (
    <div className="container-fluid px-4 mt-5 mb-5 position-relative">
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Payment Details</h2>
          <p className="text-secondary mb-0">Review and process honorarium payment.</p>
        </div>
        <div>
            <span className={`badge rounded-pill px-3 py-2 fs-6 ${isPaid ? "bg-success" : "bg-warning text-dark"}`}>
                {isPaid ? "Paid" : "Pending Action"}
            </span>
        </div>
      </div>

      <div className="row g-4">
        
        {/* LEFT: Details Card */}
        <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white border-bottom py-3 px-4">
                    <h5 className="mb-0 fw-bold text-dark">Transaction Information</h5>
                </div>
                <div className="table-responsive">
                    <table className="table mb-0">
                        <tbody>
                            <tr>
                                <th className="ps-4 py-3 bg-light text-secondary small text-uppercase" style={{width: '35%'}}>Reviewer Name</th>
                                <td className="pe-4 py-3 fw-bold text-dark">{payment.reviewer_name || "Unknown"}</td>
                            </tr>
                            <tr>
                                <th className="ps-4 py-3 bg-light text-secondary small text-uppercase">Project Title</th>
                                <td className="pe-4 py-3 text-secondary">{payment.project_title || "N/A"}</td>
                            </tr>
                            <tr>
                                <th className="ps-4 py-3 bg-light text-secondary small text-uppercase">Fiscal Year</th>
                                <td className="pe-4 py-3"><span className="badge bg-light text-secondary border">{payment.fiscal_year || "N/A"}</span></td>
                            </tr>
                            <tr>
                                <th className="ps-4 py-3 bg-light text-secondary small text-uppercase">Payment Type</th>
                                <td className="pe-4 py-3">
                                    {payment.payment_type === "proposal_review" ? "Proposal Review Honorarium" : "Final Report Review Honorarium"}
                                </td>
                            </tr>
                            <tr>
                                <th className="ps-4 py-3 bg-light text-secondary small text-uppercase">Created At</th>
                                <td className="pe-4 py-3 text-secondary small">{formatDate(payment.created_at)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* RIGHT: Action Card */}
        <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className={`card-header py-3 px-4 rounded-top-4 ${isPaid ? "bg-success text-white" : "bg-primary text-white"}`}>
                    <h5 className="mb-0 fw-bold d-flex align-items-center">
                        {isPaid ? <i className="bi bi-check-circle-fill me-2"></i> : <i className="bi bi-wallet2 me-2"></i>}
                        {isPaid ? "Payment Completed" : "Process Payment"}
                    </h5>
                </div>
                
                <div className="card-body p-4">
                    {isPaid ? (
                        <div className="text-center py-4">
                            <div className="display-4 fw-bold text-success mb-2">{formatCurrency(payment.amount)}</div>
                            <p className="text-muted mb-0">Funds released on</p>
                            <h5 className="fw-bold text-dark mb-3">{formatDate(payment.payment_date)}</h5>
                            {payment.note && <p className="text-secondary small fst-italic">"{payment.note}"</p>}
                            
                            <button className="btn btn-outline-primary btn-sm mt-3 px-4" onClick={openEditModal}>
                                <i className="bi bi-pencil-square me-2"></i> Edit Payment Details
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="alert alert-info border-0 d-flex align-items-center mb-4">
                                <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                                <small>Verify details before releasing funds. This action cannot be undone.</small>
                            </div>

                            {/* Amount Input */}
                            <div className="mb-3">
                                <label className="form-label fw-bold text-secondary">Payment Amount (৳)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0">৳</span>
                                    <input
                                        type="number"
                                        className="form-control form-control-lg bg-light border-0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Date Input */}
                            <div className="mb-3">
                                <label className="form-label fw-bold text-secondary">Payment Date</label>
                                <input
                                    type="date"
                                    className="form-control form-control-lg bg-light border-0"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                />
                            </div>

                            {/* Note Input */}
                            <div className="mb-3">
                                <label className="form-label fw-bold text-secondary">Note (Optional)</label>
                                <input
                                    type="text"
                                    className="form-control bg-light border-0"
                                    placeholder="e.g. Honorarium for proposal review"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>

                            {/* Email Toggle */}
                            <div className="mb-4">
                                <div className="form-check form-switch p-0 d-flex align-items-center gap-2">
                                    <input 
                                        className="form-check-input ms-0" 
                                        type="checkbox" 
                                        role="switch" 
                                        id="sendEmailSwitch" 
                                        checked={sendEmail}
                                        onChange={(e) => setSendEmail(e.target.checked)}
                                        style={{cursor: 'pointer'}}
                                    />
                                    <label className="form-check-label text-secondary small fw-bold" htmlFor="sendEmailSwitch" style={{cursor: 'pointer'}}>
                                        Send payment notification email to reviewer
                                    </label>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button 
                                className="btn btn-primary w-100 py-3 fw-bold shadow-sm"
                                onClick={releaseFunds}
                            >
                                Release Funds <i className="bi bi-arrow-right ms-2"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>

      {/* --- EDIT MODAL (For Updates) --- */}
      {showEditModal && (
        <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-bottom-0"><h5 className="modal-title fw-bold">Edit Payment</h5><button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button></div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-uppercase text-secondary">Amount</label>
                            <input type="number" className="form-control" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-uppercase text-secondary">Date</label>
                            <input type="date" className="form-control" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-uppercase text-secondary">Note</label>
                            <input type="text" className="form-control" value={editForm.note} onChange={(e) => setEditForm({...editForm, note: e.target.value})} />
                        </div>
                    </div>
                    <div className="modal-footer border-top-0 bg-light">
                        <button type="button" className="btn btn-link text-secondary text-decoration-none" onClick={() => setShowEditModal(false)}>Cancel</button>
                        <button type="button" className="btn btn-primary px-4 fw-bold" onClick={handleUpdatePayment}>Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}