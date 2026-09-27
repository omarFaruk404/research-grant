"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateCircularPage() {
  const [fiscalYears, setFiscalYears] = useState([]);
  const [form, setForm] = useState({
    title: "",
    notice_code: "",
    fiscal_year_id: "",
    type: "proposal",
    description: "",
    notice_published_date: "",
    proposal_submission_deadline: "",
    attachment: null,
  });

  const router = useRouter();

  useEffect(() => {
    async function fetchFiscalYears() {
      try {
        const resFiscal = await fetch("/api/fiscal-years");
        const data = await resFiscal.json();
        setFiscalYears(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load fiscal years:", err);
      }
    }
    fetchFiscalYears();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val) fd.append(key, val);
    });

    try {
      const res = await fetch("/api/circulars", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        alert("Circular created successfully!");
        router.push("/officer/dashboard/circulars");
      } else {
        alert(data.error || "Failed to create circular");
      }
    } catch (error) {
      alert("An error occurred.");
    }
  };

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h2 className="mb-4 text-primary">Create New Circular</h2>

          <form onSubmit={handleSubmit}>
            {/* Row 1: Title (Full Width) */}
            <div className="row mb-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Title *</label>
                <input
                  name="title"
                  className="form-control"
                  placeholder="Enter circular title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 2: Fiscal Year & Notice Code */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Fiscal Year *</label>
                <select
                  name="fiscal_year_id"
                  className="form-select"
                  value={form.fiscal_year_id}
                  onChange={handleChange}
                  required // MANDATORY
                >
                  <option value="">Select Year</option>
                  {fiscalYears.map((fy) => (
                    <option key={fy.id} value={fy.id}>
                      {fy.year_label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Notice Code</label>
                <input
                  name="notice_code"
                  className="form-control"
                  placeholder="e.g. BU-2401"
                  value={form.notice_code}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 3: Type, Published Date, and Conditional Deadline */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Type *</label>
                <select
                  name="type"
                  className="form-select"
                  value={form.type}
                  onChange={handleChange}
                  required // MANDATORY
                >
                  <option value="notice">Notice</option>
                  <option value="proposal">Proposal</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Published Date *
                </label>
                <input
                  type="date"
                  name="notice_published_date"
                  className="form-control"
                  value={form.notice_published_date}
                  onChange={handleChange}
                  required // MANDATORY
                />
              </div>

              <div className="col-md-4">
                {form.type === "proposal" && (
                  <div className="animate-fade-in">
                    <label className="form-label fw-semibold text-primary">
                      Submission Deadline *
                    </label>
                    <input
                      type="date"
                      name="proposal_submission_deadline"
                      className="form-control border-primary"
                      value={form.proposal_submission_deadline}
                      onChange={handleChange}
                      required // MANDATORY (Only if visible)
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: Description */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows={4}
                placeholder="Enter details..."
                value={form.description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Row 5: Attachment & Submit */}
            <div className="row align-items-end">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="form-label fw-semibold">
                  Attachment (optional)
                </label>
                <input
                  type="file"
                  name="attachment"
                  className="form-control"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 text-end">
                <button className="btn btn-primary px-5">Create</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}