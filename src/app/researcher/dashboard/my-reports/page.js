"use client";
import { useState } from "react";
import Link from "next/link";

// Dummy data simulating reports joined with projects & reviews
const dummyReports = [
  {
    id: 1,
    project_id: 101,
    project_title: "AI in Healthcare",
    project_description: "Using AI to improve diagnosis and patient outcomes.",
    fiscal_year: "2025",
    status: "Reviewed",
    reviewer_name: "Dr. Sarah Lee",
    submitted_at: "2025-08-01",
  },
  {
    id: 2,
    project_id: 202,
    project_title: "Climate Change Impact Study",
    project_description: "Studying rising sea levels and effects on agriculture.",
    fiscal_year: "2024",
    status: "Pending Review",
    reviewer_name: null,
    submitted_at: "2024-07-12",
  },
  {
    id: 3,
    project_id: 303,
    project_title: "Smart Agriculture",
    project_description: "IoT-based smart farming solutions.",
    fiscal_year: "2025",
    status: "Approved",
    reviewer_name: "Prof. Alan Turing",
    submitted_at: "2025-09-05",
  },
];

export default function MyReportsPage() {
  const [filters, setFilters] = useState({ year: "all", status: "all" });

  const filteredReports = dummyReports.filter((r) => {
    const yearMatch = filters.year === "all" || r.fiscal_year === filters.year;
    const statusMatch = filters.status === "all" || r.status === filters.status;
    return yearMatch && statusMatch;
  });

  return (
    <div className="container mt-4">
      <h2>My Final Reports</h2>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-3">
          <select
            className="form-select"
            value={filters.year}
            onChange={(e) =>
              setFilters({ ...filters, year: e.target.value })
            }
          >
            <option value="all">All Fiscal Years</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
          >
            <option value="all">All Status</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Project</th>
            <th>Fiscal Year</th>
            <th>Status</th>
            <th>Reviewer</th>
            <th>Submitted At</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.map((report) => (
            <tr key={report.id}>
              <td>{report.project_title}</td>
              <td>{report.fiscal_year}</td>
              <td>{report.status}</td>
              <td>{report.reviewer_name || "Not Assigned"}</td>
              <td>{report.submitted_at}</td>
              <td>
                <Link
                  href={`/researcher/dashboard/my-reports/${report.id}`}
                  className="btn btn-sm btn-primary"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
