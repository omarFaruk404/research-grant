"use client";

import { useState, useEffect, use } from "react"; // Added 'use' for unwrapping params if needed in newer Next.js
import { useRouter } from "next/navigation";

export default function EditCircularPage({ params: paramsPromise }) {
  // Unwrap params (Next.js 15+ requirement, safe for older versions too if handled right)
  const params = use(paramsPromise); 
  const id = params.id;

  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [existingAttachment, setExistingAttachment] = useState(null);
  
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

  // 1. Fetch Fiscal Years & Circular Data
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch Fiscal Years
        const resFiscal = await fetch("/api/fiscal-years");
        const fiscalData = await resFiscal.json();
        setFiscalYears(Array.isArray(fiscalData) ? fiscalData : []);

        // Fetch Specific Circular
        const resCircular = await fetch(`/api/circulars?id=${id}`);
        const data = await resCircular.json();

        // If the API returns the object wrapped in an array or property
        const circular = Array.isArray(data) ? data[0] : (data.circulars ? data.circulars[0] : data);

        if (circular) {
          setExistingAttachment(circular.attachment);
          
          setForm({
            title: circular.title,
            notice_code: circular.notice_code || "",
            fiscal_year_id: circular.fiscal_year_id || "",
            type: circular.circular_type || "proposal", // Map DB column 'circular_type' back to form 'type'
            description: circular.description || "",
            
            // Format dates to YYYY-MM-DD for input fields
            notice_published_date: circular.notice_published_date 
              ? new Date(circular.notice_published_date).toISOString().split('T')[0] 
              : "",
            proposal_submission_deadline: circular.proposal_submission_deadline 
              ? new Date(circular.proposal_submission_deadline).toISOString().split('T')[0] 
              : "",
            
            attachment: null, // Reset file input
          });
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        alert("Failed to load circular details.");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadData();
  }, [id]);

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
    // Append all form fields
    Object.entries(form).forEach(([key, val]) => {
      // For attachment: only append if a NEW file is selected (val is an object/File)
      if (key === "attachment" && !val) return; 
      if (val) fd.append(key, val);
    });

    // NOTE: Make sure your API handles PUT/PATCH and looks for 'id' in query or body
    try {
      const res = await fetch(`/api/circulars?id=${id}`, {
        method: "PUT", 
        body: fd,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Circular updated successfully!");
        router.push("/officer/dashboard/circulars");
      } else {
        alert(data.error || "Failed to update circular");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred while updating.");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h2 className="mb-4 text-primary">Edit Circular</h2>

          <form onSubmit={handleSubmit}>
            
            {/* Row 1: Title (Full Width) */}
            <div className="row mb-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Title *</label>
                <input
                  name="title"
                  className="form-control"
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
                  required
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
                  required
                >
                  <option value="notice">Notice</option>
                  <option value="proposal">Proposal</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Published Date *</label>
                <input
                  type="date"
                  name="notice_published_date"
                  className="form-control"
                  value={form.notice_published_date}
                  onChange={handleChange}
                  required
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
                      required
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
                
                {existingAttachment && (
                  <div className="mb-2 text-muted small">
                    Current file: <a href={existingAttachment} target="_blank" rel="noreferrer" className="text-decoration-none">View Existing</a>
                  </div>
                )}

                <input
                  type="file"
                  name="attachment"
                  className="form-control"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={handleChange}
                />
                <small className="text-muted">Upload new file only if you wish to replace the current one.</small>
              </div>

              <div className="col-md-6 text-end">
                <button type="button" className="btn btn-secondary me-2" onClick={() => router.back()}>Cancel</button>
                <button type="submit" className="btn btn-primary px-4">Update Circular</button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}