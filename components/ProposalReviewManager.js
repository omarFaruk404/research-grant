"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProposalReviewManager({ 
  projectId, 
  projectStatus, 
  projectReviewerId, 
  proposalReview, 
  reviewers, 
  user, 
  onRefresh 
}) {
  const router = useRouter();
  
  // --- LOCAL STATE ---
  const [filteredReviewers, setFilteredReviewers] = useState(reviewers);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Assignment State
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [selectedReviewerName, setSelectedReviewerName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isReassigning, setIsReassigning] = useState(false);

  // Invite New Reviewer State
  const [isInviting, setIsInviting] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  // Manual Review State
  const [criteria, setCriteria] = useState([]); 
  const [manualMarksBreakdown, setManualMarksBreakdown] = useState({});
  const [manualRemarksBreakdown, setManualRemarksBreakdown] = useState({});
  const [manualComments, setManualComments] = useState("");
  const [decision, setDecision] = useState("");
  const [reviewMode, setReviewMode] = useState("auto"); 

  // --- DERIVED HELPERS ---
  const currentReviewerId = projectReviewerId || proposalReview?.reviewer_id;
  const assignedReviewer = reviewers.find(r => String(r.reviewer_id) === String(currentReviewerId));
  const reviewerNameDisplay = assignedReviewer?.name || proposalReview?.reviewer_name || "Unknown Reviewer";
  const reviewerEmailDisplay = assignedReviewer?.email || "Email not available";
  const hasValidReview = proposalReview && (proposalReview.total_marks !== null && proposalReview.total_marks !== undefined);

  // Helper to parse breakdown JSON safely
  const parseBreakdown = (jsonString) => {
    try {
        return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString || {};
    } catch (e) {
        return {};
    }
  };

  const autoBreakdown = parseBreakdown(proposalReview?.marks_breakdown);

  // --- EFFECTS ---

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/officer/review-settings");
        const data = await res.json();
        if (data.proposal_criteria) {
          setCriteria(data.proposal_criteria);
        }
      } catch (error) {
        console.error("Failed to load criteria", error);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    setFilteredReviewers(reviewers);
  }, [reviewers]);

  useEffect(() => {
    if (projectStatus === 2 && !currentReviewerId) {
        setReviewMode("manual");
    }
  }, [projectStatus, currentReviewerId]);

  // --- HANDLERS ---

  const handleSearch = (e) => {
    const v = e.target.value.toLowerCase();
    setSearchTerm(v);
    setFilteredReviewers(
      reviewers.filter((r) => r.name.toLowerCase().includes(v) || r.email.toLowerCase().includes(v))
    );
  };

  const handleReviewerSelect = (rId, rName) => {
    setSelectedReviewerId(rId);
    setSelectedReviewerName(rName);
    setShowSearch(false);
  };

  const assignReviewer = async () => {
    // Validation
    if (!dueDate) return alert("Please select a due date.");
    
    if (isInviting) {
        if (!inviteName || !inviteEmail) return alert("Please enter Name and Email for the new reviewer.");
    } else {
        if (!selectedReviewerId) return alert("Please select a reviewer from the list.");
    }
    
    const isReassignment = !!currentReviewerId;
    const endpoint = isReassignment 
      ? `/api/officer/projects/${projectId}/reassign-reviewer`
      : `/api/officer/projects/${projectId}/assign-reviewer`;

    const payload = {
        due_date: dueDate,
        review_type: 1, 
        assigned_by: user.user_id,
    };

    // Attach data based on mode (Existing vs Invite)
    if (isInviting) {
        payload.new_reviewer_name = inviteName;
        payload.new_reviewer_email = inviteEmail;
        payload.is_invite = true;
    } else {
        payload.reviewer_id = selectedReviewerId;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();

      if(res.ok) {
          alert(isInviting 
            ? "Invitation sent and reviewer assigned successfully!" 
            : "Reviewer assigned successfully!");
          setIsReassigning(false);
          // Reset Invite State
          setIsInviting(false);
          setInviteName("");
          setInviteEmail("");
          onRefresh();
      } else {
          alert("Failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("Error assigning reviewer");
    }
  };

  const deleteReview = async () => {
    if(!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;
    try {
        const res = await fetch(`/api/officer/projects/${projectId}/delete-review`, { method: "DELETE" });
        if (res.ok) {
            alert("Review deleted successfully.");
            onRefresh();
        } else {
            alert("Failed to delete review.");
        }
    } catch (error) {
        alert("Error deleting review.");
    }
  };

  // --- MANUAL REVIEW HANDLERS ---
  const handleManualScoreChange = (label, max, val) => {
      const v = val === "" ? "" : parseFloat(val);
      if (v > max) return alert(`Max marks for ${label} is ${max}`);
      setManualMarksBreakdown(prev => ({ ...prev, [label]: v }));
  };

  const handleManualRemarkChange = (label, val) => {
      setManualRemarksBreakdown(prev => ({ ...prev, [label]: val }));
  };

  const submitManualReview = async () => {
    if (!decision) return alert("Please select a decision.");
    
    const totalMarks = Object.values(manualMarksBreakdown).reduce((sum, v) => sum + (v || 0), 0);

    const breakdownToSave = {};
    criteria.forEach(c => {
        breakdownToSave[c.label] = {
            score: manualMarksBreakdown[c.label] || 0,
            remark: manualRemarksBreakdown[c.label] || ""
        };
    });

    try {
      const res = await fetch(`/api/officer/projects/${projectId}/manual-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_marks: totalMarks,
          marks_breakdown: breakdownToSave,
          review_comments: manualComments,
          review_type: 1,
          reviewer_id: user.user_id, 
          status: Number(decision), 
        }),
      });

      if(res.ok) {
          alert("Manual review submitted successfully.");
          onRefresh();
      } else {
          alert("Failed to submit review.");
      }
    } catch (error) {
      alert("Error submitting review");
    }
  };

  const handleOfficerDecision = async (dec) => {
    if (!confirm(`Are you sure you want to ${dec} this project?`)) return;
    try {
      const res = await fetch(`/api/officer/projects/${projectId}/decide-proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: dec }),
      });
      if (res.ok) {
        alert(`Project ${dec}ed successfully.`);
        onRefresh();
      }
    } catch (error) {
      alert("Action failed.");
    }
  };

  // --- RENDER HELPERS ---

  const SearchReviewerUI = () => (
    <div className="row g-3">
        <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-medium mb-0">
                    {isInviting ? "Invite New Reviewer" : "Select Existing Reviewer"}
                </label>
                <button 
                    className="btn btn-sm btn-link text-decoration-none"
                    onClick={() => { setIsInviting(!isInviting); setSelectedReviewerId(""); setShowSearch(false); }}
                >
                    {isInviting ? "Select Existing Instead" : "Reviewer not found? Invite New"}
                </button>
            </div>

            {isInviting ? (
                // --- INVITE FORM ---
                <div className="row g-2">
                    <div className="col-md-6">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Full Name (e.g. Dr. Reviewer)" 
                            value={inviteName} 
                            onChange={(e) => setInviteName(e.target.value)} 
                        />
                    </div>
                    <div className="col-md-6">
                        <input 
                            type="email" 
                            className="form-control" 
                            placeholder="Email Address" 
                            value={inviteEmail} 
                            onChange={(e) => setInviteEmail(e.target.value)} 
                        />
                    </div>
                    <div className="col-12">
                        <small className="text-muted fst-italic">
                            * An invitation email will be sent to this user to create an account.
                        </small>
                    </div>
                </div>
            ) : (
                // --- SEARCH DROPDOWN ---
                <div className="position-relative">
                    {!showSearch ? (
                        <div className="form-control bg-white" onClick={() => { setShowSearch(true); setSearchTerm(""); }} style={{ cursor: "pointer" }}>
                            {selectedReviewerName || "Select a reviewer..."}
                        </div>
                    ) : (
                        <input type="text" className="form-control" placeholder="Type to search..." autoFocus value={searchTerm} onChange={handleSearch} />
                    )}
                    {showSearch && (
                        <ul className="list-group position-absolute w-100 mt-1 shadow-lg" style={{ maxHeight: "250px", overflowY: "auto", zIndex: 10 }}>
                            {filteredReviewers.map((r) => (
                                <li key={r.reviewer_id} className="list-group-item list-group-item-action" onClick={() => handleReviewerSelect(r.reviewer_id, r.name)} style={{cursor: "pointer"}}>
                                    <div className="fw-bold">{r.name}</div>
                                    <small className="text-muted">{r.email}</small>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>

        <div className="col-lg-8">
            <label className="form-label fw-medium">Due Date</label>
            <input type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="col-lg-4 d-flex align-items-end">
            <button onClick={assignReviewer} className="btn btn-primary w-100">
                {isReassigning ? "Update" : (isInviting ? "Invite & Assign" : "Assign")}
            </button>
        </div>
    </div>
  );

  // --- MAIN RENDER ---

  if (projectStatus === 1) {
    return (
        <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white p-4 border-bottom">
                <h5 className="fw-bold mb-0">Assign Reviewer</h5>
            </div>
            <div className="card-body p-4">
                <SearchReviewerUI />
            </div>
        </div>
    );
  }

  // STATUS 2: UNDER REVIEW (Review/Decide)
  if (projectStatus === 2) {
    return (
        <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 className="fw-bold mb-0">Proposal Review</h5>
                <div className="btn-group btn-group-sm">
                    <button className={`btn ${reviewMode === 'auto' ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={() => setReviewMode('auto')}>Reviewer&apos;s Submission</button>
                    <button className={`btn ${reviewMode === 'manual' ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={() => setReviewMode('manual')}>Manual Review / Override</button>
                </div>
            </div>
            
            <div className="card-body p-4">
                {/* 1. Reviewer Details & Reassign Toggle */}
                {!isReassigning && (
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
                        
                        {/* ✅ BUTTONS: CHANGE REVIEWER (Reminder removed) */}
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-primary btn-sm bg-white" onClick={() => setIsReassigning(true)}>
                                <i className="bi bi-arrow-repeat me-1"></i> {currentReviewerId ? "Change" : "Assign"}
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. Reassign Form */}
                {isReassigning && (
                    <div className="bg-light p-4 rounded-3 mb-4 border border-primary-subtle">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold text-primary mb-0">Re-assign Reviewer</h6>
                            <button className="btn-close" onClick={() => setIsReassigning(false)}></button>
                        </div>
                        <SearchReviewerUI />
                    </div>
                )}
                
                {/* 3. Auto Review Mode */}
                {reviewMode === 'auto' && (
                    <>
                        {hasValidReview ? (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h6 className="fw-bold text-dark mb-0">Reviewer Submission</h6>
                                        <span className="text-muted small">Submitted on {proposalReview.submitted_at ? new Date(proposalReview.submitted_at).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <button className="btn btn-sm btn-outline-danger border-0" onClick={deleteReview} title="Delete this review">
                                            <i className="bi bi-trash me-1"></i> Delete
                                        </button>
                                        <div className="text-end">
                                            <span className="d-block small text-uppercase fw-bold text-secondary">Total Score</span>
                                            <span className="fs-3 fw-bold text-primary">{proposalReview.total_marks}/100</span>
                                        </div>
                                    </div>
                                </div>

                                {/* TABLE: Reviewer Grading */}
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
                                            {criteria.length > 0 ? criteria.map((c, i) => {
                                                const item = autoBreakdown ? autoBreakdown[c.label] : null;
                                                const score = item ? (typeof item === 'object' ? item.score : item) : "-";
                                                const remark = item ? (typeof item === 'object' ? item.remark : "-") : "-";

                                                return (
                                                    <tr key={i}>
                                                        <td className="ps-3 fw-medium text-dark">{c.label}</td>
                                                        <td className="text-center fw-bold text-primary">{score}/{c.marks}</td>
                                                        <td className="text-muted small fst-italic">{remark}</td>
                                                    </tr>
                                                )
                                            }) : (
                                                <tr><td colSpan="3" className="text-center py-3 text-muted">No criteria loaded via API.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Overall Feedback */}
                                <div className="bg-light p-4 rounded-4 border border-light mb-4">
                                    <h6 className="fw-bold text-secondary text-uppercase small mb-3 border-bottom pb-2">
                                        <i className="bi bi-chat-quote-fill me-2 text-info"></i> Overall Feedback
                                    </h6>
                                    <div className="text-dark" style={{whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '0.95rem'}}>
                                        {proposalReview.review_comments || "No remarks provided."}
                                    </div>
                                </div>

                                {/* Decision Actions */}
                                <div className="border-top pt-4 mt-2">
                                    <div className="d-flex gap-3 justify-content-end">
                                        <button onClick={() => handleOfficerDecision("reject")} className="btn btn-outline-danger px-4 py-2 fw-bold">
                                            <i className="bi bi-x-circle me-2"></i> Reject Project
                                        </button>
                                        <button onClick={() => handleOfficerDecision("accept")} className="btn btn-success px-4 py-2 fw-bold">
                                            <i className="bi bi-check-circle me-2"></i> Accept Project
                                        </button>
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

                {/* 4. Manual Review Mode */}
                {reviewMode === 'manual' && (
                    <div>
                        <div className="alert alert-warning border-0 small mb-4"><i className="bi bi-exclamation-triangle-fill me-2"></i><strong>Manual Override:</strong> Submitting this form will bypass the assigned reviewer.</div>
                        
                        {/* Manual Grading Table */}
                        <div className="table-responsive border rounded-3 mb-4">
                            <table className="table align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{width: '40%'}} className="ps-3">Criteria</th>
                                        <th style={{width: '20%'}} className="text-center">Score</th>
                                        <th style={{width: '40%'}}>Specific Remarks</th>
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
                                                        onChange={(e) => handleManualScoreChange(c.label, c.marks, e.target.value)}
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
                                        <tr><td colSpan="3" className="text-muted text-center py-3">No criteria loaded. Please check review settings.</td></tr>
                                    )}
                                    <tr className="table-light fw-bold">
                                        <td className="text-end">Total Score:</td>
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
                                <label className="form-label fw-medium">Overall Feedback</label>
                                <textarea className="form-control" rows="4" value={manualComments} onChange={(e) => setManualComments(e.target.value)} placeholder="Enter overall manual feedback..."></textarea>
                            </div>
                            <div className="col-lg-6">
                                <label className="form-label fw-medium">Decision</label>
                                <select className="form-select" value={decision} onChange={(e) => setDecision(e.target.value)}>
                                    <option value="">Select Decision...</option>
                                    <option value="3">Accept Project</option>
                                    <option value="0">Reject Project</option>
                                </select>
                            </div>
                            <div className="col-12 text-end">
                                <button onClick={submitManualReview} className="btn btn-success px-5 fw-bold">Submit Manual Review</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  }

  // Fallback
  return null;
}