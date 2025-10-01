"use client";
import { useState } from "react";
import Link from "next/link";

// Dummy data simulating DB rows
const dummyPayments = [
  {
    id: 1,
    project_id: 101,
    project_title: "AI in Healthcare",
    fiscal_year: "2025",
    amount: 2500,
    slot: 1,
    total_slots: 4,
    released_at: "2025-06-15",
  },
  {
    id: 2,
    project_id: 101,
    project_title: "AI in Healthcare",
    fiscal_year: "2025",
    amount: 2500,
    slot: 2,
    total_slots: 4,
    released_at: "2025-09-01",
  },
  {
    id: 3,
    project_id: 202,
    project_title: "Climate Change Impact Study",
    fiscal_year: "2024",
    amount: 5000,
    slot: 1,
    total_slots: 2,
    released_at: "2024-04-10",
  },
];

export default function PaymentsPage() {
  const [selectedYear, setSelectedYear] = useState("all");

  const filteredPayments =
    selectedYear === "all"
      ? dummyPayments
      : dummyPayments.filter((p) => p.fiscal_year === selectedYear);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Payments</h2>

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

      {/* Payments List */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Project</th>
            <th>Fiscal Year</th>
            <th>Amount</th>
            <th>Slot</th>
            <th>Released At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map((p) => (
            <tr key={p.id}>
              <td>{p.project_title}</td>
              <td>{p.fiscal_year}</td>
              <td>${p.amount}</td>
              <td>
                {p.slot} / {p.total_slots}
              </td>
              <td>{p.released_at}</td>
              <td>
                <Link
                  href={`/researcher/dashboard/payments/${p.id}`}
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
