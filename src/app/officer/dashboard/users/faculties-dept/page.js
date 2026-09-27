"use client";

import { useState, useEffect } from "react";

export default function FacultiesDepartmentsPage() {
  // Data State
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState("faculties"); // 'faculties' | 'departments'
  const [searchTerm, setSearchTerm] = useState(""); // Search State

  // Add Form State
  const [newFaculty, setNewFaculty] = useState("");
  const [newDepartment, setNewDepartment] = useState({ name: "", faculty_id: "" });
  const [loading, setLoading] = useState(false);

  // Modal & Edit State
  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState("edit"); // 'edit' | 'success'
  const [editingItem, setEditingItem] = useState(null); // { id, type: 'faculty'|'department', name, faculty_id? }

  useEffect(() => {
    fetchData();
  }, []);

  // Reset search when switching tabs
  useEffect(() => {
    setSearchTerm("");
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/faculties-departments");
      const data = await res.json();
      setFaculties(data.faculties || []);
      setDepartments(data.departments || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // --- Filtering Logic ---
  const filteredFaculties = faculties.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDepartments = departments.filter(d => {
    const facultyName = faculties.find(f => f.id === d.faculty_id)?.name || "";
    return d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           facultyName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // --- Add Logic ---
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!newFaculty.trim()) return alert("Faculty name cannot be empty");

    setLoading(true);
    try {
      const res = await fetch("/api/officer/faculties-dept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "faculty", name: newFaculty }),
      });
      const data = await res.json();
      if (data.message) {
        alert("Faculty added successfully!");
        setNewFaculty("");
        fetchData();
        setActiveTab("faculties");
      } else {
        alert(data.error || "Failed to add faculty");
      }
    } catch (err) {
      alert("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDepartment.name.trim() || !newDepartment.faculty_id)
      return alert("Please select a faculty and enter department name");

    setLoading(true);
    try {
      const res = await fetch("/api/officer/faculties-dept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "department",
          name: newDepartment.name,
          faculty_id: newDepartment.faculty_id,
        }),
      });
      const data = await res.json();
      if (data.message) {
        alert("Department added successfully!");
        setNewDepartment({ name: "", faculty_id: "" });
        fetchData();
        setActiveTab("departments");
      } else {
        alert(data.error || "Failed to add department");
      }
    } catch (err) {
      alert("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  // --- Edit Logic ---
  const openEditModal = (item, type) => {
    setEditingItem({ ...item, type });
    setModalState("edit");
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!editingItem.name.trim()) return alert("Name cannot be empty");
    if (editingItem.type === "department" && !editingItem.faculty_id) return alert("Faculty is required");

    setLoading(true);
    try {
      const res = await fetch("/api/officer/faculties-dept", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      const data = await res.json();

      if (res.ok) {
        setModalState("success"); 
        fetchData(); 
      } else {
        alert(data.error || "Failed to update");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <div className="container-fluid px-4 mt-5 pb-5 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
            <h2 className="fw-bold text-dark mb-0">Academic Structure</h2>
            <p className="text-secondary small mb-0">Manage Faculties & Departments</p>
        </div>
      </div>

      <div className="row g-4">
        
        {/* LEFT COLUMN: ADD FORMS */}
        <div className="col-lg-4">
            {/* Add Faculty Card */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-header bg-white py-3">
                    <h6 className="fw-bold text-primary mb-0"><i className="bi bi-mortarboard-fill me-2"></i>Add Faculty</h6>
                </div>
                <div className="card-body">
                    <form onSubmit={handleAddFaculty}>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary">Faculty Name</label>
                            <input
                                type="text"
                                className="form-control bg-light border-0"
                                placeholder="e.g. Science & Engineering"
                                value={newFaculty}
                                onChange={(e) => setNewFaculty(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary w-100 fw-bold" disabled={loading}>
                            {loading ? <span className="spinner-border spinner-border-sm"></span> : "Add Faculty"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Add Department Card */}
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white py-3">
                    <h6 className="fw-bold text-success mb-0"><i className="bi bi-building-fill me-2"></i>Add Department</h6>
                </div>
                <div className="card-body">
                    <form onSubmit={handleAddDepartment}>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary">Select Faculty</label>
                            <select
                                className="form-select bg-light border-0"
                                value={newDepartment.faculty_id}
                                onChange={(e) => setNewDepartment({ ...newDepartment, faculty_id: e.target.value })}
                            >
                                <option value="">-- Choose Faculty --</option>
                                {faculties.map((f) => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary">Department Name</label>
                            <input
                                type="text"
                                className="form-control bg-light border-0"
                                placeholder="e.g. Computer Science"
                                value={newDepartment.name}
                                onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                            />
                        </div>
                        <button className="btn btn-success w-100 fw-bold" disabled={loading}>
                            {loading ? <span className="spinner-border spinner-border-sm"></span> : "Add Department"}
                        </button>
                    </form>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: LISTS with SEARCH & TOGGLE */}
        <div className="col-lg-8">
            
            {/* Header: Tabs + Search */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                
                {/* View Toggle Tabs */}
                <div className="d-flex bg-white p-1 rounded-pill shadow-sm border" style={{ width: "fit-content" }}>
                    <button 
                        className={`btn rounded-pill fw-bold px-4 ${activeTab === "faculties" ? "btn-primary" : "btn-white text-secondary"}`}
                        onClick={() => setActiveTab("faculties")}
                    >
                        Faculties
                    </button>
                    <button 
                        className={`btn rounded-pill fw-bold px-4 ${activeTab === "departments" ? "btn-success text-white" : "btn-white text-secondary"}`}
                        onClick={() => setActiveTab("departments")}
                    >
                        Departments
                    </button>
                </div>

                {/* Search Bar */}
                <div className="position-relative" style={{ minWidth: "250px" }}>
                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                    <input 
                        type="text" 
                        className="form-control rounded-pill ps-5 border-0 shadow-sm" 
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Faculties Table */}
            {activeTab === "faculties" && (
                <div className="card border-0 shadow-sm rounded-4 mb-4 animate-fade">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold text-primary mb-0">Existing Faculties</h6>
                        <span className="badge bg-primary-subtle text-primary rounded-pill">{filteredFaculties.length} Found</span>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Name</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFaculties.length > 0 ? filteredFaculties.map((f) => (
                                        <tr key={f.id}>
                                            <td className="ps-4 fw-medium text-dark">{f.name}</td>
                                            <td className="text-end pe-4">
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary border-0 rounded-circle"
                                                    onClick={() => openEditModal(f, "faculty")}
                                                    title="Edit Faculty"
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="2" className="text-center py-4 text-muted">No faculties found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Departments Table */}
            {activeTab === "departments" && (
                <div className="card border-0 shadow-sm rounded-4 animate-fade">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold text-success mb-0">Existing Departments</h6>
                        <span className="badge bg-success-subtle text-success rounded-pill">{filteredDepartments.length} Found</span>
                    </div>
                    <div className="card-body p-0">
                         <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Department Name</th>
                                        <th>Faculty</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDepartments.length > 0 ? filteredDepartments.map((d) => (
                                        <tr key={d.id}>
                                            <td className="ps-4 fw-medium text-dark">{d.name}</td>
                                            <td>
                                                <span className="badge bg-light text-secondary border">
                                                    {faculties.find((f) => f.id === d.faculty_id)?.name || "Unknown"}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary border-0 rounded-circle"
                                                    onClick={() => openEditModal(d, "department")}
                                                    title="Edit Department"
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" className="text-center py-4 text-muted">No departments found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* --- CONFIRMATION & SUCCESS MODAL --- */}
      {showModal && editingItem && (
        <div className="modal-backdrop-custom d-flex justify-content-center align-items-center">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden animate-up" style={{ width: "450px", maxWidth: "90%" }}>
                
                {/* 1. EDIT MODE */}
                {modalState === "edit" && (
                    <>
                        <div className="card-header bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-bold">Edit {editingItem.type === 'faculty' ? 'Faculty' : 'Department'}</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="alert alert-light border border-warning-subtle text-dark small mb-3">
                                <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                                Are you sure you want to update this? Changes will be reflected immediately.
                            </div>

                            {/* Name Input */}
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-secondary">Name</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                                />
                            </div>

                            {/* Faculty Dropdown (Only for Departments) */}
                            {editingItem.type === "department" && (
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary">Assigned Faculty</label>
                                    <select 
                                        className="form-select"
                                        value={editingItem.faculty_id}
                                        onChange={(e) => setEditingItem({...editingItem, faculty_id: parseInt(e.target.value)})}
                                    >
                                        <option value="">Select Faculty</option>
                                        {faculties.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="card-footer bg-light p-3 d-flex justify-content-end gap-2">
                            <button className="btn btn-light border" onClick={closeModal}>Cancel</button>
                            <button className="btn btn-primary px-4 fw-bold" onClick={handleUpdate} disabled={loading}>
                                {loading ? "Updating..." : "Confirm Update"}
                            </button>
                        </div>
                    </>
                )}

                {/* 2. SUCCESS MODE */}
                {modalState === "success" && (
                    <div className="card-body p-5 text-center">
                        <div className="mb-3">
                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }}></i>
                        </div>
                        <h4 className="fw-bold text-success">Update Successful!</h4>
                        <p className="text-secondary">The {editingItem.type} has been updated.</p>
                        <button className="btn btn-success px-5 rounded-pill fw-bold mt-3" onClick={closeModal}>
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* CSS for Modal Overlay & Animations */}
      <style jsx>{`
        .modal-backdrop-custom {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1050;
            backdrop-filter: blur(4px);
        }
        .animate-up {
            animation: slideUp 0.3s ease-out;
        }
        .animate-fade {
            animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}