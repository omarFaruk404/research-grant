"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const STATUS_MAP = {
  0: "Rejected",
  1: "Proposal Submitted",
  2: "Proposal Under Review",
  3: "Project Accepted / Ongoing",
  4: "Project Report Submitted",
  5: "Project Completed",
};

export default function ResearcherOngoingProjects() {
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get researcher_id from logged-in user in localStorage
    const storedUser = typeof window !== "undefined"
      ? localStorage.getItem("user")
      : null;

    if (!storedUser) {
      setLoading(false);
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch (e) {
      console.error("Invalid user in localStorage");
      setLoading(false);
      return;
    }

    if (!parsedUser?.researcher_id) {
      // Not a researcher / no researcher profile
      setLoading(false);
      return;
    }

    async function fetchProjects() {
      try {
        const res = await fetch(
          `/api/researcher/projects/ongoing?researcher_id=${parsedUser.researcher_id}`
        );
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
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
    <div className="container-fluid px-4 mt-5 position-relative">
      <h2 className="mb-4">My Approved / Ongoing Projects</h2>

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
                      href={`/researcher/dashboard/projects/${p.id}`}
                      className="text-decoration-none"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td>
                    <span className="badge bg-success">
                      {STATUS_MAP[p.status] || p.status}
                    </span>
                  </td>
                  <td>{p.proposal_submission_date || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
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
