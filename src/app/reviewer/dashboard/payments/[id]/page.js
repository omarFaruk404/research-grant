"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReviewerPaymentDetails() {
  const { id } = useParams(); // project_id
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!storedUser) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);

      if (!parsed.reviewer_id) {
        setLoading(false);
        return;
      }

      fetchDetails(parsed.reviewer_id);
    } catch {
      setLoading(false);
    }

    async function fetchDetails(reviewerId) {
      try {
        const res = await fetch(`/api/reviewer/payments/${id}?reviewer_id=${reviewerId}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setProject(data.project);
        } else {
          setProject(null);
        }
      } catch (err) {
        console.error(err);
        setProject(null);
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  if (loading) return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"></div></div>;

  if (!project)
    return (
      <div className="container-fluid px-4 mt-5 position-relative">
         <div className="alert alert-danger d-inline-block px-5">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> Reviewer payment details not found.
         </div>
         <div className="mt-3">
            <button onClick={() => router.back()} className="btn btn-secondary">Go Back</button>
         </div>
      </div>
    );

  return (
    <div className="container-fluid py-4">
      
      {/* 0. Back Button */}
      <div className="mb-4">
        <button 
            onClick={() => router.back()} 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3 fw-medium bg-white shadow-sm border-0"
        >
            <i className="bi bi-arrow-left"></i> Back to List
        </button>
      </div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
            <h3 className="fw-bold text-dark mb-0">Payment Details</h3>
            <p className="text-muted mb-0 mt-1">Detailed breakdown for <span className="fw-bold text-primary">{project.code_no || "Project"}</span></p>
        </div>
      </div>

      <div className="row g-4">
        
        {/* ---- Left Col: Project Info ---- */}
        <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-white p-4 border-bottom">
                    <h5 className="fw-bold mb-0 text-dark">Project Information</h5>
                </div>
                <div className="card-body p-4">
                    <div className="mb-4">
                        <label className="text-uppercase text-muted small fw-bold">Project Title</label>
                        <p className="fs-5 fw-bold text-dark mb-0">{project.title}</p>
                    </div>
                    
                    <div className="row g-4">
                        <div className="col-md-6">
                             <label className="text-uppercase text-muted small fw-bold">Project Code</label>
                             <div className="fs-6 text-dark">{project.code_no || "N/A"}</div>
                        </div>
                        <div className="col-md-6">
                             <label className="text-uppercase text-muted small fw-bold">Review Type</label>
                             <div className="fs-6 text-dark">
                                {project.review_type === 1 ? "Proposal Review" : "Final Report Review"}
                             </div>
                        </div>
                        <div className="col-md-6">
                             <label className="text-uppercase text-muted small fw-bold">Review Status</label>
                             <div>
                                <span className={`badge px-3 py-2 rounded-pill ${project.review_status === 'submitted' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                    {project.review_status}
                                </span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* ---- Right Col: Summary Cards ---- */}
        <div className="col-lg-4">
            <div className="row g-3">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 bg-success text-white">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="mb-0 text-white-50 text-uppercase small fw-bold">Total Paid</p>
                                    <h2 className="fw-bold mb-0">৳ {project.totalPaid.toLocaleString()}</h2>
                                </div>
                                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                                    <i className="bi bi-check-lg fs-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 bg-warning text-dark">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="mb-0 text-dark text-opacity-75 text-uppercase small fw-bold">Total Pending</p>
                                    <h2 className="fw-bold mb-0">৳ {project.totalPending.toLocaleString()}</h2>
                                </div>
                                <div className="bg-white bg-opacity-50 p-3 rounded-circle">
                                    <i className="bi bi-hourglass-split fs-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* ---- Bottom Row: Payment History Table ---- */}
        <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white p-4 border-bottom">
                    <h5 className="fw-bold mb-0 text-dark">Transaction History</h5>
                </div>
                
                {project.payments.length === 0 ? (
                    <div className="p-5 text-center text-muted">
                        <i className="bi bi-wallet2 fs-1 d-block mb-3 text-secondary"></i>
                        No payment records found for this project.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#5c67f2" }}>
                                    <th className="text-white small fw-bold py-3 ps-4" style={{ border: "none",backgroundColor: "#5c67f2" }}>Description</th>
                                    <th className="text-white small fw-bold py-3" style={{ border: "none" ,backgroundColor: "#5c67f2" }}>Amount</th>
                                    <th className="text-white small fw-bold py-3" style={{ border: "none" ,backgroundColor: "#5c67f2" }}>Status</th>
                                    <th className="text-white small fw-bold py-3 pe-4 text-end" style={{ border: "none",backgroundColor: "#5c67f2" }}>Processed Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {project.payments.map((p, idx) => (
                                    <tr key={p.id} className="align-middle border-bottom hover-bg-light">
                                        <td className="ps-4 py-3">
                                            <span className="fw-medium text-dark">
                                                {p.payment_type === "proposal_review" ? "Proposal Review Fee" : "Final Report Review Fee"}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className="fw-bold text-dark">৳ {Number(p.amount || 0).toLocaleString()}</span>
                                        </td>
                                        <td className="py-3">
                                            {p.status === 1 ? (
                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                                                    <i className="bi bi-check-circle-fill me-1"></i> Paid
                                                </span>
                                            ) : (
                                                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 rounded-pill">
                                                    <i className="bi bi-hourglass-split me-1"></i> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="pe-4 py-3 text-end text-secondary small">
                                            {p.payment_date 
                                                ? new Date(p.payment_date).toLocaleDateString("en-GB", {day: 'numeric', month: 'long', year: 'numeric'}) 
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
        
        {/* Footer Info */}
        <div className="col-12">
            <div className="alert alert-light border d-flex align-items-center gap-3 text-secondary shadow-sm rounded-3">
                <i className="bi bi-info-circle-fill fs-5 text-primary"></i>
                <div>
                    This page is read-only. If you notice discrepancies in payment status or amounts, please contact the <strong>Research Support Office</strong>.
                </div>
            </div>
        </div>

      </div>

      <style jsx>{`
        .hover-bg-light:hover { background-color: #f8f9fa; }
      `}</style>
    </div>
  );
}