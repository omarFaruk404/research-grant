"use client";
import { useState } from "react";
import Link from "next/link";

export default function CircularsPage() {
  const circulars = [
    {
      id: 1,
      title: "Call for Research in AI",
      type: "Proposal",
      fiscalYear: "2025",
      description: "Submit proposals in the field of Artificial Intelligence.",
    },
    {
      id: 2,
      title: "Annual Reminder - Ethics Guidelines",
      type: "Reminder",
      fiscalYear: "2025",
      description: "Follow ethics guidelines while conducting research.",
    },
    {
      id: 3,
      title: "Circular on Budget Revisions",
      type: "Document",
      fiscalYear: "2024",
      description: "Policy changes on budget revisions for research projects.",
    },
  ];

  const [selectedYear, setSelectedYear] = useState("all");

  const filteredCirculars =
    selectedYear === "all"
      ? circulars
      : circulars.filter((c) => c.fiscalYear === selectedYear);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Circulars</h2>

      {/* Filter */}
      <div className="mb-3">
        <select
          className="form-select w-auto"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="all">All Fiscal Years</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>

      {/* Circulars List */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Fiscal Year</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCirculars.map((c) => (
            <tr key={c.id}>
              <td>{c.title}</td>
              <td>{c.type}</td>
              <td>{c.fiscalYear}</td>
              <td>
                <Link
                  href={`/researcher/dashboard/circulars/${c.id}`}
                  className="btn btn-sm btn-primary"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
