"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Data Options
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  // Logic State
  const [role, setRole] = useState(2); // Default to Researcher (number)
  const [universityOption, setUniversityOption] = useState("barishal");

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    faculty_id: "",
    department_id: "",
    department_name: "", // For external reviewers
    designation: "",
    university: "University of Barishal",
    photo: null,
  });

  useEffect(() => {
    fetchFacultiesDepartments();
  }, []);

  // Filter departments based on selected faculty
  useEffect(() => {
    if (form.faculty_id) {
      setFilteredDepartments(
        departments.filter((d) => d.faculty_id === parseInt(form.faculty_id))
      );
    } else {
      setFilteredDepartments(departments);
    }
  }, [form.faculty_id, departments]);

  // Handle Logic when Role or University Option changes
  useEffect(() => {
    // If Researcher (2) or Both (4), they are Internal.
    if (role === 2 || role === 4) {
      setUniversityOption("barishal");
      setForm(prev => ({ 
        ...prev, 
        university: "University of Barishal",
        department_name: "" 
      }));
    }
    // If Reviewer (3) and option is Barishal
    else if (role === 3 && universityOption === "barishal") {
      setForm(prev => ({ 
        ...prev, 
        university: "University of Barishal",
        department_name: "" 
      }));
    }
    // If Reviewer (3) and option is Others
    else if (role === 3 && universityOption === "others") {
      setForm(prev => ({ 
        ...prev, 
        university: "",
        faculty_id: "",
        department_id: "" 
      }));
    }
  }, [role, universityOption]);

  const fetchFacultiesDepartments = async () => {
    try {
      const res = await fetch("/api/faculties-departments");
      const data = await res.json();
      setFaculties(data.faculties || []);
      setDepartments(data.departments || []);
      setFilteredDepartments(data.departments || []);
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key]) fd.append(key, form[key]);
    });
    
    // IMPORTANT: Send role as a number
    fd.append("role", role);

    try {
      const res = await fetch("/api/users/add", { // Assumed generic POST route, or /api/users/add based on your file structure
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (res.ok) {
        alert("User added successfully!");
        router.push("/officer/dashboard/users"); // Redirect after success
      } else {
        alert(json.error || "Failed to add user");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine if we show Faculty/Dept Dropdowns
  const showInternalDropdowns = 
    role === 2 || // Researcher
    role === 4 || // Both
    (role === 3 && universityOption === "barishal"); // Internal Reviewer

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* Header with Back Button */}
      <div className="d-flex align-items-center mb-4">
        <button 
          onClick={() => router.back()} 
          className="btn btn-outline-secondary btn-sm me-3"
        >
          ← Back
        </button>
        <div>
          <h2 className="fw-bold text-dark mb-0">Add User</h2>
          <p className="text-muted small mb-0">Create a new researcher, reviewer, or officer</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: "10px" }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row">
              
              {/* --- LEFT COLUMN: Basic Info --- */}
              <div className="col-md-6">
                <h5 className="mb-3 text-secondary fw-bold small text-uppercase border-bottom pb-2">Basic Information</h5>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Name</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Full Name"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="email@example.com"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Phone</label>
                  <input
                    className="form-control"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    placeholder="Set a secure password"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">System Role</label>
                  <select
                    className="form-select"
                    value={role}
                    // ParseInt ensures we send a Number, not a string
                    onChange={(e) => setRole(parseInt(e.target.value))}
                  >
                    <option value={2}>Researcher</option>
                    <option value={3}>Reviewer</option>
                    <option value={4}>Both (Researcher + Reviewer)</option>
                  </select>
                </div>
              </div>

              {/* --- RIGHT COLUMN: Role Specifics --- */}
              <div className="col-md-6">
                <h5 className="mb-3 text-secondary fw-bold small text-uppercase border-bottom pb-2">
                  {role === 2 ? "Researcher Details" : role === 3 ? "Reviewer Details" : "Academic Details"}
                </h5>

                {/* University Toggle (Only for Reviewer Only) */}
                {role === 3 && (
                  <div className="mb-3">
                    <label className="form-label fw-medium d-block">University</label>
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className={`btn btn-sm ${universityOption === "barishal" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setUniversityOption("barishal")}
                      >
                        University of Barishal
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${universityOption === "others" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setUniversityOption("others")}
                      >
                        Others
                      </button>
                    </div>
                  </div>
                )}

                {/* INTERNAL (Dropdowns) Logic */}
                {showInternalDropdowns ? (
                  <div className="bg-light p-3 rounded border mb-3">
                    <div className="mb-3">
                      <label className="form-label fw-medium">Faculty</label>
                      <select
                        className="form-select"
                        value={form.faculty_id}
                        onChange={(e) => setForm({ ...form, faculty_id: e.target.value })}
                        required
                      >
                        <option value="">Select Faculty</option>
                        {faculties.map((f) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">Department</label>
                      <select
                        className="form-select"
                        value={form.department_id}
                        onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                        required
                        disabled={!form.faculty_id}
                      >
                        <option value="">Select Department</option>
                        {filteredDepartments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  /* EXTERNAL (Text Inputs) Logic */
                  <div className="bg-light p-3 rounded border mb-3">
                     <div className="mb-3">
                        <label className="form-label fw-medium">University Name</label>
                        <input
                          className="form-control"
                          placeholder="e.g., University of Dhaka"
                          value={form.university}
                          onChange={(e) => setForm({ ...form, university: e.target.value })}
                          required
                        />
                     </div>
                     <div className="mb-3">
                        <label className="form-label fw-medium">Department Name</label>
                        <input
                          className="form-control"
                          placeholder="e.g., Computer Science"
                          value={form.department_name}
                          onChange={(e) => setForm({ ...form, department_name: e.target.value })}
                          required
                        />
                     </div>
                  </div>
                )}

                {/* Common Designation */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Designation</label>
                  <select
                    className="form-select"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    required
                  >
                    <option value="">Select Designation</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                  </select>
                </div>

                {/* Photo Upload */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Profile Photo</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
                  />
                  <div className="form-text">Optional. Accepted formats: .jpg, .png</div>
                </div>

              </div>
            </div>

            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <button 
                type="button" 
                onClick={() => router.back()} 
                className="btn btn-light me-2 text-secondary fw-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary px-4 fw-bold" 
                style={{ backgroundColor: "#5c67f2", borderColor: "#5c67f2" }}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}