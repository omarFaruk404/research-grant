"use client";
import Link from "next/link";
import { useState } from "react";
import { projects } from "@/lib/dummy";

export default function UnderReview() {
  const [search, setSearch] = useState("");

  const filteredProjects = projects.filter(
    (p) =>
      p.status === "Under Review" &&
      [p.title, p.researcher_name, p.code_no]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="container my-5">
      <h2 className="mb-4">Under Review</h2>

      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="table table-hover table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Code</th>
            <th>Title</th>
            <th>Researcher</th>
            <th>Faculty</th>
            <th>Department</th>
            <th>Status</th>
            <th>Submission Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map((p) => (
            <tr key={p.id}>
              <td>{p.code_no}</td>
              <td>
                <Link href={`/officer/dashboard/projects/${p.id}`} className="text-decoration-none">
                  {p.title}
                </Link>
              </td>
              <td>{p.researcher_name}</td>
              <td>{p.faculty}</td>
              <td>{p.department}</td>
              <td><span className="badge bg-info">{p.status}</span></td>
              <td>{p.submission_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
