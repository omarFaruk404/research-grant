"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import FinalReportManager from "@/components/FinalReportManager";
import ProposalReviewManager from "@/components/ProposalReviewManager";

const STATUS_MAP = {
  0: "Rejected",
  1: "Proposal Submitted",
  2: "Under Review",
  3: "Accepted / Ongoing",
  4: "Report Submitted",
  5: "Completed",
};

export default function ManageProjectView() {
  const { id } = useParams();
  const router = useRouter();
  
  // Data State
  const [project, setProject] = useState(null);
  const [proposalReview, setProposalReview] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [finalReportReview, setFinalReportReview] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Edit Mode State (Title & Code)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", code_no: "" });
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  // Budget State
  const [allocatedBudget, setAllocatedBudget] = useState("");
  const [isEditingBudget, setIsEditingBudget] = useState(false); // Toggle for budget edit

  // File Upload State
  const [reportFile, setReportFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false); // Toggle for report upload

  /* 🔐 AUTH CHECK */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    try {
      const u = JSON.parse(stored);
      if (!u || u.role !== 1) router.push("/login");
      setUser(u);
    } catch {
      router.push("/login");
    }
  }, [router]);

  /* 📦 LOAD DATA */
  const loadData = async () => {
    try {
      const res = await fetch(`/api/officer/projects/${id}`);
      const data = await res.json();
      
      setProject(data.project);
      setProposalReview(data.proposal_review);
      setFinalReport(data.final_report);
      setFinalReportReview(data.final_report_review);
      
      // Initialize Edit Form
      setEditForm({
        title: data.project.title || "",
        code_no: data.project.code_no || ""
      });

      if (data.project?.allocated_budget) {
        setAllocatedBudget(String(data.project.allocated_budget));
      }

      const resRev = await fetch("/api/reviewers");
      const dataRev = await resRev.json();
      setReviewers(dataRev);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  /* ---------------- ACTIONS ---------------- */

  // ✅ UPDATE TITLE & CODE
  const handleUpdateDetails = async () => {
    setIsSavingDetails(true);
    try {
        const res = await fetch(`/api/officer/projects/${id}/update-details`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editForm)
        });

        if (res.ok) {
            alert("Project details updated successfully.");
            setIsEditing(false);
            loadData(); // Refresh data
        } else {
            alert("Failed to update details.");
        }
    } catch (error) {
        alert("Error updating details.");
    } finally {
        setIsSavingDetails(false);
    }
  };

  const saveBudget = async (e) => {
    e.preventDefault();
    try {
      await fetch(`/api/officer/projects/${id}/set-budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocated_budget: allocatedBudget }),
      });
      alert("Budget allocated successfully.");
      setIsEditingBudget(false); // Exit edit mode
      loadData();
    } catch (error) {
      alert("Error saving budget");
    }
  };

  const uploadFinalReport = async (e) => {
    e.preventDefault();
    if (!reportFile) return alert("Please select a file.");
    
    if (finalReport && !confirm("A final report already exists. Do you want to replace it? The old file will be deleted.")) {
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("documents", reportFile);
    formData.append("uploaded_by", user.user_id);

    try {
      const res = await fetch(`/api/officer/projects/${id}/submit-report`, { method: "POST", body: formData });
      if (res.ok) {
        alert(finalReport ? "Report updated successfully." : "Report uploaded successfully.");
        setIsEditingReport(false); // Exit edit mode
        loadData();
      } else {
          const err = await res.json();
          alert(err.error || "Upload failed");
      }
    } catch (error) {
      alert("Upload failed.");
    } finally {
        setIsUploading(false);
    }
  };

  /* --- UI HELPERS --- */
  const existingDoc = finalReport?.documents && finalReport.documents.length > 0 ? finalReport.documents[0] : null;
  const hasBudget = project?.allocated_budget && parseFloat(project.allocated_budget) > 0;

  if (loading) return <div className="text-center mt-5 text-secondary">Loading...</div>;
  if (!project) return <div className="text-center mt-5 text-danger">Project not found.</div>;

  return (
    <div className="container-fluid px-4 mt-5 mb-5">
      
      {/* --- HEADER SECTION --- */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
        <div className="card-body p-4">
            
            {/* Top Row: Navigation & Status */}
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <Link href={`/officer/dashboard/projects/${id}`} className="text-decoration-none text-secondary small fw-bold">
                        &larr; BACK TO LIST
                    </Link>
                    <div className="small text-uppercase text-primary fw-bold mt-2 tracking-wide">Manage Project</div>
                </div>
                <span className={`badge rounded-pill px-3 py-2 ${project.status === 5 ? 'bg-secondary' : 'bg-primary-subtle text-primary border border-primary-subtle'}`}>
                    {STATUS_MAP[project.status]}
                </span>
            </div>

            {/* Middle Row: Editable Title & Code */}
            {isEditing ? (
                <div className="bg-light p-3 rounded-3 border border-primary-subtle">
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-secondary">Project Title</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={editForm.title} 
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})} 
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-secondary">Project Code No.</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={editForm.code_no} 
                            onChange={(e) => setEditForm({...editForm, code_no: e.target.value})} 
                        />
                    </div>
                    <div className="d-flex gap-2 justify-content-end">
                        <button className="btn btn-sm btn-light border" onClick={() => setIsEditing(false)}>Cancel</button>
                        <button className="btn btn-sm btn-primary" onClick={handleUpdateDetails} disabled={isSavingDetails}>
                            {isSavingDetails ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="d-flex align-items-start justify-content-between">
                        <h3 className="fw-bold text-dark mb-1">{project.title}</h3>
                        <button className="btn btn-link text-secondary p-0 ms-3" onClick={() => setIsEditing(true)} title="Edit Title/Code">
                            <i className="bi bi-pencil-square fs-5"></i>
                        </button>
                    </div>
                    <div className="d-flex align-items-center gap-3 text-muted mt-2">
                        <div className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded border">
                            <i className="bi bi-upc-scan"></i> 
                            <span className="fw-medium font-monospace">{project.code_no || "No Code Assigned"}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-person-circle"></i>
                            <span className="fw-medium text-dark">{project.researcher_name || "Unknown Researcher"}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="row">
          <div className="col-12">
            
            {/* --- STATUS 1 & 2: PROPOSAL MANAGER --- */}
            {(project.status === 1 || project.status === 2) && (
                <ProposalReviewManager 
                    projectId={id}
                    projectStatus={project.status}
                    projectReviewerId={project.reviewer_id}
                    proposalReview={proposalReview}
                    reviewers={reviewers}
                    user={user}
                    onRefresh={loadData}
                />
            )}

            {/* --- STATUS 3 & 4: ONGOING / REPORT SUBMITTED --- */}
            {(project.status === 3 || project.status === 4) && (
                <div className="row g-4">
                    {/* BUDGET COLUMN */}
                    <div className="col-lg-6">
                        <div className="card shadow-sm border-0 rounded-4 h-100">
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold mb-0">Project Budget</h5>
                                    {/* Toggle Edit Button if budget exists */}
                                    {hasBudget && !isEditingBudget && project.status !== 5 && (
                                        <button className="btn btn-sm btn-link text-secondary p-0" onClick={() => setIsEditingBudget(true)} title="Edit Budget">
                                            <i className="bi bi-pencil-square fs-5"></i>
                                        </button>
                                    )}
                                </div>

                                {hasBudget && !isEditingBudget ? (
                                    // READ-ONLY MODE
                                    <div className="bg-light p-3 rounded-3 text-center border border-success-subtle">
                                        <div className="small text-uppercase fw-bold text-success mb-1">Allocated Amount</div>
                                        <div className="display-6 fw-bold text-dark">
                                            ৳ {Number(project.allocated_budget).toLocaleString()}
                                        </div>
                                    </div>
                                ) : (
                                    // EDIT / CREATE MODE
                                    <form onSubmit={saveBudget}>
                                        <label className="small text-secondary fw-bold text-uppercase mb-1">
                                            {hasBudget ? "Update Amount (BDT)" : "Allocate Amount (BDT)"}
                                        </label>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">৳</span>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                value={allocatedBudget} 
                                                onChange={(e) => setAllocatedBudget(e.target.value)} 
                                                disabled={project.status === 5} 
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="d-flex gap-2">
                                            {isEditingBudget && (
                                                <button type="button" className="btn btn-light border w-100" onClick={() => setIsEditingBudget(false)}>
                                                    Cancel
                                                </button>
                                            )}
                                            <button type="submit" className="btn btn-primary w-100" disabled={project.status === 5}>
                                                {hasBudget ? "Update Budget" : "Set Budget"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* REPORT UPLOAD COLUMN */}
                    <div className="col-lg-6">
                        <div className="card shadow-sm border-0 rounded-4 h-100">
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold mb-0">Final Report</h5>
                                    {/* Toggle Edit Button if report exists */}
                                    {finalReport && !isEditingReport && project.status !== 5 && (
                                        <button className="btn btn-sm btn-link text-secondary p-0" onClick={() => setIsEditingReport(true)} title="Upload New Version">
                                            <i className="bi bi-pencil-square fs-5"></i>
                                        </button>
                                    )}
                                </div>

                                {finalReport && !isEditingReport ? (
                                    // READ-ONLY MODE (Show existing file)
                                    <div className="bg-light p-3 rounded-3 border border-primary-subtle d-flex align-items-center gap-3">
                                        <div className="bg-white p-2 rounded-circle shadow-sm text-primary">
                                            <i className="bi bi-file-earmark-pdf fs-4"></i>
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="small text-uppercase fw-bold text-secondary opacity-75">Current File</div>
                                            <a href={existingDoc?.url} target="_blank" className="text-truncate d-block fw-bold text-dark text-decoration-none">
                                                {existingDoc?.name}
                                            </a>
                                            <div className="small text-muted mt-1">
                                                Uploaded on {new Date(finalReport.submission_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // UPLOAD MODE
                                    <form onSubmit={uploadFinalReport}>
                                        <label className="small text-secondary fw-bold text-uppercase mb-1">
                                            {finalReport ? "Select Replacement File" : "Select Document"}
                                        </label>
                                        <input 
                                            type="file" 
                                            className="form-control mb-3" 
                                            onChange={(e) => setReportFile(e.target.files[0])} 
                                            disabled={isUploading || project.status === 5} 
                                        />
                                        
                                        <div className="d-flex gap-2">
                                            {isEditingReport && (
                                                <button type="button" className="btn btn-light border w-100" onClick={() => setIsEditingReport(false)}>
                                                    Cancel
                                                </button>
                                            )}
                                            <button type="submit" className="btn btn-outline-success w-100" disabled={isUploading || project.status === 5}>
                                                {isUploading ? "Uploading..." : finalReport ? "Replace File" : "Upload Document"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- STATUS 4: REPORT SUBMITTED --- */}
            {project.status === 4 && (
                <FinalReportManager 
                    projectId={id}
                    finalReport={finalReport}
                    finalReportReview={finalReportReview}
                    reviewers={reviewers}
                    user={user}
                    onRefresh={loadData}
                />
            )}
            
            {/* --- STATUS 5: COMPLETED --- */}
            {project.status === 5 && (
                <div className="alert alert-secondary text-center p-5 rounded-4 border-0 bg-light mt-4">
                    <h2 className="fw-bold text-secondary mb-3"><i className="bi bi-archive-fill me-2"></i>Project Closed</h2>
                    <p className="text-muted">This project is marked as completed. No further actions are available.</p>
                    <Link href="/officer/dashboard/projects" className="btn btn-outline-secondary mt-3">Back to List</Link>
                </div>
            )}

          </div>
      </div>
    </div>
  );
}