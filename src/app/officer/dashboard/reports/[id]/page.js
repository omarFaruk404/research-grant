"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReportDetailsPage() {
  const { id } = useParams();
  const router = useRouter(); 
  
  // Data States
  const [report, setReport] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [criteria, setCriteria] = useState([]); // For Manual Review
  const [loading, setLoading] = useState(true);

  // UI States
  const [reviewMode, setReviewMode] = useState('auto'); // 'auto' | 'manual'
  const [isReassigning, setIsReassigning] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Assign Form States
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [selectedReviewerName, setSelectedReviewerName] = useState("");
  const [dueDate, setDueDate] = useState("");
  
  // Manual Review Form States
  const [manualMarksBreakdown, setManualMarksBreakdown] = useState({});
  const [manualRemarksBreakdown, setManualRemarksBreakdown] = useState({}); // New: Store manual remarks
  const [manualComments, setManualComments] = useState("");
  const [decision, setDecision] = useState(""); 

  // 1. LOAD DATA
  useEffect(() => {
    async function loadData() {
      try {
        const [repRes, revRes, settingsRes] = await Promise.all([
            fetch(`/api/officer/reports/${id}`),
            fetch("/api/reviewers"),
            fetch("/api/officer/review-settings")
        ]);
        
        const repData = await repRes.json();
        const revData = await revRes.json();
        const settingsData = await settingsRes.json();
        
        setReport(repData.report);
        setReviews(repData.reviews || []);
        setReviewers(revData);

        // Determine which criteria to use based on report type
        if (repData.report) {
            const type = repData.report.type === "final_report" ? "final_report_criteria" : "proposal_criteria";
            setCriteria(settingsData[type] || []);
        }

      } catch (e) { 
        console.error(e); 
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  // Derived State
  const activeReview = reviews.length > 0 ? reviews[0] : null;
  const hasValidReview = activeReview && activeReview.total_marks != null;
  
  // Search Filter
  const filteredReviewers = useMemo(() => {
    if (!searchTerm) return reviewers;
    return reviewers.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reviewers, searchTerm]);

  // Reviewer Display Info
  const currentReviewer = reviewers.find(r => r.reviewer_id === activeReview?.reviewer_id);
  const reviewerNameDisplay = currentReviewer?.name || activeReview?.reviewer_name || "Unknown Reviewer";
  const reviewerEmailDisplay = currentReviewer?.email || "N/A";
  const currentReviewerId = activeReview?.reviewer_id;

  // --- HELPERS ---
  const parseBreakdown = (jsonString) => {
    try {
        return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString || {};
    } catch (e) {
        return {};
    }
  };

  const autoBreakdown = parseBreakdown(activeReview?.marks_breakdown);

  // --- HANDLERS ---

  const handleReviewerSelect = (rId, rName) => {
    setSelectedReviewerId(rId);
    setSelectedReviewerName(rName);
    setShowSearch(false);
  };

  const handleAssign = async () => {
    if (!selectedReviewerId) return alert("Please select a reviewer.");
    if (!dueDate) return alert("Please select a due date.");

    const endpoint = isReassigning || reviews.length > 0
      ? `/api/officer/reports/${id}/reassign-reviewer`
      : `/api/officer/reports/${id}/assign-reviewer`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer_id: selectedReviewerId,
          assigned_by: 1, 
          due_date: dueDate,
        }),
      });

      if (res.ok) {
        alert("Reviewer updated successfully!");
        location.reload();
      } else {
        const err = await res.json();
        alert("Error: " + (err.error || "Failed to assign"));
      }
    } catch (error) {
      alert("Network error.");
    }
  };

  // --- MANUAL SCORE & REMARK HANDLERS ---
  const handleManualMarkChange = (label, maxMarks, val) => {
      const value = val === "" ? "" : parseFloat(val);
      if (value > maxMarks) return alert(`Max marks for this criteria is ${maxMarks}`);
      
      setManualMarksBreakdown(prev => ({
          ...prev,
          [label]: value
      }));
  };

  const handleManualRemarkChange = (label, val) => {
      setManualRemarksBreakdown(prev => ({
          ...prev,
          [label]: val
      }));
  };

  // --- API 1: Manual Review (Overrides everything) ---
  const handleManualSubmit = async () => {
    if (!decision) return alert("Please select a decision.");
    
    // Calculate total from breakdown
    const totalMarks = Object.values(manualMarksBreakdown).reduce((sum, v) => sum + (v || 0), 0);
    
    // Format breakdown for saving (compatible with new structure)
    const breakdownToSave = {};
    criteria.forEach(c => {
        breakdownToSave[c.label] = {
            score: manualMarksBreakdown[c.label] || 0,
            remark: manualRemarksBreakdown[c.label] || "" // Save the manual remark
        };
    });

    const decisionStr = decision === "3" ? "accepted" : "rejected";

    try {
      const res = await fetch(`/api/officer/reports/${id}/manual-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: activeReview?.id, 
          review_comments: manualComments || "Manual Override by Officer",
          total_marks: totalMarks,
          decision: decisionStr,
          marks_breakdown: breakdownToSave 
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Manual review submitted successfully.");
        location.reload();
      } else {
        alert("Error: " + (data.error || "Failed to submit"));
      }
    } catch (error) {
      alert("Network error");
    }
  };

  // --- API 2: Review Decision ---
  const handleOfficerDecision = async (action) => {
    if (!activeReview) return;
    
    const confirmMsg = action === "accept" 
      ? "Are you sure you want to ACCEPT this report?" 
      : "Are you sure you want to REJECT this report?";
    
    if (!confirm(confirmMsg)) return;

    const decisionStr = action === "accept" ? "accepted" : "rejected";

    try {
      const res = await fetch(`/api/officer/reports/${id}/review-decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: activeReview.id,
          decision: decisionStr
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Report ${decisionStr} successfully.`);
        location.reload();
      } else {
        alert("Error: " + (data.error || "Failed to update status"));
      }
    } catch (error) {
      alert("Network error");
    }
  };

  // --- API 3: Mark Project Complete ---
  const handleCompleteProject = async () => {
    if (!confirm("Are you sure you want to mark this project as COMPLETED?")) return;

    try {
        const res = await fetch(`/api/officer/reports/${id}/mark-complete`, { method: "PUT" });
        const data = await res.json();

        if (data.success) {
            alert("✅ Project marked as completed!");
            location.reload();
        } else {
            alert(data.error || "Failed to complete project.");
        }
    } catch (error) {
        alert("Network error.");
    }
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (!report) return <div className="p-5 text-center text-danger">Report not found</div>;

  const getStatusBadge = (status) => {
    switch(status) {
        case 1: return "bg-primary";
        case 2: return "bg-warning text-dark";
        case 3: return "bg-success";
        case 4: return "bg-danger";
        default: return "bg-secondary";
    }
  };

  const getStatusText = (status) => {
    switch(status) {
        case 1: return "Submitted";
        case 2: return "Under Review";
        case 3: return "Accepted";
        case 4: return "Rejected";
        default: return "Unknown";
    }
  };

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* BACK BUTTON */}
      <button 
        onClick={() => router.back()} 
        className="btn btn-link text-decoration-none p-0 mb-3 text-secondary d-flex align-items-center"
      >
        <i className="bi bi-arrow-left me-2"></i> Back to Reports
      </button>

      {/* HEADER SECTION */}
      <div className="mb-4 pb-3 border-bottom">
        <h2 className="fw-bold text-dark mb-2">{report.project_title || report.title}</h2>
        <div className="d-flex align-items-center gap-3">
            <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(report.status)}`}>
                {getStatusText(report.status)}
            </span>
            <span className="text-muted small border-start ps-3">
                Fiscal Year: <span className="fw-bold text-dark">{report.fiscal_year}</span>
            </span>
            <span className="text-muted small border-start ps-3">
                Researcher: <span className="fw-bold text-dark">{report.researcher_name}</span>
            </span>
        </div>
      </div>

      <div className="row">
          <div className="col-12">
            
            {/* --- STATUS 1: ASSIGN REVIEWER --- */}
            {report.status === 1 && (
                <div className="card shadow-sm border-0 rounded-4">
                    <div className="card-header bg-white p-4 border-bottom">
                        <h5 className="fw-bold mb-0 text-primary">Assign Reviewer</h5>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            <div className="col-lg-6 position-relative">
                                <label className="form-label fw-medium text-secondary small text-uppercase">Search Reviewer</label>
                                {!showSearch ? (
                                    <div 
                                            className="form-control bg-light d-flex align-items-center justify-content-between" 
                                            onClick={() => { setShowSearch(true); setSearchTerm(""); }} 
                                            style={{ cursor: "pointer" }}
                                    >
                                            <span className={selectedReviewerName ? "text-dark fw-medium" : "text-muted"}>
                                                {selectedReviewerName || "Select a reviewer..."}
                                            </span>
                                            <i className="bi bi-chevron-down small text-muted"></i>
                                    </div>
                                ) : (
                                    <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Type name or email..." 
                                            autoFocus 
                                            value={searchTerm} 
                                            onChange={(e) => setSearchTerm(e.target.value)} 
                                            onBlur={() => setTimeout(() => setShowSearch(false), 200)} 
                                    />
                                )}
                                {showSearch && (
                                <ul className="list-group position-absolute w-100 mt-1 shadow-lg border-0" style={{ maxHeight: "250px", overflowY: "auto", zIndex: 10 }}>
                                    {filteredReviewers.length > 0 ? filteredReviewers.map((r) => (
                                        <li 
                                            key={r.reviewer_id} 
                                            className="list-group-item list-group-item-action py-2 px-3" 
                                            onMouseDown={() => handleReviewerSelect(r.reviewer_id, r.name)} 
                                            style={{cursor: "pointer"}}
                                        >
                                            <div className="fw-bold text-dark">{r.name}</div>
                                            <small className="text-muted">{r.email}</small>
                                        </li>
                                    )) : (
                                        <li className="list-group-item text-muted small">No reviewers found</li>
                                    )}
                                </ul>
                                )}
                            </div>
                            <div className="col-lg-4">
                                <label className="form-label fw-medium text-secondary small text-uppercase">Due Date</label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    value={dueDate} 
                                    onChange={(e) => setDueDate(e.target.value)} 
                                />
                            </div>
                            <div className="col-lg-2 d-flex align-items-end">
                                <button onClick={handleAssign} className="btn btn-primary w-100 fw-bold">Assign Reviewer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- STATUS 2: UNDER REVIEW --- */}
            {report.status === 2 && (
                <div className="card shadow-sm border-0 rounded-4">
                    <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h5 className="fw-bold mb-0">Proposal Review</h5>
                        <div className="btn-group btn-group-sm">
                            <button className={`btn ${reviewMode === 'auto' ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={() => setReviewMode('auto')}>Reviewer&apos;s Submission</button>
                            <button className={`btn ${reviewMode === 'manual' ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={() => setReviewMode('manual')}>Manual Review / Override</button>
                        </div>
                    </div>
                    
                    <div className="card-body p-4">
                        {/* Reviewer Details */}
                        {!isReassigning && reviewMode === 'auto' && (
                            <div className="bg-light p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3 border">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-white p-2 rounded-circle shadow-sm text-primary d-flex align-items-center justify-content-center" style={{width: 45, height: 45}}>
                                            <i className="bi bi-person-badge fs-5"></i>
                                    </div>
                                    <div>
                                        <div className="small text-secondary text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>Assigned Reviewer</div>
                                        <div className="fw-bold text-dark">{currentReviewerId ? reviewerNameDisplay : "No Reviewer Assigned"}</div>
                                        <div className="small text-muted">{currentReviewerId ? reviewerEmailDisplay : "Please assign a reviewer"}</div>
                                    </div>
                                </div>
                                <button className="btn btn-outline-primary btn-sm bg-white" onClick={() => setIsReassigning(true)}>
                                    <i className="bi bi-arrow-repeat me-1"></i> {currentReviewerId ? "Change Reviewer" : "Assign Reviewer"}
                                </button>
                            </div>
                        )}
                        {/* Reassign Form */}
                        {isReassigning && ( 
                             <div className="bg-light p-4 rounded-3 mb-4 border border-primary-subtle">
                                 <div className="d-flex justify-content-between align-items-center mb-3">
                                     <h6 className="fw-bold text-primary mb-0">Re-assign Reviewer</h6>
                                     <button className="btn-close" onClick={() => setIsReassigning(false)}></button>
                                 </div>
                                 <div className="row g-3">
                                     <div className="col-lg-6 position-relative">
                                         <label className="form-label fw-medium small">Search New Reviewer</label>
                                         {!showSearch ? (
                                             <div className="form-control bg-white" onClick={() => { setShowSearch(true); setSearchTerm(""); }} style={{ cursor: "pointer" }}>
                                                 {selectedReviewerName || "Select a reviewer..."}
                                             </div>
                                         ) : (
                                             <input type="text" className="form-control" placeholder="Type to search..." autoFocus value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onBlur={() => setTimeout(() => setShowSearch(false), 200)} />
                                         )}
                                         {showSearch && (
                                             <ul className="list-group position-absolute w-100 mt-1 shadow-lg" style={{ maxHeight: "250px", overflowY: "auto", zIndex: 10 }}>
                                                 {filteredReviewers.map((r) => (
                                                     <li key={r.reviewer_id} className="list-group-item list-group-item-action" onMouseDown={() => handleReviewerSelect(r.reviewer_id, r.name)} style={{cursor: "pointer"}}>
                                                         <div className="fw-bold">{r.name}</div>
                                                         <small className="text-muted">{r.email}</small>
                                                     </li>
                                                 ))}
                                             </ul>
                                         )}
                                     </div>
                                     <div className="col-lg-4">
                                         <label className="form-label fw-medium small">New Due Date</label>
                                         <input type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                                     </div>
                                     <div className="col-lg-2 d-flex align-items-end">
                                         <button onClick={handleAssign} className="btn btn-primary w-100">Update</button>
                                     </div>
                                 </div>
                             </div>
                        )}

                        {/* Auto Review Mode */}
                        {reviewMode === 'auto' && (
                            <>
                                {hasValidReview ? (
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <h6 className="fw-bold text-dark mb-0">Reviewer Submission</h6>
                                                <span className="text-muted small">Submitted on {activeReview.submitted_at ? new Date(activeReview.submitted_at).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                            <div className="text-end">
                                                 <span className="d-block small text-uppercase fw-bold text-secondary">Total Score</span>
                                                 <span className="fs-3 fw-bold text-primary">{activeReview.total_marks}/100</span>
                                            </div>
                                        </div>

                                        {/* TABLE LAYOUT FOR GRADING */}
                                        <div className="table-responsive border rounded-3 mb-4">
                                            <table className="table table-striped align-middle mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th style={{width: '40%'}} className="ps-3 py-2 text-secondary small text-uppercase">Criteria</th>
                                                        <th style={{width: '15%'}} className="text-center text-secondary small text-uppercase">Score</th>
                                                        <th style={{width: '45%'}} className="text-secondary small text-uppercase">Specific Remarks</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(autoBreakdown).map(([key, val], i) => {
                                                        const score = typeof val === 'object' ? val.score : val;
                                                        const remark = typeof val === 'object' ? val.remark : "-";
                                                        return (
                                                            <tr key={i}>
                                                                <td className="ps-3 fw-medium text-dark">{key}</td>
                                                                <td className="text-center fw-bold text-primary">{score}/20</td>
                                                                <td className="text-muted small fst-italic">{remark || "No remark"}</td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* OVERALL FEEDBACK */}
                                        <div className="bg-light p-4 rounded-4 border border-light mb-4">
                                            <h6 className="fw-bold text-secondary text-uppercase small mb-3 border-bottom pb-2">
                                                <i className="bi bi-chat-quote-fill me-2 text-info"></i> Overall Feedback
                                            </h6>
                                            <div className="text-dark" style={{whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '0.95rem'}}>
                                                {activeReview.review_comments || "No remarks provided."}
                                            </div>
                                        </div>

                                        {/* ACTION ROW: ACCEPT / REJECT BUTTONS */}
                                        <div className="border-top pt-4 mt-2">
                                            <div className="d-flex gap-3 justify-content-end">
                                                <button 
                                                    onClick={() => handleOfficerDecision("reject")} 
                                                    className="btn btn-outline-danger px-4 py-2 fw-bold"
                                                >
                                                    <i className="bi bi-x-circle me-2"></i> Reject Report
                                                </button>
                                                <button 
                                                    onClick={() => handleOfficerDecision("accept")} 
                                                    className="btn btn-success px-4 py-2 fw-bold"
                                                >
                                                    <i className="bi bi-check-circle me-2"></i> Accept Report
                                                </button>
                                            </div>
                                            <div className="text-end mt-2">
                                                <small className="text-muted">
                                                    Accepting moves project to status 3. Rejecting moves to status 4.
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                            <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-3" style={{width: '80px', height: '80px'}}><i className="bi bi-hourglass-split fs-2 text-secondary"></i></div>
                                            <h5 className="fw-bold text-dark">Reviewer has not submitted any review</h5>
                                            <p className="text-muted mb-0">{currentReviewerId ? `Waiting for ${reviewerNameDisplay} to submit marks.` : "No reviewer is currently assigned to this project."}</p>
                                            <div className="mt-3">
                                                <span className="text-secondary small">Need to proceed immediately? </span>
                                                <button className="btn btn-link p-0 align-baseline" onClick={() => setReviewMode('manual')}>Perform Manual Review</button>
                                            </div>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {/* Manual Mode */}
                        {reviewMode === 'manual' && (
                            <div>
                                <div className="alert alert-warning border-0 small mb-4"><i className="bi bi-exclamation-triangle-fill me-2"></i><strong>Manual Override:</strong> Submitting this form will bypass the assigned reviewer.</div>
                                
                                {/* Criteria Grading */}
                                <h6 className="fw-bold text-secondary mb-3">Grading Criteria</h6>
                                <div className="table-responsive border rounded-3 mb-4">
                                    <table className="table align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{width: '40%'}} className="ps-3 py-2 text-secondary small text-uppercase">Criteria</th>
                                                <th style={{width: '15%'}} className="text-center text-secondary small text-uppercase">Score</th>
                                                <th style={{width: '45%'}} className="text-secondary small text-uppercase">Specific Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {criteria.length > 0 ? criteria.map((c, i) => (
                                                <tr key={i}>
                                                    <td className="ps-3">{c.label} <span className="text-muted small">({c.marks})</span></td>
                                                    <td className="text-center">
                                                        <div className="input-group input-group-sm">
                                                            <input 
                                                                type="number" 
                                                                className="form-control text-center fw-bold"
                                                                min="0"
                                                                max={c.marks}
                                                                value={manualMarksBreakdown[c.label] || ""}
                                                                onChange={(e) => handleManualMarkChange(c.label, c.marks, e.target.value)}
                                                            />
                                                            <span className="input-group-text">/ {c.marks}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="text" 
                                                            className="form-control form-control-sm"
                                                            placeholder="Add specific remarks..."
                                                            value={manualRemarksBreakdown[c.label] || ""}
                                                            onChange={(e) => handleManualRemarkChange(c.label, e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="3" className="text-muted text-center py-3">No criteria loaded.</td></tr>
                                            )}
                                            {/* Total */}
                                            <tr className="table-light fw-bold border-top-2">
                                                <td className="ps-3 text-end text-uppercase">Total Score:</td>
                                                <td className="text-center text-primary fs-5">
                                                    {Object.values(manualMarksBreakdown).reduce((sum, v) => sum + (v || 0), 0)} / 100
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Manual Feedback & Decision */}
                                <div className="row g-4">
                                    <div className="col-lg-12">
                                        <div className="bg-light p-4 rounded-4 border border-light">
                                            <h6 className="fw-bold text-secondary text-uppercase small mb-3">
                                                <i className="bi bi-chat-quote-fill me-2 text-info"></i> Overall Feedback
                                            </h6>
                                            <textarea 
                                                className="form-control" 
                                                rows="4" 
                                                value={manualComments} 
                                                onChange={(e) => setManualComments(e.target.value)} 
                                                placeholder="Enter overall manual feedback..."
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <label className="form-label fw-medium">Decision</label>
                                        <select className="form-select" value={decision} onChange={(e) => setDecision(e.target.value)}>
                                            <option value="">Select Decision...</option>
                                            <option value="3">Accept Report</option>
                                            <option value="4">Reject Report</option>
                                        </select>
                                    </div>
                                    <div className="col-12 text-end">
                                        <button onClick={handleManualSubmit} className="btn btn-success px-5 fw-bold">Submit Manual Review</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- STATUS 3: ACCEPTED (SHOW COMPLETE BUTTON) --- */}
            {report.status === 3 && (
                <div className="d-flex flex-column gap-4">
                    {/* Success Banner */}
                    <div className="card border-0 shadow-sm rounded-4 bg-success text-white overflow-hidden">
                        <div className="card-body p-4 text-center d-flex align-items-center justify-content-center gap-3">
                            <div className="bg-white text-success rounded-circle d-flex p-2 shadow-sm">
                                <i className="bi bi-check-lg fs-3"></i>
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0">Report Accepted</h3>
                                <p className="text-white-50 mb-0 small">This report has been approved. You can now finalize the project status.</p>
                            </div>
                        </div>
                    </div>

                    {/* Review Details Card */}
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-header bg-white p-3 border-bottom">
                            <h5 className="fw-bold mb-0 text-dark">Final Evaluation Details</h5>
                        </div>
                        <div className="card-body p-4">
                             {/* Reviewer Info */}
                            <div className="d-flex align-items-center justify-content-between mb-4 p-3 bg-light rounded-3 border">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-white p-2 rounded-circle shadow-sm text-primary d-flex align-items-center justify-content-center" style={{width: 45, height: 45}}>
                                            <i className="bi bi-person-badge fs-5"></i>
                                    </div>
                                    <div>
                                        <div className="small text-secondary text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>Evaluated By</div>
                                        <div className="fw-bold text-dark">{reviewerNameDisplay}</div>
                                    </div>
                                </div>
                                <div className="text-end">
                                     <div className="small text-secondary text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>Total Score</div>
                                     <div className="fs-3 fw-bold text-primary">{activeReview?.total_marks || "N/A"}/100</div>
                                </div>
                            </div>

                            {/* GRADING TABLE */}
                            <div className="table-responsive border rounded-3 mb-4">
                                <table className="table table-striped align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{width: '40%'}} className="ps-3 py-2 text-secondary small text-uppercase">Criteria</th>
                                            <th style={{width: '15%'}} className="text-center text-secondary small text-uppercase">Score</th>
                                            <th style={{width: '45%'}} className="text-secondary small text-uppercase">Specific Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeReview?.marks_breakdown && Object.entries(parseBreakdown(activeReview.marks_breakdown)).map(([key, val], i) => {
                                            const score = typeof val === 'object' ? val.score : val;
                                            const remark = typeof val === 'object' ? val.remark : "-";
                                            return (
                                                <tr key={i}>
                                                    <td className="ps-3 fw-medium text-dark">{key}</td>
                                                    <td className="text-center fw-bold text-primary">{score}/20</td>
                                                    <td className="text-muted small fst-italic">{remark || "No remark"}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* OVERALL FEEDBACK */}
                            <div className="bg-light p-4 rounded-4 border border-light">
                                <h6 className="fw-bold text-secondary text-uppercase small mb-3 border-bottom pb-2">
                                    <i className="bi bi-chat-quote-fill me-2 text-info"></i> Overall Feedback
                                </h6>
                                <div className="text-dark" style={{whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '0.95rem'}}>
                                    {activeReview?.review_comments || "No remarks provided."}
                                </div>
                            </div>
                            
                            {/* MARK AS COMPLETED BUTTON (Only for Accepted Final Reports) */}
                            {report.type === "final_report" && report.project_status !== 5 && (
                                <div className="border-top pt-4 mt-4">
                                     <button
                                        className="btn btn-success w-100 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                        onClick={handleCompleteProject}
                                    >
                                        <i className="bi bi-flag-fill me-2"></i> Mark Project as Completed
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {/* --- STATUS 4: REJECTED --- */}
            {report.status === 4 && (
                <div className="d-flex flex-column gap-4">
                    <div className="card border-0 shadow-sm rounded-4 bg-danger text-white overflow-hidden">
                        <div className="card-body p-4 text-center d-flex align-items-center justify-content-center gap-3">
                            <div className="bg-white text-danger rounded-circle d-flex p-2 shadow-sm"><i className="bi bi-x-lg fs-3"></i></div>
                            <div>
                                <h3 className="fw-bold mb-0">Report Rejected</h3>
                                <p className="text-white-50 mb-0 small">This report has been rejected. The researcher may need to resubmit.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
          </div>
      </div>
    </div>
  );
}