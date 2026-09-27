"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ResearcherPaymentManage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  
  // ✅ Added sendEmail to state (default true)
  const [newPayment, setNewPayment] = useState({ amount: "", note: "", date: "", sendEmail: true });
  const [loading, setLoading] = useState(true);

  // --- Modal States ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editForm, setEditForm] = useState({ amount: "", note: "", date: "" });

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/officer/researcher-payments/${id}`);
      const data = await res.json();
      if (data.success) setProject(data.project);
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcTotalReleased = () => {
    if (!project) return 0;
    return project.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  };

  const totalReleased = calcTotalReleased();
  const remaining = project ? project.allocated_budget - totalReleased : 0;

  // --- ACTIONS ---

  const handleAddPayment = async () => {
    if (!newPayment.amount || newPayment.amount <= 0) return alert("Enter valid payment amount.");
    if (!newPayment.date) return alert("Payment date is mandatory.");
    if (parseFloat(newPayment.amount) > remaining) return alert("Payment exceeds remaining balance.");

    const res = await fetch(`/api/officer/researcher-payments/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
          type: "add_payment", 
          amount: newPayment.amount, 
          note: newPayment.note, 
          payment_date: newPayment.date,
          send_email: newPayment.sendEmail // ✅ Pass the flag
      }),
    });
    const json = await res.json();
    if (json.success) {
      // Reset form (keep email checked by default)
      setNewPayment({ amount: "", note: "", date: "", sendEmail: true });
      fetchProject();
    }
  };

  // --- EDIT Logic ---
  const openEditModal = (payment) => {
    setSelectedPayment(payment);
    const dateStr = payment.payment_date ? new Date(payment.payment_date).toISOString().split('T')[0] : "";
    setEditForm({ amount: payment.amount, note: payment.payment_note || "", date: dateStr });
    setShowEditModal(true);
  };

  const handleUpdatePayment = async () => {
    if (!editForm.amount || editForm.amount <= 0) return alert("Invalid amount");
    if (!editForm.date) return alert("Date required");

    const currentPaymentAmount = parseFloat(selectedPayment.amount);
    const potentialRemaining = remaining + currentPaymentAmount; 
    
    if (parseFloat(editForm.amount) > potentialRemaining) return alert("New amount exceeds budget limit.");

    try {
        const res = await fetch(`/api/officer/researcher-payments/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                payment_id: selectedPayment.id,
                amount: editForm.amount,
                note: editForm.note,
                payment_date: editForm.date
            }),
        });
        if(res.ok) {
            setShowEditModal(false);
            fetchProject();
        } else {
            alert("Failed to update payment");
        }
    } catch (e) { console.error(e); }
  };

  // --- DELETE Logic ---
  const openDeleteModal = (payment) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
  };

  const handleDeletePayment = async () => {
    try {
        const res = await fetch(`/api/officer/researcher-payments/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payment_id: selectedPayment.id }),
        });
        if(res.ok) {
            setShowDeleteModal(false);
            fetchProject();
        } else {
            alert("Failed to delete payment");
        }
    } catch (e) { console.error(e); }
  };

  // --- HELPERS ---
  const formatCurrency = (amount) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount || 0);
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "-";

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!project) return <div className="alert alert-danger m-5">Project not found</div>;

  return (
    <div className="container-fluid px-4 mt-5 mb-5 position-relative">
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Payment Management</h2>
          <p className="text-secondary mb-0">Manage funds and payment records for the selected project.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN: Overview */}
        <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-header bg-white border-bottom py-3"><h5 className="mb-0 fw-bold text-dark">Project Overview</h5></div>
                <div className="card-body p-0">
                    <table className="table mb-0">
                        <tbody>
                            <tr><th className="ps-4 py-3 bg-light text-secondary small text-uppercase" style={{width: "40%"}}>Project Title</th><td className="pe-4 py-3 fw-medium text-dark">{project.title}</td></tr>
                            <tr><th className="ps-4 py-3 bg-light text-secondary small text-uppercase">Researcher</th><td className="pe-4 py-3 text-dark">{project.researcher_name}</td></tr>
                            <tr><th className="ps-4 py-3 bg-light text-secondary small text-uppercase">Allocated Budget</th><td className="pe-4 py-3 fw-bold text-dark">{formatCurrency(project.allocated_budget)}</td></tr>
                            <tr><th className="ps-4 py-3 bg-light text-secondary small text-uppercase">Total Released</th><td className="pe-4 py-3 text-success fw-bold">{formatCurrency(totalReleased)}</td></tr>
                            <tr><th className="ps-4 py-3 bg-light text-secondary small text-uppercase">Remaining</th><td className={`pe-4 py-3 fw-bold ${remaining <= 0 ? "text-success" : "text-primary"}`}>{formatCurrency(remaining)}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-lg-7">
            {/* Add Payment Form */}
            {project.allocated_budget > 0 ? (
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className="card-header bg-dark text-white py-3 rounded-top-4">
                         <h5 className="mb-0 fw-bold"><i className="bi bi-wallet2 me-2"></i> Release New Payment</h5>
                    </div>
                    <div className="card-body p-4">
                        {remaining > 0 ? (
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="d-flex justify-content-between mb-1"><label className="form-label fw-bold text-secondary">Payment Amount <span className="text-danger">*</span></label><small className="text-muted" style={{fontSize: '0.75rem'}}>Max: {remaining}</small></div>
                                    <div className="input-group"><span className="input-group-text bg-light border-0">৳</span><input type="number" className="form-control bg-light border-0" placeholder="Amount" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} /></div>
                                </div>
                                <div className="col-md-6"><label className="form-label fw-bold text-secondary">Payment Date <span className="text-danger">*</span></label><input type="date" className="form-control bg-light border-0" value={newPayment.date} onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })} /></div>
                                <div className="col-12"><label className="form-label fw-bold text-secondary">Note (Optional)</label><input type="text" className="form-control bg-light border-0" placeholder="e.g. 1st Installment" value={newPayment.note} onChange={(e) => setNewPayment({ ...newPayment, note: e.target.value })} /></div>
                                
                                {/* ✅ EMAIL TOGGLE SWITCH */}
                                <div className="col-12 mt-2">
                                    <div className="form-check form-switch p-0 d-flex align-items-center gap-2">
                                        <input 
                                            className="form-check-input ms-0" 
                                            type="checkbox" 
                                            role="switch" 
                                            id="sendEmailSwitch" 
                                            checked={newPayment.sendEmail}
                                            onChange={(e) => setNewPayment({ ...newPayment, sendEmail: e.target.checked })}
                                            style={{cursor: 'pointer'}}
                                        />
                                        <label className="form-check-label text-secondary small fw-bold" htmlFor="sendEmailSwitch" style={{cursor: 'pointer'}}>
                                            Send payment notification email to researcher
                                        </label>
                                    </div>
                                </div>

                                <div className="col-12 mt-3"><button className="btn btn-success w-100 fw-bold py-2 shadow-sm" onClick={handleAddPayment}><i className="bi bi-check-lg me-2"></i> Confirm Payment Release</button></div>
                            </div>
                        ) : (
                            <div className="text-center py-4"><div className="text-success fs-1 mb-2"><i className="bi bi-check-circle-fill"></i></div><h5 className="fw-bold text-dark">Budget Fully Released</h5><p className="text-muted mb-0">No remaining balance available.</p></div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="alert alert-warning mb-4">No allocated budget found for this project.</div>
            )}

            {/* Payment History Table */}
            <div className="card border-0 shadow-sm rounded-4" style={{overflow: "hidden"}}>
                <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center px-4">
                    <h5 className="mb-0 fw-bold text-dark">Payment History</h5>
                    <span className="badge bg-light text-secondary border">{project.payments.length} Records</span>
                </div>
                <div className="table-responsive">
                    <table className="table mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-secondary small text-uppercase">Slot</th>
                                <th className="py-3 text-secondary small text-uppercase">Date</th>
                                <th className="py-3 text-secondary small text-uppercase">Note</th>
                                <th className="py-3 text-secondary small text-uppercase text-end">Amount</th>
                                <th className="pe-4 py-3 text-secondary small text-uppercase text-center" style={{width: '120px'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {project.payments.length > 0 ? (
                                project.payments.map((p) => (
                                    <tr key={p.id} className="align-middle border-bottom">
                                        <td className="ps-4 py-3 fw-bold text-primary">#{p.payment_slot}</td>
                                        <td className="py-3 text-secondary small">{formatDate(p.payment_date)}</td>
                                        <td className="py-3 text-secondary small fst-italic">{p.payment_note || "-"}</td>
                                        <td className="py-3 fw-medium text-dark text-end">{formatCurrency(p.amount)}</td>
                                        <td className="pe-4 py-3 text-center">
                                            <div className="btn-group btn-group-sm">
                                                <button onClick={() => openEditModal(p)} className="btn btn-light border text-primary" title="Edit"><i className="bi bi-pencil-square"></i></button>
                                                <button onClick={() => openDeleteModal(p)} className="btn btn-light border text-danger" title="Delete"><i className="bi bi-trash"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="text-center py-5 text-muted">No payments released yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
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

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-body p-4 text-center">
                        <div className="mb-3 text-danger"><i className="bi bi-exclamation-circle fs-1"></i></div>
                        <h5 className="fw-bold mb-2">Delete Payment?</h5>
                        <p className="text-muted small mb-4">Are you sure you want to delete this payment record? This action cannot be undone.</p>
                        <div className="d-grid gap-2">
                            <button type="button" className="btn btn-danger fw-bold" onClick={handleDeletePayment}>Yes, Delete</button>
                            <button type="button" className="btn btn-light text-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}