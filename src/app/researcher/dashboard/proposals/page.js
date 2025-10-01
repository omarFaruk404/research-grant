"use client";
import { useState } from "react";
import Link from "next/link";

export default function MyProposalsPage() {
  // Dummy proposals data using the agreed statuses
  const proposals = [
    {
      id: 1,
      title: "AI in Healthcare",
      fiscalYear: "2025",
      status: "under_review",
    },
    {
      id: 2,
      title: "Climate Change Impact Study",
      fiscalYear: "2024",
      status: "reviewed",
    },
    {
      id: 3,
      title: "Smart Agriculture with IoT",
      fiscalYear: "2025",
      status: "ongoing",
    },
    {
      id: 4,
      title: "Blockchain for Supply Chain",
      fiscalYear: "2025",
      status: "completed",
    },
    {
      id: 5,
      title: "Renewable Energy Efficiency Study",
      fiscalYear: "2023",
      status: "rejected",
    },
  ];

  const [filters, setFilters] = useState({ fiscalYear: "", status: "" });

  const filteredProposals = proposals.filter((p) => {
    return (
      (filters.fiscalYear ? p.fiscalYear === filters.fiscalYear : true) &&
      (filters.status ? p.status === filters.status : true)
    );
  });

  function badgeClass(status) {
    switch (status) {
      case "completed":
        return "bg-success";
      case "ongoing":
        return "bg-primary";
      case "under_review":
        return "bg-warning text-dark";
      case "reviewed":
        return "bg-info text-dark";
      case "rejected":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  }

  // Friendly label
  function label(status) {
    return {
      under_review: "Under Review",
      reviewed: "Reviewed",
      ongoing: "Ongoing",
      completed: "Completed",
      rejected: "Rejected",
    }[status] ?? status;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Proposals</h2>

      {/* Filters */}
      <div className="row mb-3 g-2">
        <div className="col-md-4">
          <select
            className="form-select"
            value={filters.fiscalYear}
            onChange={(e) =>
              setFilters({ ...filters, fiscalYear: e.target.value })
            }
          >
            <option value="">All Fiscal Years</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="under_review">Under Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Proposals list */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Title</th>
            <th>Fiscal Year</th>
            <th>Status</th>
            <th style={{ width: 140 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredProposals.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.fiscalYear}</td>
              <td>
                <span className={`badge ${badgeClass(p.status)}`}>
                  {label(p.status)}
                </span>
              </td>
              <td>
                <Link
                  href={`/researcher/dashboard/proposals/${p.id}`}
                  className="btn btn-sm btn-primary"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}

          {filteredProposals.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-4">
                No proposals found for selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
