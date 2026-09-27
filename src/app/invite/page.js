"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function InviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [userData, setUserData] = useState(null);

  // Form State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  
  // Affiliation State
  const [isBarishalUniversity, setIsBarishalUniversity] = useState(true);
  const [universityName, setUniversityName] = useState("University of Barishal");
  const [departmentText, setDepartmentText] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Data State
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  // 1. Verify Token & Fetch Metadata on Load
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function init() {
      try {
        // Parallel Fetch: Verify Token & Get Faculties/Depts
        const [verifyRes, metaRes] = await Promise.all([
            fetch(`/api/users/invite/verify?token=${token}`),
            fetch(`/api/faculties-departments`) // Ensure this matches your route path
        ]);

        const verifyData = await verifyRes.json();
        
        if (verifyRes.ok) {
          setIsValid(true);
          setUserData(verifyData.user);
        } else {
          setIsValid(false);
        }

        if (metaRes.ok) {
            const metaData = await metaRes.json();
            setFaculties(metaData.faculties || []);
            setDepartments(metaData.departments || []);
        }

      } catch (e) {
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [token]);

  // 2. Filter Departments when Faculty Changes
  useEffect(() => {
    if (selectedFaculty) {
        const filtered = departments.filter(d => String(d.faculty_id) === String(selectedFaculty));
        setFilteredDepartments(filtered);
    } else {
        setFilteredDepartments([]);
    }
    setSelectedDepartment(""); // Reset Dept on Faculty change
  }, [selectedFaculty, departments]);

  // 3. Handle Account Creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords do not match");
    if (password.length < 6) return alert("Password must be at least 6 characters");

    // Validation for BU vs External
    let finalUniversity = universityName;
    let finalDepartment = departmentText;
    let finalFacultyId = null;
    let finalDepartmentId = null;

    if (isBarishalUniversity) {
        if (!selectedFaculty || !selectedDepartment) return alert("Please select Faculty and Department");
        finalUniversity = "University of Barishal";
        finalFacultyId = selectedFaculty;
        finalDepartmentId = selectedDepartment;
    } else {
        if (!universityName.trim() || !departmentText.trim()) return alert("Please enter University and Department names");
        // For external, we save the text names. IDs remain null.
        finalDepartment = departmentText;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/users/invite/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          phone,
          designation,
          // Affiliation Info
          is_internal: isBarishalUniversity,
          university: finalUniversity,
          faculty_id: finalFacultyId,
          department_id: finalDepartmentId,
          department_name: finalDepartment // For external users or direct text storage
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Account created successfully! You can now log in.");
        router.push("/login");
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (e) {
      alert("Network Error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  if (!isValid) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center shadow-sm">
          <h4>Invalid or Expired Invitation</h4>
          <p>The link you followed is invalid or has already been used. Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-header bg-primary text-white text-center py-4 rounded-top-4">
              <h4 className="mb-0 fw-bold">Welcome, {userData?.name}</h4>
              <p className="mb-0 small opacity-75">Complete your profile to get started</p>
            </div>
            <div className="card-body p-4 p-md-5">
              
              <form onSubmit={handleSubmit}>
                
                {/* --- SECURITY --- */}
                <h6 className="fw-bold text-secondary text-uppercase small mb-3 border-bottom pb-2">Account Security</h6>
                <div className="mb-3">
                  <label className="form-label">Create Password</label>
                  <input type="password" className="form-control" required value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>

                {/* --- BASIC INFO --- */}
                <h6 className="fw-bold text-secondary text-uppercase small mb-3 border-bottom pb-2">Basic Info</h6>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-control" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="017..." />
                </div>
                <div className="mb-4">
                  <label className="form-label">Designation</label>
                  <input type="text" className="form-control" required value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g. Professor" />
                </div>

                {/* --- AFFILIATION --- */}
                <h6 className="fw-bold text-secondary text-uppercase small mb-3 border-bottom pb-2">Affiliation</h6>
                
                <div className="mb-3">
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" id="univ_bu" checked={isBarishalUniversity} onChange={() => setIsBarishalUniversity(true)} />
                        <label className="form-check-label fw-medium" htmlFor="univ_bu">University of Barishal</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" id="univ_other" checked={!isBarishalUniversity} onChange={() => setIsBarishalUniversity(false)} />
                        <label className="form-check-label fw-medium" htmlFor="univ_other">Other University</label>
                    </div>
                </div>

                {/* CONDITIONAL INPUTS */}
                {isBarishalUniversity ? (
                    // INTERNAL USER (Dropdowns)
                    <div className="p-3 bg-light rounded-3 mb-4">
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary">Faculty</label>
                            <select className="form-select" value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)} required>
                                <option value="">-- Select Faculty --</option>
                                {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>
                        <div className="mb-0">
                            <label className="form-label small fw-bold text-secondary">Department</label>
                            <select className="form-select" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} required disabled={!selectedFaculty}>
                                <option value="">-- Select Department --</option>
                                {filteredDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>
                ) : (
                    // EXTERNAL USER (Text Inputs)
                    <div className="p-3 bg-light rounded-3 mb-4">
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary">University Name</label>
                            <input type="text" className="form-control" value={universityName} onChange={(e) => setUniversityName(e.target.value)} placeholder="e.g. University of Dhaka" required />
                        </div>
                        <div className="mb-0">
                            <label className="form-label small fw-bold text-secondary">Department Name</label>
                            <input type="text" className="form-control" value={departmentText} onChange={(e) => setDepartmentText(e.target.value)} placeholder="e.g. Computer Science" required />
                        </div>
                    </div>
                )}

                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm" disabled={submitting}>
                  {submitting ? "Creating Account..." : "Create Account & Login"}
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="text-center p-5">Loading...</div>}>
      <InviteContent />
    </Suspense>
  );
}