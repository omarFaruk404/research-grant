"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  
  // State
  const [role, setRole] = useState("researcher");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ Toggle State

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.target);
    const email = form.get("email");
    const password = form.get("password");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");

      // 1. Save Token
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // 2. Save User Info
      const userData = {
        user_id: data.user.id,
        profile_photo: data.user.profile_photo,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        current_role: data.user.current_role,
        researcher_id: data.user.researcher_id || null,
        reviewer_id: data.user.reviewer_id || null,
        officer_id: data.user.officer_id || null,
        token: data.token 
      };

      localStorage.setItem("user", JSON.stringify(userData));

      // 3. Redirect
      if (userData.current_role === "officer") {
        router.push("/officer/dashboard");
      } else if (userData.current_role === "researcher") {
        router.push("/researcher/dashboard");
      } else if (userData.current_role === "reviewer") {
        router.push("/reviewer/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center position-relative overflow-hidden">
      
      {/* 1. Background Image & Overlay */}
      <div 
        style={{
            backgroundImage: "url('/assets/background/university.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 0
        }}
      ></div>
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-75" style={{ zIndex: 1 }}></div>

      {/* 2. Login Card */}
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden position-relative animate-up" style={{ width: "450px", maxWidth: "90%", zIndex: 2 }}>
        
        <div className="h-1 bg-primary w-100" style={{ height: "6px" }}></div>

        <div className="card-body p-5">
          
          <div className="text-center mb-4">
            <h2 className="fw-bold text-dark">RMS Portal</h2>
            <p className="text-secondary small">Research Management System</p>
          </div>

          <form onSubmit={handleLogin}>
            
            {/* Role Selector */}
            <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase text-secondary" style={{fontSize: '0.75rem'}}>Select your Role</label>
                <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-person-badge"></i></span>
                    <select
                        className="form-select bg-light border-start-0 fw-medium"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{ cursor: "pointer" }}
                    >
                        <option value="researcher">Researcher</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="officer">Officer</option>
                    </select>
                </div>
            </div>

            {/* Email Input */}
            <div className="form-floating mb-3">
              <input 
                type="email" 
                name="email" 
                className="form-control" 
                id="floatingEmail" 
                placeholder="name@example.com" 
                required 
              />
              <label htmlFor="floatingEmail">Email Address</label>
            </div>

            {/* Password Input with Toggle */}
            <div className="form-floating mb-4 position-relative">
              <input 
                type={showPassword ? "text" : "password"} // ✅ Toggle Type
                name="password" 
                className="form-control pe-5" // Added padding-right for icon
                id="floatingPassword" 
                placeholder="Password" 
                required 
              />
              <label htmlFor="floatingPassword">Password</label>
              
              {/* ✅ Eye Icon */}
              <span 
                className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer", zIndex: 10 }}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"} fs-5`}></i>
              </span>
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger d-flex align-items-center py-2 small" role="alert">
                    <i className="bi bi-exclamation-circle-fill me-2"></i>
                    <div>{error}</div>
                </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm"
              disabled={loading}
              style={{ letterSpacing: "0.5px" }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing In...
                </>
              ) : (
                "Login to Dashboard"
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-2 border-top">
            <Link href="/login/forgot-password" className="text-decoration-none small text-secondary hover-link">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-link:hover {
            color: var(--bs-primary) !important;
            text-decoration: underline !important;
        }
        .animate-up {
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}