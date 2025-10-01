"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "researcher",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Registration successful!");
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (err) {
      setMessage("❌ Something went wrong.");
    }

    setLoading(false);
  };

 return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="col-md-5">
        <div className="card shadow p-4">
          <h2 className="text-center mb-4">Register</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="form-select"
              >
                <option value="researcher">Researcher</option>
                <option value="officer">Officer</option>
                <option value="reviewer">Reviewer</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <p className="mt-3 text-center text-muted">
              Already have an account?{" "}
              <a href="/login" className="text-decoration-none">
                Login
              </a>
            </p>

            {message && (
              <p className="mt-3 text-center text-success">{message}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
