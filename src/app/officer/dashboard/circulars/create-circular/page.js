"use client";
import { useState } from "react";

export default function CreateCircular() {
  const [form, setForm] = useState({
    title: "",
    notice_code: "",
    type: "proposal",
    description: "",
    attachment: null,
    notice_published_date: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Circular:", form);
    alert("Circular created successfully (dummy).");
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4">Create New Circular</h2>

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Notice Code</label>
          <input
            type="text"
            className="form-control"
            name="notice_code"
            value={form.notice_code}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Type</label>
          <select
            className="form-select"
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="proposal">Proposal</option>
            <option value="reminder">Reminder</option>
            <option value="format_document">Format Document</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Published Date</label>
          <input
            type="date"
            className="form-control"
            name="notice_published_date"
            value={form.notice_published_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="3"
            name="description"
            value={form.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Attachment</label>
          <input
            type="file"
            className="form-control"
            name="attachment"
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-success">
          Save Circular
        </button>
      </form>
    </div>
  );
}
