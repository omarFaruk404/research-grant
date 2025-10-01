// app/officer/dashboard/fiscal-years/page.js
"use client";
import { useState } from "react";
import { fiscalYears, projects } from "@/lib/dummy";

export default function FiscalYearsPage() {
  const [years, setYears] = useState(fiscalYears);
  const [newYear, setNewYear] = useState("");
  const [filterYear, setFilterYear] = useState("");
  
  // Handle add new year
  const addFiscalYear = () => {
    if (!newYear) return;
    const newFy = {
      id: years.length + 1,
      year_label: newYear,
      is_active: false,
    };
    setYears([...years, newFy]);
    setNewYear("");
  };

  // Toggle active year
  const toggleActive = (id) => {
    setYears(
      years.map((y) =>
        y.id === id ? { ...y, is_active: !y.is_active } : y
      )
    );
  };

  // Filter projects
  const filteredProjects = filterYear
    ? projects.filter(
        (p) =>
          p.status === "Approved / Ongoing" &&
          p.fiscal_year === filterYear
      )
    : projects.filter((p) => p.status === "Approved / Ongoing");

  return (
    <div className="container my-5">
      <h2>Fiscal Year Management</h2>

      {/* Add New Year */}
      <div className="card my-4">
        <div className="card-header">Add New Fiscal Year</div>
        <div className="card-body d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="e.g. 2025-2026"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
          />
          <button className="btn btn-success" onClick={addFiscalYear}>
            Add
          </button>
        </div>
      </div>

      {/* List Years */}
      <h4>Existing Fiscal Years</h4>
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Year</th>
            <th>Active</th>
            <th>Toggle</th>
          </tr>
        </thead>
        <tbody>
          {years.map((fy) => (
            <tr key={fy.id}>
              <td>{fy.year_label}</td>
              <td>
                {fy.is_active ? (
                  <span className="badge bg-success">Active</span>
                ) : (
                  <span className="badge bg-secondary">Inactive</span>
                )}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => toggleActive(fy.id)}
                >
                  Toggle Active
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Ongoing Projects by Fiscal Year */}
      <div className="mt-5">
        <h4>Ongoing Projects</h4>
        <div className="mb-3">
          <select
            className="form-select w-auto"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Fiscal Years</option>
            {years.map((fy) => (
              <option key={fy.id} value={fy.year_label}>
                {fy.year_label}
              </option>
            ))}
          </select>
        </div>

        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Researcher</th>
              <th>Allocated Budget</th>
              <th>Fiscal Year</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p) => (
                <tr key={p.id}>
                  <td>{p.code_no}</td>
                  <td>{p.title}</td>
                  <td>{p.researcher.name}</td>
                  <td>{p.allocated_budget}</td>
                  <td>{p.fiscal_year}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
