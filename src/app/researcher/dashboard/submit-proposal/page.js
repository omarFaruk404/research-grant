"use client";
import { useState } from "react";

export default function SubmitProposalPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    attachments: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Proposal:", form);
    alert("Proposal submitted successfully!");
    // Reset form after submit
    setForm({ title: "", description: "", budget: "", attachments: null });
  };

  return (
    <div className="container mt-4">
      <h2>Submit Research Proposal</h2>

      <form onSubmit={handleSubmit} className="mt-4">
        {/* Research Title */}
        <div className="mb-3">
          <label className="form-label">Research Title</label>
          <input
            type="text"
            className="form-control"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="4"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          ></textarea>
        </div>

        {/* Budget */}
        <div className="mb-3">
          <label className="form-label">Proposed Budget ($)</label>
          <input
            type="number"
            className="form-control"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            required
          />
        </div>

        {/* Attachments */}
        <div className="mb-3">
          <label className="form-label">Attachments</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setForm({ ...form, attachments: e.target.files })}
            multiple
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Submit Proposal
        </button>
      </form>
    </div>
  );
}
