"use client";
import { useState } from "react";
import Link from "next/link";
import { projectReports, projects, fiscalYears } from "@/lib/dummy";

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState("all");

  const getProjectById = (id) => projects.find((p) => p.id === id);

  const filteredReports =
    selectedYear === "all"
      ? projectReports
      : projectReports.filter((r) => {
          const proj = getProjectById(r.project_id);
          return proj?.fiscal_year === selectedYear;
        });

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Submitted Reports</h2>
      <div className="card mb-5">
        <div className="card-body">
          <h5 className="card-title">Reports Awaiting Action</h5>
          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Project</th>
                <th>Researcher</th>
                <th>Uploaded At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {projectReports.map((report) => {
                const proj = getProjectById(report.project_id);
                return (
                  <tr key={report.id}>
                    <td>{report.name}</td>
                    <td>{proj?.title}</td>
                    <td>{proj?.researcher?.name}</td>
                    <td>{report.uploaded_at}</td>
                    <td>
                      <Link
                        href={`/officer/dashboard/reports/${report.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="mb-4">All Reports</h2>
      <div className="mb-3">
        <select
          className="form-select w-auto"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="all">All Fiscal Years</option>
          {fiscalYears.map((fy) => (
            <option key={fy.id} value={fy.year_label}>
              {fy.year_label}
            </option>
          ))}
        </select>
      </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Report Name</th>
            <th>Type</th>
            <th>Project</th>
            <th>Fiscal Year</th>
            <th>Uploaded By</th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.map((report) => {
            const proj = getProjectById(report.project_id);
            return (
              <tr key={report.id}>
                <td>{report.name}</td>
                <td>{report.type}</td>
                <td>{proj?.title}</td>
                <td>{proj?.fiscal_year}</td>
                <td>{report.uploaded_by}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
