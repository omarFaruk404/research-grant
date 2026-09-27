"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OfficerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // 1. Load User
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    try {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.user_id || parsedUser.role !== 1) {
        router.push("/login");
      } else {
        setUser(parsedUser);
      }
    } catch {
      router.push("/login");
    }
  }, [router]);

  // 2. Load Data
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        const [profileRes, listRes] = await Promise.all([
          fetch(`/api/officer/profile/${user.user_id}`),
          fetch("/api/faculties-departments"),
        ]);

        const profileData = await profileRes.json();
        const listData = await listRes.json();

        setProfile(profileData);
        setFaculties(listData.faculties);
        setDepartments(listData.departments);

        if (profileData.faculty_id) {
          setFilteredDepartments(
            listData.departments.filter(
              (d) => d.faculty_id === parseInt(profileData.faculty_id)
            )
          );
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }

    loadData();
  }, [user]);

  // 3. Handle Changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      if (file) {
        setProfile((prev) => ({ ...prev, photo: file }));
        setPreviewImage(URL.createObjectURL(file));
      }
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));

      if (name === "faculty_id") {
        const filtered = departments.filter(
          (d) => d.faculty_id === parseInt(value)
        );
        setFilteredDepartments(filtered);
        setProfile((prev) => ({ ...prev, department_id: "" }));
      }
    }
  };

  // 4. Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.user_id) return alert("User not found!");

    if (editMode && profile.new_password) {
        if (profile.new_password !== profile.confirm_password) {
            alert("Passwords do not match!");
            return;
        }
    }

    setLoading(true);
    const formData = new FormData();
    for (const key in profile) {
      if (key === 'photo' && typeof profile[key] !== 'object') continue;
      formData.append(key, profile[key]);
    }

    try {
      const res = await fetch(`/api/officer/profile/${user.user_id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        alert("Profile updated successfully!");
        setEditMode(false);
        setProfile(prev => ({...prev, ...data, new_password: '', confirm_password: ''})); 
        setPreviewImage(null);
      } else {
        alert(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
        setLoading(false);
    }
  };

  if (!profile) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid px-4 mt-5 mb-5"> {/* ✅ Changed to container-fluid & added bottom margin */}
      
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden h-100">
        
        {/* Header / Banner */}
        <div className="card-header text-white p-4 d-flex justify-content-between align-items-center" style={{backgroundColor:"#5c67f2"}}>
            <h3 className="mb-0 fw-bold"><i className="bi bi-person-circle me-2"></i> My Profile</h3>
            <button
                className={`btn ${editMode ? 'btn-light text-danger' : 'btn-light text-primary'} fw-bold px-4 rounded-pill shadow-sm`}
                onClick={() => {
                    setEditMode(!editMode);
                    if(editMode) setPreviewImage(null); 
                }}
            >
                {editMode ? <><i className="bi bi-x-lg me-1"></i> Cancel</> : <><i className="bi bi-pencil-square me-1"></i> Edit Profile</>}
            </button>
        </div>

        <div className="card-body p-5">
          <form onSubmit={handleSubmit}>
            <div className="row g-5">
                
                {/* LEFT: Profile Image */}
                <div className="col-lg-3 text-center border-end"> {/* ✅ Adjusted column width */}
                    <div className="position-relative d-inline-block">
                        <div className="rounded-circle overflow-hidden shadow-sm border border-4 border-light bg-light" style={{ width: '180px', height: '180px' }}>
                            <img
                                src={previewImage || (profile.photo ? `${profile.photo}` : "/assets/images/avatar-placeholder.png")}
                                alt="Profile"
                                className="w-100 h-100 object-fit-cover"
                                onError={(e) => e.target.src = "https://via.placeholder.com/180?text=No+Image"} 
                            />
                        </div>
                        
                        {editMode && (
                            <label 
                                htmlFor="photo-upload" 
                                className="position-absolute bottom-0 end-0 bg-dark text-white rounded-circle p-2 shadow pointer-cursor"
                                style={{ width: '45px', height: '45px', cursor: 'pointer', transform: 'translate(-10px, -10px)' }}
                                title="Change Photo"
                            >
                                <i className="bi bi-camera-fill fs-5 d-flex justify-content-center align-items-center h-100"></i>
                                <input 
                                    id="photo-upload" 
                                    type="file" 
                                    name="photo" 
                                    accept="image/*" 
                                    className="d-none" 
                                    onChange={handleChange} 
                                />
                            </label>
                        )}
                    </div>
                    <h4 className="mt-3 fw-bold text-dark">{profile.name}</h4>
                    <p className="text-muted mb-1">{profile.designation || "Officer"}</p>
                    <span className="badge bg-primary-subtle text-primary rounded-pill px-3">
                        ID: {user.user_id}
                    </span>
                </div>

                {/* RIGHT: Form Fields */}
                <div className="col-lg-9"> {/* ✅ Adjusted column width */}
                    
                    {/* Section 1: Personal Info */}
                    <h5 className="text-primary border-bottom pb-2 mb-3"><i className="bi bi-info-circle me-2"></i>Personal Information</h5>
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label className="form-label text-secondary small fw-bold">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className={`form-control ${editMode ? 'bg-white' : 'bg-light border-0'}`}
                                value={profile.name || ""}
                                onChange={handleChange}
                                readOnly={!editMode}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label text-secondary small fw-bold">Designation</label>
                            <input
                                type="text"
                                name="designation"
                                className={`form-control ${editMode ? 'bg-white' : 'bg-light border-0'}`}
                                value={profile.designation || ""}
                                onChange={handleChange}
                                readOnly={!editMode}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label text-secondary small fw-bold">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className={`form-control ${editMode ? 'bg-white' : 'bg-light border-0'}`} // ✅ Now editable style
                                value={profile.email || ""}
                                onChange={handleChange}
                                readOnly={!editMode} // ✅ Removed readOnly constraint
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label text-secondary small fw-bold">Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                className={`form-control ${editMode ? 'bg-white' : 'bg-light border-0'}`}
                                value={profile.phone || ""}
                                onChange={handleChange}
                                readOnly={!editMode}
                            />
                        </div>
                    </div>

                    {/* Section 2: Academic Info */}
                    <h5 className="text-primary border-bottom pb-2 mb-3"><i className="bi bi-building me-2"></i>Academic Affiliation</h5>
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label className="form-label text-secondary small fw-bold">Faculty</label>
                            <select
                                name="faculty_id"
                                className={`form-select ${editMode ? 'bg-white' : 'bg-light border-0'}`}
                                value={profile.faculty_id || ""}
                                onChange={handleChange}
                                disabled={!editMode}
                            >
                                <option value="">Select Faculty</option>
                                {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label text-secondary small fw-bold">Department</label>
                            <select
                                name="department_id"
                                className={`form-select ${editMode ? 'bg-white' : 'bg-light border-0'}`}
                                value={profile.department_id || ""}
                                onChange={handleChange}
                                disabled={!editMode}
                            >
                                <option value="">Select Department</option>
                                {filteredDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Section 3: Security (Only in Edit Mode) */}
                    {editMode && (
                        <div className="bg-light p-3 rounded-3 mb-4 animate-fade-in">
                            <h6 className="text-danger fw-bold mb-3"><i className="bi bi-shield-lock me-2"></i>Change Password</h6>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <input
                                        type="password"
                                        name="new_password"
                                        className="form-control"
                                        placeholder="New Password"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        className="form-control"
                                        placeholder="Confirm Password"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-12 text-muted small fst-italic">
                                    * Leave blank if you do not wish to change your password.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {editMode && (
                        <div className="d-flex gap-2 justify-content-end mt-4">
                            <button type="button" className="btn btn-light border px-4 fw-medium" onClick={() => setEditMode(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary px-5 fw-bold shadow-sm" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-lg me-1"></i> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                </div>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .pointer-cursor { cursor: pointer; }
        .object-fit-cover { object-fit: cover; }
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}