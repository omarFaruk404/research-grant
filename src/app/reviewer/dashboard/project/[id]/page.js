"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NavBar from "@/components/NavBar";

export default function ReviewerProject() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [form, setForm] = useState({
    feasibility: 0,
    impact: 0,
    importance: 0,
    innovation: 0,
    completeness: 0,
    comments: "",
  });
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/reviewer/projects/${id}`);

        if (res.redirected) {
          window.location.href = res.url;
          return;
        }
        if (res.status === 401 || res.status === 403) {
          window.location.href = "/login";
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setProject(data.project);

          // preload form if a review already exists
          if (data.project.review) {
            setForm({
              feasibility: data.project.review.feasibility_score ?? 0,
              impact: data.project.review.impact_score ?? 0,
              importance: data.project.review.importance_score ?? 0,
              innovation: data.project.review.innovation_score ?? 0,
              completeness: data.project.review.completeness_score ?? 0,
              comments: data.project.review.comments ?? "",
            });
          }
        }
      } catch (err) {
        console.error("Fetch project error:", err);
        window.location.href = "/login";
      }
    }

    if (id) fetchProject();
  }, [id]);

  const submitReview = async () => {
    const res = await fetch("/api/reviewer/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: id,
        ...form,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Review submitted successfully");
      location.reload();
    } else {
      alert(data.error || "Failed to submit review");
    }
  };

  if (!project) return <p>Loading project...</p>;

  const statusBadge =
    project.status === "submitted"
      ? "bg-warning text-dark"
      : project.status === "under_review"
      ? "bg-primary"
      : project.status === "reviewed"
      ? "bg-info text-dark"
      : project.status === "approved"
      ? "bg-success"
      : "bg-secondary";

  const total =
    Number(form.feasibility || 0) +
    Number(form.impact || 0) +
    Number(form.importance || 0) +
    Number(form.innovation || 0) +
    Number(form.completeness || 0);

  return (
    <div>
      <NavBar role="reviewer" />

      <div className="container mt-4">
        {/* Header Row */}
        <div className="row mb-4">
          <div className="col-md-9">
            <h2>{project.title}</h2>
            <p><strong>Researcher:</strong> {project.researcher_name}</p>
            <p><strong>Proposed Funds:</strong> {project.required_funds}</p>
          </div>
          <div className="col-md-3 text-end">
            <span className={`badge p-2 fs-6 ${statusBadge}`}>
              {project.status}
            </span>
          </div>
        </div>

        {/* Description with Show More / Less */}
        <div className="mb-4">
          <h5>Description</h5>
          <p>
            {showFullDesc
              ? project.description
              : project.description.slice(0, 250) +
                (project.description.length > 250 ? "..." : "")}
          </p>
          {project.description.length > 250 && (
            <button className="btn btn-link p-0" onClick={() => setShowFullDesc(!showFullDesc)}>
              {showFullDesc ? "Show Less" : "Show More"}
            </button>
          )}
        </div>

        {/* Attachments */}
        <h5>Attachments</h5>
        {project.files && project.files.length > 0 ? (
          <div className="d-flex flex-wrap gap-3 mb-4">
            {project.files.map((file) => (
              <a
                key={file.id}
                href={file.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-secondary"
              >
                {file.file_type}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-muted mb-4">No files uploaded</p>
        )}

        {/* --- TABLED FORM WHEN UNDER REVIEW --- */}
        {(project.status === "under_review") && (
          <div className="card mb-4">
            <div className="card-header">Review Form</div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered align-middle text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Criteria</th>
                      <th>Marks (0–20)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Feasibility", "feasibility"],
                      ["Impact", "impact"],
                      ["Importance", "importance"],
                      ["Innovation", "innovation"],
                      ["Completeness", "completeness"],
                    ].map(([label, key]) => (
                      <tr key={key}>
                        <td className="text-start">{label}</td>
                        <td style={{ maxWidth: 140 }}>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            className="form-control text-center"
                            value={form[key]}
                            onChange={(e) =>
                              setForm({ ...form, [key]: e.target.value })
                            }
                          />
                        </td>
                      </tr>
                    ))}
                    <tr className="table-secondary fw-bold">
                      <td className="text-start">Total</td>
                      <td>{total} / 100</td>
                    </tr>
                    <tr>
                      <td className="text-start">Comments</td>
                      <td>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={form.comments}
                          onChange={(e) =>
                            setForm({ ...form, comments: e.target.value })
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button type="button" className="btn btn-primary" onClick={submitReview}>
                Submit Review
              </button>
            </div>
          </div>
        )}

        {/* --- TABLED READ-ONLY REVIEW WHEN REVIEWED --- */}
        {(project.status === "reviewed" || project.status === "not_eligible" || project.status === "funded") && project.review && (
          <div className="card mb-4">
            <div className="card-header">Review</div>
            <div className="card-body">

              <div className="table-responsive">
                <table className="table table-bordered text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Criteria</th>
                      <th>Marks (out of 20)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-start">Feasibility</td>
                      <td>{project.review.feasibility_score}</td>
                    </tr>
                    <tr>
                      <td className="text-start">Impact</td>
                      <td>{project.review.impact_score}</td>
                    </tr>
                    <tr>
                      <td className="text-start">Importance</td>
                      <td>{project.review.importance_score}</td>
                    </tr>
                    <tr>
                      <td className="text-start">Innovation</td>
                      <td>{project.review.innovation_score}</td>
                    </tr>
                    <tr>
                      <td className="text-start">Completeness</td>
                      <td>{project.review.completeness_score}</td>
                    </tr>
                    <tr className="table-secondary fw-bold">
                      <td className="text-start">Total</td>
                      <td>{project.review.total_score} / 100</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                <h5>Reviewer Comments</h5>
                <p className="mb-0">{project.review.comments}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
