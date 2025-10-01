"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NavBar from "@/components/NavBar";
import { projects } from "@/lib/dummy";

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState("");

  useEffect(() => {
    if (id) {
      const foundProject = projects.find((p) => p.id === Number(id));
      setProject(foundProject);
    }
  }, [id]);

  if (!project) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div>
      <NavBar role="officer" />

      <div className="container mt-4">
        {/* Header Row */}
        <div className="row mb-4">
          <div className="col-md-9">
            <h2>{project.title}</h2>
            <p>
              <strong>Researcher:</strong> {project.researcher.name} (
              {project.researcher.designation},{" "}
              {project.researcher.department}, {project.researcher.faculty})
            </p>
            <p>
              <strong>Proposed Budget:</strong> {project.proposed_budget} ৳
            </p>
          </div>
          <div className="col-md-3 text-end">
            <span className="badge bg-info fs-6 p-2">{project.status}</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h5>Description</h5>
          <p>
            {showFullDesc
              ? project.title + " — detailed project description goes here."
              : (project.title + " — detailed project description goes here.").slice(
                  0,
                  200
                ) + "..."}
          </p>
          <button
            className="btn btn-link p-0"
            onClick={() => setShowFullDesc(!showFullDesc)}
          >
            {showFullDesc ? "Show Less" : "Show More"}
          </button>
        </div>

        {/* Attachments (dummy for now) */}
        <h5>Attachments</h5>
        <p className="text-muted mb-4">No files uploaded</p>

        {/* Officer Actions */}
        {project.status === "Proposal Submitted" && (
          <div className="mb-3 d-flex gap-2 align-items-center">
            <select
              onChange={(e) => setSelectedReviewer(e.target.value)}
              className="form-select w-auto"
            >
              <option value="">Select Reviewer</option>
              <option value="1">Reviewer One</option>
              <option value="2">Reviewer Two</option>
            </select>
            <button
              className="btn btn-primary"
              onClick={() => alert(`Assigned reviewer ${selectedReviewer}`)}
            >
              Assign Reviewer
            </button>
          </div>
        )}

        {project.status === "Under Review" && (
          <div className="text-center my-5">
            <h4 className="text-muted">⏳ This proposal is under review...</h4>
          </div>
        )}

        {project.status === "Approved / Ongoing" && (
          <div className="mb-3">
            <button
              className="btn btn-success"
              onClick={() => alert("Funds released!")}
            >
              Release Funds
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
