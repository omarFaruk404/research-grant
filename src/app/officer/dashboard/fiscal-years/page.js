"use client";
import { useEffect, useState } from "react";

export default function FiscalYearsPage() {
  const [years, setYears] = useState([]);
  const [newYear, setNewYear] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Edit Modal State ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingYear, setEditingYear] = useState(null); // The full object being edited
  const [editLabel, setEditLabel] = useState(""); // The text input value

  // Fetch fiscal years
  useEffect(() => {
    fetchYears();
  }, []);

  async function fetchYears() {
    try {
      const res = await fetch("/api/fiscal-years");
      const data = await res.json();
      setYears(data);
    } catch (err) {
      console.error("Error loading fiscal years:", err);
    }
  }

  // Add new year
  const addFiscalYear = async () => {
    if (!newYear.trim()) return alert("Please enter a valid year label.");
    setLoading(true);
    try {
      const res = await fetch("/api/fiscal-years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year_label: newYear }),
      });
      if (res.ok) {
        const data = await res.json();
        setYears((prev) => [...prev, data]);
        setNewYear("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add fiscal year.");
      }
    } catch (err) {
      console.error("Error adding fiscal year:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle active year
  const toggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/fiscal-years/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: currentStatus ? 0 : 1 }),
      });
      
      if (res.ok) {
        // Optimistic UI update or fetch again
        setYears((prev) =>
          prev.map((y) => (y.id === id ? { ...y, is_active: !currentStatus } : y))
        );
      } else {
        alert("Failed to toggle status.");
      }
    } catch (err) {
      console.error("Error toggling year:", err);
    }
  };

  // Open Edit Modal
  const openEditModal = (yearObj) => {
    setEditingYear(yearObj);
    setEditLabel(yearObj.year_label);
    setShowEditModal(true);
  };

  // Save Edited Label
  const handleUpdateLabel = async () => {
    if (!editLabel.trim()) return alert("Label cannot be empty.");
    
    try {
      const res = await fetch(`/api/fiscal-years/${editingYear.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year_label: editLabel }), // Only updating label
      });

      if (res.ok) {
        setYears((prev) =>
          prev.map((y) => (y.id === editingYear.id ? { ...y, year_label: editLabel } : y))
        );
        setShowEditModal(false);
      } else {
        alert("Failed to update fiscal year.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Fiscal Year Management</h2>
          <p className="text-secondary mb-0">Create, edit, and manage active fiscal periods.</p>
        </div>
      </div>

      <div className="row g-4">
        
        {/* LEFT: Add New Card */}
        <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-white border-bottom py-3 px-4">
                    <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-plus-circle me-2 text-primary"></i> Add New Year</h5>
                </div>
                <div className="card-body p-4 d-flex flex-column justify-content-center">
                    <label className="form-label fw-medium text-secondary">Fiscal Year Label</label>
                    <input
                        type="text"
                        className="form-control form-control-lg mb-3"
                        placeholder="e.g. 2025-2026"
                        value={newYear}
                        onChange={(e) => setNewYear(e.target.value)}
                    />
                    <button
                        className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                        onClick={addFiscalYear}
                        disabled={loading}
                    >
                        {loading ? "Adding..." : "Create Fiscal Year"}
                    </button>
                    <small className="text-muted mt-3 text-center">
                        <i className="bi bi-info-circle me-1"></i> New years are inactive by default.
                    </small>
                </div>
            </div>
        </div>

        {/* RIGHT: List Table */}
        <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold text-dark">Existing Fiscal Years</h5>
                    <span className="badge bg-light text-secondary border">{years.length} Records</span>
                </div>
                <div className="table-responsive">
                    <table className="table mb-0 align-middle">
                        <thead style={{ backgroundColor: "#5c67f2" }}>
                            <tr>
                                <th className="text-white small fw-bold py-3 ps-4" style={{width: '40%' ,backgroundColor: "#5c67f2"}}>Year Label</th>
                                <th className="text-white small fw-bold py-3 text-center" style={{backgroundColor: "#5c67f2"}}>Status</th>
                                <th className="text-white small fw-bold py-3 text-center" style={{backgroundColor: "#5c67f2"}}>Active State</th>
                                <th className="text-white small fw-bold py-3 pe-4 text-end" style={{backgroundColor: "#5c67f2"}}>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {years.length > 0 ? (
                                years.map((fy) => (
                                    <tr key={fy.id} className="border-bottom hover-bg-light">
                                        <td className="ps-4 py-3 fw-bold text-dark">{fy.year_label}</td>
                                        <td className="py-3 text-center">
                                            {fy.is_active ? (
                                                <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3">Active</span>
                                            ) : (
                                                <span className="badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle px-3">Inactive</span>
                                            )}
                                        </td>
                                        <td className="py-3 text-center">
                                            <div className="form-check form-switch d-inline-block">
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    role="switch" 
                                                    checked={!!fy.is_active} 
                                                    onChange={() => toggleActive(fy.id, fy.is_active)}
                                                    style={{ cursor: "pointer", width: "3em", height: "1.5em" }}
                                                />
                                            </div>
                                        </td>
                                        <td className="pe-4 py-3 text-end">
                                            <button 
                                                className="btn btn-sm btn-light border text-primary shadow-sm"
                                                onClick={() => openEditModal(fy)}
                                                title="Edit Label"
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        <i className="bi bi-calendar-x fs-1 d-block mb-2 opacity-50"></i>
                                        No fiscal years found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {showEditModal && (
        <>
            <div className="modal-backdrop show" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}></div>
            <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg">
                        <div className="modal-header border-bottom-0">
                            <h5 className="modal-title fw-bold">Edit Fiscal Year</h5>
                            <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                        </div>
                        <div className="modal-body p-4 pt-0">
                            <label className="form-label fw-bold small text-uppercase text-secondary">Year Label</label>
                            <input 
                                type="text" 
                                className="form-control form-control-lg" 
                                value={editLabel} 
                                onChange={(e) => setEditLabel(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="modal-footer border-top-0 bg-light">
                            <button type="button" className="btn btn-link text-secondary text-decoration-none" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button type="button" className="btn btn-primary px-4 fw-bold" onClick={handleUpdateLabel}>Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
      )}

    </div>
  );
}