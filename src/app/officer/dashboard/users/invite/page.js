"use client";
import { useState } from "react";

export default function InviteUserPage() {
  const [form, setForm] = useState({ name: "", email: "", role: "2" }); // Default Researcher (2)
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Invitation sent successfully!");
        setForm({ name: "", email: "", role: "2" }); // Reset
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="fw-bold mb-0 text-primary">
                <i className="bi bi-envelope-paper me-2"></i>Invite New User
              </h5>
            </div>
            <div className="card-body p-4">
              <p className="text-muted small mb-4">
                Enter the details below. An email will be sent to the user with a link to create their account and set a password.
              </p>

              <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Dr. John Doe"
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required 
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="user@bu.ac.bd"
                  />
                </div>

                {/* Role */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Assign Role</label>
                  <select 
                    className="form-select" 
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="2">Researcher</option>
                    <option value="3">Reviewer</option>
                    <option value="4">Both (Researcher & Reviewer)</option>
                  </select>
                  <div className="form-text text-muted mt-2">
                    <i className="bi bi-info-circle me-1"></i>
                    Relevant profiles (Researcher/Reviewer tables) will be created automatically.
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 fw-bold py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span><span className="spinner-border spinner-border-sm me-2"></span> Sending...</span>
                  ) : (
                    <span><i className="bi bi-send-fill me-2"></i> Send Invitation</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}