"use client";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
export default function ReviewerDashboard() {
  const [projects, setProjects] = useState([]);

useEffect(() => {
  fetch("/api/reviewer/projects")
    .then(res => {
      // ✅ Handle API-side redirects
      if (res.redirected) {
        window.location.href = res.url;
        return null;
      }

      // ✅ Handle auth errors
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/login";
        return null;
      }

      return res.json();
    })
    .then(data => {
      console.log(data);
      if (data) setProjects(data);
    })
    .catch(err => {
      console.error("Fetch projects error:", err);
      window.location.href = "/login"; // fallback
    });
}, []);


  if (!projects.length) return <p>No assigned projects</p>;

  return (
    <div>
      <NavBar role="reviewer" />

      <div className="container mt-4">
        <h1 className="mb-4">Reviewer Dashboard</h1>

        {projects.length === 0 ? (
          <p className="text-muted">No projects assigned yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Title</th>
                  <th scope="col">Researcher Name</th>
                  <th scope="col">Submitted At</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, index) => (
                  <tr key={p.id}>
                    <th scope="row">{index + 1}</th>
                    <td>
                      <a href={`/reviewer/projects/${p.id}`} className="text-decoration-none">
                        {p.title}
                      </a>
                    </td>
                    <td>{p.researcher_name}</td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.status === "submitted"
                            ? "bg-warning text-dark"
                            : p.status === "reviewed"
                            ? "bg-info text-dark"
                            : p.status === "approved"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}