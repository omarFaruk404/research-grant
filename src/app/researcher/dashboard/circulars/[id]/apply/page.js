"use client";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ApplyCircularPage() {
  const { id } = useParams();

  // Dummy researcher info
  const researcher = {
    name: "Dr. John Doe",
    designation: "Associate Professor",
  };

  // Dummy circulars
  const circulars = [
    {
      id: 1,
      title: "Call for Research in AI",
      type: "Proposal",
      fiscalYear: "2025",
    },
  ];

  const circular = circulars.find((c) => c.id === Number(id));

  const [form, setForm] = useState({
    description: "",
    budget: "",
    attachments: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Applied with:", form);
    alert("Proposal submitted successfully!");
  };

  if (!circular) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Circular not found</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Apply to: {circular.title}</h2>

      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Researcher Name</label>
          <input
            type="text"
            className="form-control"
            value={researcher.name}
            disabled
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Proposal Title</label>
          <input
            type="text"
            className="form-control"
            value={circular.title}
            disabled
          />
        </div>

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

        <div className="mb-3">
          <label className="form-label">Attachments</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setForm({ ...form, attachments: e.target.files })}
            multiple
          />
        </div>

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

        <button type="submit" className="btn btn-primary">
          Submit Proposal
        </button>
      </form>
    </div>
  );
}
