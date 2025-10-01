"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
export default function OfficerDashboard() {
  const [projects, setProjects] = useState([]);

// useEffect(() => {
//   fetch("/api/officer/projects")
//     .then(res => {
//       // ✅ Handle API-side redirects
//       if (res.redirected) {
//         window.location.href = res.url;
//         return null;
//       }

//       // ✅ Handle auth errors
//       if (res.status === 401 || res.status === 403) {
//         window.location.href = "/login";
//         return null;
//       }

//       return res.json();
//     })
//     .then(data => {
//       console.log(data);
//       if (data) setProjects(data);
//     })
//     .catch(err => {
//       console.error("Fetch error:", err);
//       window.location.href = "/login"; // optional fallback
//     });
// }, []);


  return (

    <div>
      <NavBar role="officer" />

      <div className="container mt-4">
        <h1 className="mb-4">Officer Dashboard</h1>

        {projects.length === 0 ? (
          <p className="text-muted">No projects available.</p>
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
                {projects.map((project, index) => (
                  <tr key={project.id}>
                    <th scope="row">{index + 1}</th>
                    <td>
                      <Link
                        href={`/officer/projects/${project.id}`}
                        className="text-decoration-none"
                      >
                        {project.title}
                      </Link>
                    </td>
                    <td>{project.researcher_name}</td>
                    <td>{new Date(project.submitted_at).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          project.status === "Approved"
                            ? "bg-success"
                            : project.status === "Pending"
                            ? "bg-warning text-dark"
                            : "bg-danger"
                        }`}
                      >
                        {project.status}
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
