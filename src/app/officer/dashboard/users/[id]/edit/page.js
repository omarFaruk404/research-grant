"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  
  // Form State
  const [role, setRole] = useState(2);
  const [universityChoice, setUniversityChoice] = useState("unibarishal"); 
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    faculty_id: "",
    department_id: "",      
    department_text: "",    
    designation: "",
    university: "University of Barishal",
    photo: null,
    photoPreview: null,
  });

  const roleOptions = [
    { value: 2, label: "Researcher" },
    { value: 3, label: "Reviewer" },
    { value: 4, label: "Both (Researcher & Reviewer)" },
  ];

  // 1. Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch both resources in parallel
        const [userRes, optionsRes] = await Promise.all([
            fetch(`/api/users/${id}`),
            fetch("/api/faculties-departments")
        ]);

        const userData = await userRes.json();
        const optionsData = await optionsRes.json();

        // 1. Set Options State
        const allFaculties = optionsData.faculties || [];
        const allDepartments = optionsData.departments || [];
        setFaculties(allFaculties);
        setDepartments(allDepartments);

        // 2. Process User Data
        if (userData.user) {
            const { user, researcher, reviewer } = userData;
            
            setRole(user.role);

            // -- Logic for Reviewer University --
            let initialUniChoice = "unibarishal";
            let initialUniName = "University of Barishal";
            if (reviewer?.university && reviewer.university !== "University of Barishal") {
                initialUniChoice = "others";
                initialUniName = reviewer.university;
            }
            setUniversityChoice(initialUniChoice);

            // -- Logic to Pre-fill Faculty & Dept --
            let activeDeptId = researcher?.department_id || reviewer?.department_id || "";
            let activeFacultyId = researcher?.faculty_id || "";

            // Important: If we have a Dept ID but NO Faculty ID (common for Internal Reviewers),
            // find the faculty from the departments list.
            if (activeDeptId && !activeFacultyId) {
                const foundDept = allDepartments.find(d => d.id === activeDeptId);
                if (foundDept) {
                    activeFacultyId = foundDept.faculty_id;
                }
            }

            setForm({
                name: user.name,
                email: user.email,
                phone: user.phone || "",
                password: "", 
                faculty_id: activeFacultyId,
                department_id: activeDeptId,
                department_text: reviewer?.department || "", // External Dept Name
                designation: researcher?.designation || reviewer?.designation || "",
                university: initialUniName,
                photo: null, 
                photoPreview: user.photo || null, 
            });
        }
      } catch (error) {
        console.error("Error initializing page:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  // 2. Filter Departments Effect
  // Runs whenever faculty_id changes (user selection) OR departments list loads
  useEffect(() => {
    if (form.faculty_id && departments.length > 0) {
      const filtered = departments.filter((d) => d.faculty_id === parseInt(form.faculty_id));
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments([]);
    }
  }, [form.faculty_id, departments]);

  const handleUniversityChange = (choice) => {
    setUniversityChoice(choice);
    if (choice === "unibarishal") {
      setForm((prev) => ({ ...prev, university: "University of Barishal", department_text: "" }));
    } else {
      setForm((prev) => ({ ...prev, university: "", faculty_id: "", department_id: "" }));
      
      if (role === 2 || role === 4) {
          setRole(3); 
          alert("Note: External members can only be Reviewers.");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (universityChoice === "others" && (role === 2 || role === 4)) {
        alert("External members cannot be Researchers. Please select 'Reviewer' role.");
        return;
    }
    
    const fd = new FormData();
    Object.keys(form).forEach((key) => {
      if (key !== "photoPreview" && key !== "photo") {
        fd.append(key, form[key]);
      }
    });
    
    fd.append("role", role);

    if (form.photo) {
      fd.append("photo", form.photo);
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        body: fd,
      });
      const json = await res.json();

      if (res.ok) {
        alert("User updated successfully!");
        router.push(`/officer/dashboard/users/${id}`);
      } else {
        alert(json.error || "Failed to update user.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating.");
    }
  };

  // Helper to show internal dropdowns
  const showInternalDropdowns = (role === 2 || role === 4) || (role === 3 && universityChoice === "unibarishal");

  // Helper to get role options status
  const getRoleDisabled = (targetValue) => {
      if (universityChoice === "others") {
          return targetValue === 2 || targetValue === 4; 
      }
      return false; 
  };

  if (loading) {
    return <div className="d-flex justify-content-center mt-5"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="container-fluid px-4 mt-5 mb-5">
      
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button onClick={() => router.back()} className="btn btn-light border me-3 rounded-circle shadow-sm" style={{width: 40, height: 40}}>
            <i className="bi bi-arrow-left"></i>
        </button>
        <div>
          <h2 className="fw-bold text-dark mb-0">Edit User</h2>
          <p className="text-secondary small mb-0">Update profile information and system roles.</p>
        </div>
      </div>

      <div className="row g-4 align-items-start"> {/* Added align-items-start to fix stretching */}
        
        {/* Left Column: Form */}
        <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white border-bottom py-3 px-4">
                    <h5 className="mb-0 fw-bold text-dark">User Information</h5>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit} id="editUserForm">
                        
                        {/* 1. Basic Info */}
                        <div className="row g-3 mb-4">
                            <div className="col-12"><h6 className="text-primary fw-bold small text-uppercase border-bottom pb-2 mb-0">Basic Details</h6></div>
                            <div className="col-md-6">
                                <label className="form-label fw-medium text-secondary small">Full Name</label>
                                <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-medium text-secondary small">Email Address</label>
                                <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-medium text-secondary small">Phone Number</label>
                                <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-medium text-secondary small">Password <span className="text-muted fw-normal">(Optional)</span></label>
                                <input type="password" className="form-control" placeholder="New password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                            </div>
                        </div>

                        {/* 2. System Role */}
                        <div className="row g-3 mb-4">
                            <div className="col-12"><h6 className="text-primary fw-bold small text-uppercase border-bottom pb-2 mb-0">System Role</h6></div>
                            <div className="col-md-12">
                                <label className="form-label fw-medium text-secondary small">Assign Role</label>
                                <select className="form-select bg-light border-0 fw-bold text-dark" value={role} onChange={(e) => setRole(parseInt(e.target.value))}>
                                    {roleOptions.map((r) => (
                                        <option key={r.value} value={r.value} disabled={getRoleDisabled(r.value)}>
                                            {r.label} {getRoleDisabled(r.value) ? " (Internal Only)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 3. Affiliation Type (For Reviewers) */}
                        {(role === 3 || role === 4) && (
                             <div className="bg-light p-4 rounded-4 mb-4 border border-secondary-subtle">
                                 <h6 className="text-secondary fw-bold mb-3 d-flex align-items-center"><i className="bi bi-building me-2"></i> Institution Type</h6>
                                 <div className="d-flex gap-2">
                                    <button type="button" className={`btn btn-sm px-3 ${universityChoice === "unibarishal" ? "btn-primary text-white fw-bold shadow-sm" : "btn-white border text-secondary"}`} onClick={() => handleUniversityChange("unibarishal")}>
                                        University of Barishal
                                    </button>
                                    <button type="button" className={`btn btn-sm px-3 ${universityChoice === "others" ? "btn-primary text-white fw-bold shadow-sm" : "btn-white border text-secondary"}`} onClick={() => handleUniversityChange("others")}>
                                        Other Institution
                                    </button>
                                </div>
                                {universityChoice === "others" && (
                                    <div className="mt-3 row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium text-secondary small">University Name <span className="text-danger">*</span></label>
                                            <input className="form-control" placeholder="e.g. Dhaka University" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium text-secondary small">Department Name <span className="text-danger">*</span></label>
                                            <input className="form-control" placeholder="e.g. Computer Science" value={form.department_text} onChange={(e) => setForm({ ...form, department_text: e.target.value })} required />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 4. Internal Faculty/Dept Selection (Researchers + Internal Reviewers) */}
                        {showInternalDropdowns && (
                            <div className="bg-light p-4 rounded-4 mb-4 border border-primary-subtle">
                                <h6 className="text-primary fw-bold mb-3 d-flex align-items-center"><i className="bi bi-mortarboard me-2"></i> Internal Affiliation</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary small">Faculty</label>
                                        <select 
                                            className="form-select" 
                                            value={form.faculty_id} 
                                            onChange={(e) => {
                                                setForm({ ...form, faculty_id: e.target.value, department_id: "" }); // Reset dept on faculty change
                                            }} 
                                            required
                                        >
                                            <option value="">Select Faculty</option>
                                            {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary small">Department</label>
                                        <select 
                                            className="form-select" 
                                            value={form.department_id} 
                                            onChange={(e) => setForm({ ...form, department_id: e.target.value })} 
                                            required
                                            disabled={!form.faculty_id} // Disable if no faculty selected
                                        >
                                            <option value="">Select Department</option>
                                            {filteredDepartments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. Common Designation */}
                        <div className="row g-3 mb-4">
                            <div className="col-12"><h6 className="text-primary fw-bold small text-uppercase border-bottom pb-2 mb-0">Professional Info</h6></div>
                            <div className="col-md-12">
                                <label className="form-label fw-medium text-secondary small">Designation</label>
                                <select className="form-select" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}>
                                    <option value="">Select Designation</option>
                                    <option value="Lecturer">Lecturer</option>
                                    <option value="Assistant Professor">Assistant Professor</option>
                                    <option value="Associate Professor">Associate Professor</option>
                                    <option value="Professor">Professor</option>
                                </select>
                            </div>
                        </div>

                    </form>
                </div>
                <div className="card-footer bg-light p-4 d-flex justify-content-end gap-2 border-top">
                    <button type="button" onClick={() => router.back()} className="btn btn-white border fw-medium px-4">Cancel</button>
                    <button type="submit" form="editUserForm" className="btn btn-primary fw-bold px-5 shadow-sm">Save Changes</button>
                </div>
            </div>
        </div>

        {/* Right Column: Photo Upload - Fixed Height */}
        <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4"> {/* Removed h-100 */}
                <div className="card-header bg-white border-bottom py-3 px-4">
                    <h5 className="mb-0 fw-bold text-dark">Profile Photo</h5>
                </div>
                <div className="card-body p-4 d-flex flex-column align-items-center justify-content-center text-center">
                    <div className="position-relative mb-4">
                        <div className="rounded-circle shadow-sm overflow-hidden border border-4 border-light bg-light d-flex align-items-center justify-content-center" style={{ width: '180px', height: '180px' }}>
                            <img 
                                src={form.photoPreview || "/assets/images/avatar-placeholder.png"} 
                                alt="Preview" 
                                className="w-100 h-100 object-fit-cover"
                                onError={(e) => e.target.src = "https://via.placeholder.com/180?text=User"}
                            />
                        </div>
                    </div>
                    <label className="btn btn-outline-primary btn-sm fw-bold px-4 rounded-pill">
                        <i className="bi bi-camera-fill me-2"></i> Choose Image
                        <input type="file" className="d-none" accept="image/*" onChange={handleFileChange} />
                    </label>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}