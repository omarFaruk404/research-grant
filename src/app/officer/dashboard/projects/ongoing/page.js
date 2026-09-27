"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ApprovedOngoing() {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/officer/projects/ongoing");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) =>
    [p.title, p.researcher_name, p.code_no]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="container my-5">
      <h2 className="mb-4">Approved / Ongoing Projects</h2>

      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-hover table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Researcher</th>
              <th>Faculty</th>
              <th>Department</th>
              <th>Status</th>
              <th>Proposal Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p) => (
                <tr key={p.id}>
                  <td>{p.code_no}</td>
                  <td>
                    <Link
                      href={`/officer/dashboard/projects/${p.id}`}
                      className="text-decoration-none"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td>{p.researcher_name}</td>
                  <td>{p.faculty}</td>
                  <td>{p.department}</td>
                  <td>
                    <span className="badge bg-success">{p.status}</span>
                  </td>
                  <td>{p.proposal_submission_date || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
