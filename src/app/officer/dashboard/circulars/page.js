"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CircularsPage() {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const router = useRouter();

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [circularToDelete, setCircularToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    fetchCirculars();
  }, []);

  const fetchCirculars = async () => {
    try {
      const res = await fetch("/api/circulars");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setCirculars(data);
      } else if (data.circulars) {
        setCirculars(data.circulars);
      } else {
        setCirculars([]);
      }
    } catch (error) {
      console.error("Failed to fetch circulars:", error);
    } finally {
        setLoading(false);
    }
  };

  // --- ACTIONS ---
  const handleView = (id) => {
    router.push(`/officer/dashboard/circulars/${id}`);
  };

  const handleEdit = (id) => {
    router.push(`/officer/dashboard/circulars/${id}/edit`);
  };

  // --- DELETE HANDLERS ---
  const initiateDelete = (id) => {
    setCircularToDelete(id);
    setDeletePassword("");
    setIsDeleted(false);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowDeleteModal(false);
    setCircularToDelete(null);
    setDeletePassword("");
    setIsDeleted(false);
  };

  const confirmDelete = async () => {
    if (!deletePassword) return alert("Please enter your password.");
    
    setIsDeleting(true);
    try {
      const res = await fetch("/api/circulars/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            circular_id: circularToDelete,
            password: deletePassword,
            currentUserId: 1 // ⚠️ Replace with actual logged-in user ID
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const updatedList = circulars.filter((c) => c.id !== circularToDelete);
        setCirculars(updatedList);
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const getTypeBadgeClass = (type) => {
    if (type === "proposal") return "bg-success-subtle text-success";
    if (type === "notice") return "bg-primary-subtle text-primary";
    return "bg-secondary-subtle text-secondary";
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Circulars</h2>
        <button
          onClick={() => router.push("/officer/dashboard/circulars/create-circular")}
          className="btn btn-primary px-4 py-2 fw-semibold"
          style={{ backgroundColor: "#5c67f2", borderColor: "#5c67f2" }}
        >
          + Create Circular
        </button>
      </div>

      {circulars.length > 0 ? (
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
                  <th className="text-white text-uppercase small fw-bold py-3 pe-4 text-end" style={{ backgroundColor: "#5c67f2", border: "none" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {circulars.map((c) => (
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
                      <div className="d-flex justify-content-end gap-2">
                        {/* VIEW */}
                        <button onClick={(e) => { e.stopPropagation(); handleView(c.id); }} className="btn btn-sm btn-light text-primary border-0" style={{ backgroundColor: "#eef2ff" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>
                        </button>
                        {/* EDIT */}
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(c.id); }} className="btn btn-sm btn-light text-warning border-0" style={{ backgroundColor: "#fff8e1" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/></svg>
                        </button>
                        {/* DELETE */}
                        <button onClick={(e) => { e.stopPropagation(); initiateDelete(c.id); }} className="btn btn-sm btn-light text-danger border-0" style={{ backgroundColor: "#fee2e2" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16"><path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="alert alert-light text-center mt-4 p-5 shadow-sm rounded"><p className="text-muted mb-3">No circulars found.</p></div>
      )}

      {/* --- DELETE MODAL --- */}
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
                                    <p className="text-muted mb-4">Are you sure you want to delete this circular? This action <strong>cannot be undone</strong>.</p>
                                    <label className="form-label fw-bold small text-uppercase text-secondary">Enter your password to confirm</label>
                                    <input type="password" className="form-control form-control-lg bg-light" placeholder="Password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} autoFocus />
                                </div>
                                <div className="modal-footer bg-light border-0">
                                    <button type="button" className="btn btn-link text-secondary text-decoration-none fw-medium" onClick={closeModal} disabled={isDeleting}>Cancel</button>
                                    <button type="button" className="btn btn-danger fw-bold px-4" onClick={confirmDelete} disabled={isDeleting}>
                                        {isDeleting ? <span><span className="spinner-border spinner-border-sm me-2"></span>Deleting...</span> : "Delete Circular"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="modal-header bg-success text-white border-0 justify-content-center"><h5 className="modal-title fw-bold">Deleted Successfully</h5></div>
                                <div className="modal-body p-5 text-center">
                                    <div className="mb-3 text-success"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg></div>
                                    <h5 className="fw-bold text-dark">Circular Deleted</h5>
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