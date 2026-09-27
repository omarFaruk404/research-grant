"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProjectPage() {
  const { id } = useParams();
  const router = useRouter();

  // --- Data States ---
  const [project, setProject] = useState(null);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [allCirculars, setAllCirculars] = useState([]); 
  const [proposalFiles, setProposalFiles] = useState([]); // Array
  const [finalReportFiles, setFinalReportFiles] = useState([]); // Array (but typically contains 1)
  const [reportStatus, setReportStatus] = useState(null); 

  // --- Queue States ---
  const [filesToDelete, setFilesToDelete] = useState([]); // Proposal files to delete
  
  // --- New File States ---
  const [newProposalFiles, setNewProposalFiles] = useState([]); // Array
  const [newFinalReportFile, setNewFinalReportFile] = useState(null); // Single Object (Limit 1)

  // --- UI States ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);

  const [formData, setFormData] = useState({
    title: "", abstract: "", fiscal_year_id: "", circular_id: "", proposed_budget: "",
  });

  // --- Logic Helpers ---
  const currentDate = new Date();
  const selectedCircular = allCirculars.find(c => String(c.id) === String(formData.circular_id));
  const deadlineDate = selectedCircular ? new Date(selectedCircular.proposal_submission_deadline) : null;
  const isDeadlinePassed = deadlineDate ? currentDate > deadlineDate : false;
  const isProposalLocked = isDeadlinePassed || (project && project.status !== 1);
  const isFinalReportAllowed = project?.status === 3;
  const isReportLocked = reportStatus === 2 || reportStatus === 3; 
  const isPaymentEnabled = project && project.status > 1; 

  // --- FETCH DATA ---
  useEffect(() => {
    async function init() {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return router.push("/login");
      const user = JSON.parse(storedUser);

      try {
        const [fyRes, circRes, projectRes] = await Promise.all([
          fetch("/api/fiscal-years"),
          fetch("/api/circulars/proposals"),
          fetch(`/api/researcher/projects/${id}?researcher_id=${user.researcher_id}`)
        ]);

        const fyData = await fyRes.json();
        const circData = await circRes.json();
        const projectData = await projectRes.json();

        if (Array.isArray(fyData)) setFiscalYears(fyData);
        if (Array.isArray(circData)) setAllCirculars(circData);

        if (projectData.project) {
          const p = projectData.project;
          setProject(p);
          setFormData({
            title: p.title || "",
            abstract: p.abstract || "", 
            fiscal_year_id: p.fiscal_year_id ? String(p.fiscal_year_id) : "",
            circular_id: p.circular_id ? String(p.circular_id) : "", 
            proposed_budget: p.proposed_budget || "",
          });
          setProposalFiles(projectData.proposal_documents || []);
          const reportDocs = projectData.final_report_documents || [];
          setFinalReportFiles(reportDocs);
          if (reportDocs.length > 0) setReportStatus(reportDocs[0].status); 
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    }
    init();
  }, [id, router]);

  const availableCirculars = useMemo(() => {
    if (!formData.fiscal_year_id) return [];
    return allCirculars.filter(c => String(c.fiscal_year_id) === String(formData.fiscal_year_id));
  }, [allCirculars, formData.fiscal_year_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "fiscal_year_id") setFormData(prev => ({ ...prev, circular_id: "" }));
  };

  // ---------------------------------------------------------
  // ✅ PROPOSAL FILE HANDLERS
  // ---------------------------------------------------------
  const handleMarkForDeletion = (fileUrl) => {
    setFilesToDelete(prev => [...prev, fileUrl]);
    setProposalFiles(prev => prev.filter(f => f.url !== fileUrl));
  };

  const handleFileChange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
          const selectedFiles = Array.from(e.target.files);
          setNewProposalFiles(prev => [...prev, ...selectedFiles]);
          e.target.value = ""; 
      }
  };

  const handleRemoveNewFile = (indexToRemove) => {
      setNewProposalFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // ---------------------------------------------------------
  // ✅ FINAL REPORT FILE HANDLERS (New Logic)
  // ---------------------------------------------------------
  
  // 1. Handle Selection (Single File Limit)
  const handleFinalReportChange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
          setNewFinalReportFile(e.target.files[0]); // Replace existing selection
          e.target.value = ""; // Reset input to allow re-selecting same file if needed
      }
  };

  // 2. Deselect/Remove the newly selected report
  const handleRemoveNewReport = () => {
      setNewFinalReportFile(null);
  };

  // ---------------------------------------------------------

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
        const data = new FormData();
        data.append("title", formData.title);
        data.append("abstract", formData.abstract);
        data.append("fiscal_year_id", formData.fiscal_year_id);
        data.append("circular_id", formData.circular_id);
        data.append("proposed_budget", formData.proposed_budget);
        
        if (filesToDelete.length > 0) {
            data.append("files_to_delete", JSON.stringify(filesToDelete));
        }

        newProposalFiles.forEach((file) => {
            data.append("proposal_files", file);
        });

        const res = await fetch(`/api/researcher/projects/${id}/update`, {
            method: "PUT",
            body: data 
        });

        if (res.ok) {
            const result = await res.json();
            alert("Project saved successfully!");
            if (result.proposal_documents) setProposalFiles(result.proposal_documents);
            setNewProposalFiles([]);
            setFilesToDelete([]); 
        } else {
            const err = await res.json();
            alert("Update failed: " + (err.error || "Unknown error"));
        }
    } catch (err) { alert("Network error."); } 
    finally { setSaving(false); }
  };

  const handleFinalReportSubmit = async (e) => {
    e.preventDefault();
    if (!newFinalReportFile) return;
    
    setUploadingReport(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const data = new FormData();
    data.append("documents", newFinalReportFile);
    data.append("uploaded_by", user.user_id);
    
    try {
        const res = await fetch(`/api/researcher/projects/${id}/submit-final-report`, { method: "POST", body: data });
        if (res.ok) {
            const result = await res.json();
            setFinalReportFiles(result.documents || result.final_report_documents);
            setReportStatus(1);
            setNewFinalReportFile(null); // Clear selection after success
            alert("Report submitted successfully!");
        } else { alert("Upload failed."); }
    } catch(e) { alert("Error uploading."); } 
    finally { setUploadingReport(false); }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h2 className="fw-bold text-dark mb-1">Edit Project</h2></div>
        <Link 
            href={isPaymentEnabled ? `/researcher/dashboard/payments/${id}` : "#"}
            className={`btn d-flex align-items-center gap-2 fw-bold px-4 py-2 rounded-pill shadow-sm ${isPaymentEnabled ? 'btn-success text-white' : 'btn-secondary disabled'}`}
            style={{pointerEvents: isPaymentEnabled ? 'auto' : 'none'}}
        >
            <i className="bi bi-credit-card-2-back-fill"></i> Payments
        </Link>
      </div>

      {isProposalLocked && (
          <div className="alert alert-warning border-warning shadow-sm rounded-3 mb-4">
              <strong>Locked:</strong> Editing is disabled (Deadline passed or Project processed).
          </div>
      )}

      <div className="row g-4">
        
        {/* LEFT COLUMN (Proposal) */}
        <div className="col-lg-8">
            <div className={`card border-0 shadow-sm rounded-4 h-100 ${isProposalLocked ? 'bg-light' : 'bg-white'}`}>
                <div className="card-header bg-transparent p-4 border-bottom"><h5 className="fw-bold mb-0 text-primary">Proposal Details</h5></div>
                <div className="card-body p-4">
                    <form onSubmit={handleSaveProject}>
                        {/* INPUTS (Simplified) */}
                        <div className="mb-3">
                            <label className="form-label fw-bold small text-secondary">PROJECT TITLE</label>
                            <input type="text" name="title" className="form-control" value={formData.title} onChange={handleInputChange} disabled={isProposalLocked} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold small text-secondary">ABSTRACT</label>
                            <textarea name="abstract" className="form-control" rows="5" value={formData.abstract} onChange={handleInputChange} disabled={isProposalLocked}></textarea>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold small text-secondary">FISCAL YEAR</label>
                                <select name="fiscal_year_id" className="form-select" value={formData.fiscal_year_id} onChange={handleInputChange} disabled={isProposalLocked} required>
                                    <option value="">Select...</option>
                                    {fiscalYears.map(fy => <option key={fy.id} value={fy.id}>{fy.year_label}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold small text-secondary">CIRCULAR</label>
                                <select name="circular_id" className="form-select" value={formData.circular_id} onChange={handleInputChange} disabled={isProposalLocked || !formData.fiscal_year_id} required>
                                    <option value="">Select...</option>
                                    {availableCirculars.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold small text-secondary">BUDGET</label>
                                <div className="input-group"><span className="input-group-text">৳</span><input type="number" name="proposed_budget" className="form-control" value={formData.proposed_budget} onChange={handleInputChange} disabled={isProposalLocked} required /></div>
                            </div>
                        </div>

                        {/* --- PROPOSAL DOCUMENTS --- */}
                        <div className="mb-4 pt-3 border-top">
                             <label className="form-label fw-bold small text-secondary d-block mb-2">PROPOSAL DOCUMENTS</label>
                             
                             {/* Existing Files */}
                             {proposalFiles.map((file, idx) => (
                                <div key={idx} className="p-2 bg-white border rounded d-flex align-items-center justify-content-between mb-2">
                                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                                        <i className="bi bi-file-earmark-text text-primary"></i>
                                        <a href={file.url} target="_blank" className="text-decoration-none fw-bold small text-dark">{file.name}</a>
                                        <span className="badge bg-secondary" style={{fontSize:'0.6rem'}}>Saved</span>
                                    </div>
                                    {!isProposalLocked && (
                                        <button type="button" className="btn btn-sm btn-outline-danger border-0" onClick={() => handleMarkForDeletion(file.url)}>Remove</button>
                                    )}
                                </div>
                             ))}

                             {/* Upload New Files */}
                             {!isProposalLocked && (
                                 <div>
                                     <input type="file" className="form-control mb-2" onChange={handleFileChange} accept=".pdf,.doc,.docx" multiple />
                                     
                                     {/* New Selection List */}
                                     {newProposalFiles.map((file, i) => (
                                        <div key={`new-${i}`} className="p-2 bg-success-subtle border border-success border-opacity-25 rounded d-flex align-items-center justify-content-between mb-2">
                                            <div className="d-flex align-items-center gap-2 overflow-hidden">
                                                <i className="bi bi-plus-circle-fill text-success"></i>
                                                <span className="fw-bold small text-success text-truncate">{file.name}</span>
                                                <span className="badge bg-success" style={{fontSize:'0.6rem'}}>New</span>
                                            </div>
                                            <button type="button" className="btn btn-sm text-danger fw-bold" onClick={() => handleRemoveNewFile(i)} style={{fontSize: '0.8rem'}}>Remove</button>
                                        </div>
                                     ))}
                                     
                                     {filesToDelete.length > 0 && <div className="form-text text-danger mt-1 small"><i className="bi bi-trash"></i> {filesToDelete.length} files marked for deletion.</div>}
                                 </div>
                             )}
                        </div>

                        {!isProposalLocked && (
                            <div className="text-end">
                                <button type="submit" className="btn btn-primary px-5 fw-bold shadow-sm" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: FINAL REPORT */}
        <div className="col-lg-4">
             <div className="card shadow-sm border-0 rounded-4">
                 <div className="card-header bg-white p-3 border-bottom"><h6 className="mb-0 fw-bold text-success">Final Report</h6></div>
                 <div className="card-body p-4">
                    {isFinalReportAllowed ? (
                        <>
                             {/* 1. Existing Report Display */}
                             {finalReportFiles.length > 0 ? (
                                <div className="mb-3">
                                    <label className="small text-secondary fw-bold mb-2">CURRENT FILE</label>
                                    {finalReportFiles.map((f, i) => (
                                        <div key={i} className="p-3 bg-success-subtle rounded border border-success border-opacity-25 d-flex align-items-center gap-2 mb-2">
                                            <i className="bi bi-file-earmark-check-fill text-success"></i>
                                            <a href={f.url} target="_blank" className="text-decoration-none text-dark fw-bold small text-truncate">{f.name}</a>
                                        </div>
                                    ))}
                                    {!isReportLocked && <div className="form-text text-muted small">Submitting a new file will replace this one.</div>}
                                </div>
                             ) : <p className="text-muted small mb-3">No report submitted yet.</p>}

                             {/* 2. New File Selection (Limit 1) */}
                             {!isReportLocked && (
                                <div className="mt-3 border-top pt-3">
                                    <label className="small text-secondary fw-bold mb-2">UPLOAD NEW REPORT</label>
                                    
                                    {/* Input (Hidden if file selected to keep UI clean, or shown below) */}
                                    <input 
                                        type="file" 
                                        className="form-control mb-2" 
                                        onChange={handleFinalReportChange} 
                                        accept=".pdf,.doc,.docx" 
                                        // No 'multiple' here
                                    />

                                    {/* Selected File Card (Green) with Remove Button */}
                                    {newFinalReportFile && (
                                        <div className="p-2 bg-success-subtle border border-success border-opacity-25 rounded d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex align-items-center gap-2 overflow-hidden">
                                                <i className="bi bi-plus-circle-fill text-success"></i>
                                                <span className="fw-bold small text-success text-truncate">{newFinalReportFile.name}</span>
                                                <span className="badge bg-success" style={{fontSize:'0.6rem'}}>New</span>
                                            </div>
                                            {/* ✅ REMOVE BUTTON FOR FINAL REPORT */}
                                            <button 
                                                type="button" 
                                                className="btn btn-sm text-danger fw-bold" 
                                                onClick={handleRemoveNewReport} 
                                                style={{fontSize: '0.8rem'}}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}

                                    <button 
                                        onClick={handleFinalReportSubmit} 
                                        className="btn btn-success w-100 btn-sm fw-bold shadow-sm" 
                                        disabled={uploadingReport || !newFinalReportFile}
                                    >
                                        {uploadingReport ? "Uploading..." : "Submit Report"}
                                    </button>
                                </div>
                             )}

                             {isReportLocked && (
                                <div className="alert alert-info small mt-3 mb-0 border-info">
                                    <i className="bi bi-info-circle-fill me-2"></i> Report is currently <strong>{reportStatus === 2 ? "Under Review" : "Accepted"}</strong>.
                                </div>
                             )}
                        </>
                    ) : (
                        <div className="text-center py-4 text-muted">
                            <i className="bi bi-lock-fill fs-1 opacity-25"></i>
                            <p className="small mb-0 mt-2">Available only for ongoing projects.</p>
                        </div>
                    )}
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
}