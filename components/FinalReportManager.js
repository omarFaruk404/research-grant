"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReportDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // --- DATA STATE ---
  const [report, setReport] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [criteria, setCriteria] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // --- UI STATE ---
  const [reviewMode, setReviewMode] = useState('auto'); // 'auto' | 'manual'
  const [isReassigning, setIsReassigning] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false); 
  
  // Search State
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReviewers, setFilteredReviewers] = useState([]);

  // Assignment Form State
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [selectedReviewerName, setSelectedReviewerName] = useState("");
  const [dueDate, setDueDate] = useState("");

  // ✅ NEW: Invite Reviewer State
  const [isInviting, setIsInviting] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  
  // Manual Review State
  const [manualMarksBreakdown, setManualMarksBreakdown] = useState({});
  const [manualRemarksBreakdown, setManualRemarksBreakdown] = useState({});
  const [manualComments, setManualComments] = useState("");
  const [decision, setDecision] = useState(""); 

  // --- DERIVED HELPERS ---
  const activeReview = reviews.length > 0 ? reviews[0] : null;
  const currentReviewerId = activeReview?.reviewer_id;
  const assignedReviewer = reviewers.find(r => String(r.reviewer_id) === String(currentReviewerId));
  
  const reviewerNameDisplay = assignedReviewer?.name || activeReview?.reviewer_name || "Unknown Reviewer";
  const reviewerEmailDisplay = assignedReviewer?.email || "N/A";
  
  const hasValidReview = activeReview && (activeReview.total_marks !== null && activeReview.total_marks !== undefined);

  // Helper to parse breakdown JSON safely
  const parseBreakdown = (jsonString) => {
    try {
        return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString || {};
    } catch (e) {
        return {};
    }
  };

  const autoBreakdown = parseBreakdown(activeReview?.marks_breakdown);

  // --- EFFECTS ---

  useEffect(() => {
    const stored = localStorage.getItem("user");
    try {
        const u = JSON.parse(stored);
        if(u) setUser(u);
    } catch {}
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [repRes, revRes, critRes] = await Promise.all([
            fetch(`/api/officer/reports/${id}`),
            fetch("/api/reviewers"),
            fetch("/api/remarks")
        ]);
        
        const repData = await repRes.json();
        const revData = await revRes.json();
        const critData = await critRes.json(); 
        
        const reportType = repData.report.type; 
        const relevantCriteria = reportType === 'final_report' 
            ? critData.final_report_criteria 
            : critData.proposal_criteria;

        setReport(repData.report);
        setReviews(repData.reviews || []);
        setReviewers(revData);
        setFilteredReviewers(revData);
        setCriteria(relevantCriteria || []);

        if (repData.report.status === 2 && (!repData.reviews || repData.reviews.length === 0)) {
            setReviewMode("manual");
        }

      } catch (e) { 
        console.error(e); 
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  useEffect(() => {
    if (!searchTerm) {
        setFilteredReviewers(reviewers);
    } else {
        const lower = searchTerm.toLowerCase();
        setFilteredReviewers(reviewers.filter(r => 
            r.name.toLowerCase().includes(lower) || 
            r.email.toLowerCase().includes(lower)
        ));
    }
  }, [searchTerm, reviewers]);


  // --- HANDLERS ---

  const handleReviewerSelect = (rId, rName) => {
    setSelectedReviewerId(rId);
    setSelectedReviewerName(rName);
    setShowSearch(false);
  };

  const handleAssign = async () => {
    if (!dueDate) return alert("Please select a due date.");

    if (isInviting) {
        if (!inviteName || !inviteEmail) return alert("Please enter Name and Email for the new reviewer.");
    } else {
        if (!selectedReviewerId) return alert("Please select a reviewer from the list.");
    }

    const endpoint = isReassigning || reviews.length > 0
      ? `/api/officer/reports/${id}/reassign-reviewer`
      : `/api/officer/reports/${id}/assign-reviewer`;

    const payload = {
        assigned_by: user?.user_id || 1, 
        due_date: dueDate,
    };

    // Attach data based on mode
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

      if (res.ok) {
        alert(isInviting 
            ? "Invitation sent and reviewer assigned successfully!" 
            : (isReassigning ? "Reviewer reassigned successfully!" : "Reviewer assigned successfully!"));
        location.reload();
      } else {
        alert("Error: " + (data.error || "Failed to assign"));
      }
    } catch (error) {
      alert("Network error.");
    }
  };

  const handleSendReminder = async () => {
    if (!currentReviewerId) return;
    if (!report?.project_id) {
        alert("Project ID missing. Cannot send reminder.");
        return;
    }

    if (!confirm(`Send an email reminder to ${reviewerNameDisplay} regarding this report?`)) return;

    setSendingReminder(true);
    try {
      const res = await fetch("/api/officer/reminders/reviewer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer_id: currentReviewerId,
          project_id: report.project_id, 
          review_type: 2 // 2 for Final Report
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Email reminder sent successfully!");
      } else {
        alert("❌ Failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error sending reminder.");
    } finally {
      setSendingReminder(false);
    }
  };

  const handleDeleteReview = async () => {
      if(!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;
      try {
        alert("Delete functionality requires backend implementation.");
      } catch (e) { alert("Error"); }
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

  const handleManualSubmit = async () => {
    if (!decision) return alert("Please select a decision.");
    
    const manualTotalMarks = Object.values(manualMarksBreakdown).reduce((sum, v) => sum + (v || 0), 0);

    const breakdownToSave = {};
    criteria.forEach(c => {
        breakdownToSave[c.label] = {
            score: manualMarksBreakdown[c.label] || 0,
            remark: manualRemarksBreakdown[c.label] || ""
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
          total_marks: manualTotalMarks,
          decision: decisionStr,
          marks_breakdown: breakdownToSave 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Manual review submitted successfully.");
        location.reload();
      } else {
        alert("Error: " + (data.error || "Failed to submit manual review"));
      }
    } catch (error) {
      alert("Network error during manual submission.");
    }
  };

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
      alert("Network error during decision update.");
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
                        <input type="text" className="form-control" placeholder="Type to search..." autoFocus value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
            <button onClick={handleAssign} className="btn btn-primary w-100">
                {isReassigning ? "Update" : (isInviting ? "Invite & Assign" : "Assign")}
            </button>
        </div>
    </div>
  );

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

  if (loading) return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (!report) return <div className="p-5 text-center text-danger">Report not found</div>;

  return (
    <div className="container-fluid px-4 mt-5 mb-5">
      
      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
            <div className="d-flex align-items-center gap-3">
                <h3 className="fw-bold mb-0 text-dark">Report Details</h3>
                <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(report.status)}`}>
                    {getStatusText(report.status)}
                </span>
            </div>
            <p className="text-muted mb-0 mt-1">Manage reviewers and final grading for <span className="fw-bold">{report.title}</span>.</p>
        </div>
      </div>

      <div className="row">
          <div className="col-12">
            
            {/* --- STATUS 1: ASSIGN REVIEWER --- */}
            {report.status === 1 && (
                <div className="card shadow-sm border-0 rounded-4">
                    <div className="card-header bg-white p-4 border-bottom">
                        <h5 className="fw-bold mb-0">Assign Reviewer</h5>
                    </div>
                    <div className="card-body p-4">
                        <SearchReviewerUI />
                    </div>
                </div>
            )}

            {/* --- STATUS 2: UNDER REVIEW --- */}
            {report.status === 2 && (
                <div className="card shadow-sm border-0 rounded-4">
                    <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h5 className="fw-bold mb-0">Report Review</h5>
                        <div className="btn-group btn-group-sm">
                            <button 
                                className={`btn ${reviewMode === 'auto' ? 'btn-dark' : 'btn-outline-secondary'}`} 
                                onClick={() => setReviewMode('auto')}
                            >
                                Reviewer&apos;s Submission
                            </button>
                            <button 
                                className={`btn ${reviewMode === 'manual' ? 'btn-dark' : 'btn-outline-secondary'}`} 
                                onClick={() => setReviewMode('manual')}
                            >
                                Manual Review / Override
                            </button>
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
                                
                                {/* ✅ BUTTONS: SEND REMINDER & CHANGE REVIEWER */}
                                <div className="d-flex gap-2">
                                    {currentReviewerId && (
                                        <button 
                                            className="btn btn-warning btn-sm fw-bold text-dark border-0 shadow-sm"
                                            onClick={handleSendReminder}
                                            disabled={sendingReminder}
                                        >
                                            {sendingReminder ? (
                                                <><span className="spinner-border spinner-border-sm me-1"></span> Sending...</>
                                            ) : (
                                                <><i className="bi bi-bell-fill me-1"></i> Send Reminder</>
                                            )}
                                        </button>
                                    )}
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
                                                <span className="text-muted small">Submitted on {activeReview.submitted_at ? new Date(activeReview.submitted_at).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
                                                <button className="btn btn-sm btn-outline-danger border-0" onClick={handleDeleteReview} title="Delete this review">
                                                    <i className="bi bi-trash me-1"></i> Delete
                                                </button>
                                                <div className="text-end">
                                                    <span className="d-block small text-uppercase fw-bold text-secondary">Total Score</span>
                                                    <span className="fs-3 fw-bold text-primary">{activeReview.total_marks}/100</span>
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
                                                {activeReview.review_comments || "No remarks provided."}
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
                                                <tr><td colSpan="3" className="text-muted text-center py-3">No criteria loaded.</td></tr>
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
                                            <option value="4">Reject Project</option>
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

            {/* --- STATUS 3: ACCEPTED --- */}
            {report.status === 3 && (
                <div className="card border-0 shadow-sm rounded-4 bg-success text-white overflow-hidden">
                    <div className="card-body p-5 text-center">
                        <div className="bg-white text-success rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                             <i className="bi bi-check-lg fs-1"></i>
                        </div>
                        <h2 className="fw-bold mb-2">Project Accepted</h2>
                        <p className="text-white-50 mb-4 fs-5">
                            This project has been approved and moved to the ongoing stage.
                        </p>
                        {report.type === "final_report" && report.project_status !== 5 && (
                             <button
                                className="btn btn-light text-success fw-bold px-5 py-3 shadow"
                                onClick={async () => {
                                    if (!confirm("Are you sure you want to mark this project as completed?")) return;
                                    try {
                                        const res = await fetch(`/api/officer/reports/${id}/mark-complete`, { method: "PUT" });
                                        const data = await res.json();
                                        if (data.success) {
                                            alert("✅ Project marked as completed!");
                                            location.reload();
                                        } else {
                                            alert(data.error || "Failed.");
                                        }
                                    } catch (err) { alert("Error marking completed."); }
                                }}
                            >
                                <i className="bi bi-flag-fill me-2"></i> Mark Project as Completed
                            </button>
                        )}
                    </div>
                </div>
            )}
            
          </div>
      </div>
    </div>
  );
}