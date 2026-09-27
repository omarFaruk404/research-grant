"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProposalReviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Criteria: Array of objects { id, label, marks }
  const [criteria, setCriteria] = useState([]);
  
  // State for Grading
  const [marksBreakdown, setMarksBreakdown] = useState({}); // { "Methodology": 15 }
  const [criteriaRemarks, setCriteriaRemarks] = useState({}); // { "Methodology": "Good" }
  const [totalMarks, setTotalMarks] = useState(0);
  const [comments, setComments] = useState(""); 
  
  // UI State
  const [showAbstract, setShowAbstract] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch both Proposal and Settings in parallel
        const [proposalRes, settingsRes] = await Promise.all([
            fetch(`/api/reviewer/proposal/${id}`),
            fetch(`/api/officer/review-settings`) 
        ]);

        const proposalData = await proposalRes.json();
        const settingsData = await settingsRes.json();
        
        // 2. Determine Criteria List
        // We use a local variable because setCriteria is async and we need the list immediately below
        const criteriaList = settingsData.proposal_criteria || [];
        setCriteria(criteriaList);

        // 3. Process Proposal Data
        if (proposalData.proposal) {
          setProposal(proposalData.proposal);
          
          if (proposalData.proposal.review_status === "submitted") {
             setTotalMarks(proposalData.proposal.total_marks);
             setComments(proposalData.proposal.review_comments || ""); 
             
             try {
                // Parse the stored JSON from DB
                const rawBreakdown = typeof proposalData.proposal.marks_breakdown === 'string' 
                    ? JSON.parse(proposalData.proposal.marks_breakdown) 
                    : proposalData.proposal.marks_breakdown;

                // --- ROBUST SPLIT LOGIC ---
                const loadedMarks = {};
                const loadedRemarks = {};

                // Iterate through the ACTUAL CRITERIA list to ensure every field is initialized
                criteriaList.forEach(c => {
                    const label = c.label;
                    const savedItem = rawBreakdown ? rawBreakdown[label] : null;

                    if (savedItem) {
                        // Check if it's the NEW object format { score, remark }
                        if (typeof savedItem === 'object' && savedItem !== null) {
                            loadedMarks[label] = savedItem.score;
                            loadedRemarks[label] = savedItem.remark || ""; 
                        } 
                        // Check if it's the OLD number format
                        else {
                            loadedMarks[label] = savedItem; 
                            loadedRemarks[label] = ""; // Initialize empty remark for old data
                        }
                    } else {
                        // If no data saved for this criteria (e.g. new criteria added since review)
                        loadedMarks[label] = ""; 
                        loadedRemarks[label] = "";
                    }
                });

                setMarksBreakdown(loadedMarks);
                setCriteriaRemarks(loadedRemarks);

             } catch (e) {
                console.error("Error parsing breakdown", e);
             }
          } else {
              // Not submitted yet? Initialize empty states for all criteria
              const initialMarks = {};
              const initialRemarks = {};
              criteriaList.forEach(c => {
                  initialMarks[c.label] = "";
                  initialRemarks[c.label] = "";
              });
              setMarksBreakdown(initialMarks);
              setCriteriaRemarks(initialRemarks);
          }
        }

      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // --- HANDLERS ---

  // 1. Update Score
  const handleMarkChange = (criterionLabel, maxMarks, value) => {
    const val = value === "" ? "" : parseFloat(value);
    
    // Validation
    if (val > maxMarks) return alert(`Max ${maxMarks} marks allowed for this criterion.`);
    if (val < 0) return;

    const newBreakdown = { ...marksBreakdown, [criterionLabel]: val };
    setMarksBreakdown(newBreakdown);
    
    // Recalculate Total Score
    const total = Object.values(newBreakdown).reduce((sum, v) => sum + (v || 0), 0);
    setTotalMarks(total);
  };

  // 2. Update Specific Remark
  const handleRemarkChange = (criterionLabel, value) => {
    // Standard React state update for text input
    setCriteriaRemarks(prev => ({ 
        ...prev, 
        [criterionLabel]: value 
    }));
  };

  // 3. Submit Review
  const submitReview = async () => {
    // Validation: Check if all criteria have marks
    const missing = criteria.filter(c => marksBreakdown[c.label] === undefined || marksBreakdown[c.label] === "");
    if (missing.length > 0) return alert(`Please grade all criteria.`);
    
    if (!comments.trim()) return alert("Please enter final review summary/comments.");

    const confirmMsg = isEditing 
        ? "Are you sure you want to update this evaluation?" 
        : "Are you sure you want to submit this evaluation? This action cannot be undone once the project moves to 'Ongoing'.";

    if (!confirm(confirmMsg)) return;

    // --- MERGE LOGIC: Combine Score & Remark ---
    const combinedBreakdown = {};
    criteria.forEach((c) => {
        combinedBreakdown[c.label] = {
            score: marksBreakdown[c.label], // Ensure this is the number
            remark: criteriaRemarks[c.label] || "" // Ensure this string exists
        };
    });

    const res = await fetch(
      `/api/reviewer/proposal/${id}/submit-review`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_marks: totalMarks,
          marks_breakdown: combinedBreakdown, // Send the nested object
          review_comments: comments, 
        }),
      }
    );

    if (res.ok) {
      alert(isEditing ? "✅ Review updated successfully" : "✅ Review submitted successfully");
      location.reload();
    } else {
      alert("Failed to submit review");
    }
  };

  // Helper: Calculate Max Possible Score dynamically
  const maxPossibleScore = criteria.reduce((sum, c) => sum + (parseFloat(c.marks) || 0), 0);

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;
  if (!proposal) return <div className="alert alert-danger m-5">Proposal not found</div>;

  // --- PERMISSIONS LOGIC ---
  const isSubmitted = proposal.review_status === "submitted";
  const isProjectLocked = proposal.project_status >= 3; 
  const isReadOnly = isSubmitted && !isEditing;

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* 0. Back Button */}
      <div className="row mb-3">
        <div className="col-12">
          <button 
            onClick={() => router.back()} 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3 fw-medium bg-white"
          >
            <i className="bi bi-arrow-left"></i> Back to List
          </button>
        </div>
      </div>

      {/* 1. Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-4 rounded-4 shadow-sm">
        <div>
            <h6 className="text-uppercase text-secondary fw-bold small mb-1">Project Evaluation</h6>
            <h2 className="fw-bold text-dark mb-0">{proposal.title}</h2>
        </div>
        <div className="text-end d-flex flex-column align-items-end">
            <div className="d-flex align-items-center gap-2">
                {isSubmitted && !isProjectLocked && !isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="btn btn-outline-primary btn-sm fw-bold px-3 rounded-pill"
                    >
                        <i className="bi bi-pencil-square me-1"></i> Edit Evaluation
                    </button>
                )}

                {isEditing && (
                    <button 
                        onClick={() => location.reload()} 
                        className="btn btn-outline-danger btn-sm fw-bold px-3 rounded-pill"
                    >
                        <i className="bi bi-x-lg me-1"></i> Cancel
                    </button>
                )}

                <span className={`badge px-3 py-2 rounded-pill fs-6 ${isSubmitted ? "bg-success" : "bg-warning text-dark"}`}>
                    {isSubmitted ? <><i className="bi bi-check-circle-fill me-1"></i> Submitted</> : <><i className="bi bi-hourglass-split me-1"></i> Pending</>}
                </span>
            </div>
            
            <div className="mt-2 text-secondary small fw-medium">
                Fiscal Year: <span className="text-dark">{proposal.fiscal_year}</span>
            </div>
        </div>
      </div>

      {/* 2. Project Context */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center cursor-pointer" onClick={() => setShowAbstract(!showAbstract)}>
            <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-file-text me-2 text-primary"></i> Project Context</h5>
            <button className="btn btn-sm btn-light rounded-circle">
                <i className={`bi ${showAbstract ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
            </button>
        </div>
        
        {showAbstract && (
            <div className="card-body px-4 pb-4 pt-0">
                <div className="row mt-3">
                    <div className="col-md-9 border-end">
                        <label className="text-secondary small fw-bold text-uppercase mb-2">Abstract</label>
                        <div className="bg-light p-3 rounded-3 text-dark" style={{lineHeight: '1.6'}}>
                            {proposal.abstract || "No abstract provided."}
                        </div>
                    </div>
                    <div className="col-md-3 ps-md-4">
                          <label className="text-secondary small fw-bold text-uppercase mb-2">Key Details</label>
                          <ul className="list-unstyled">
                            <li className="mb-3">
                                <small className="text-muted d-block">Proposed Budget</small>
                                <span className="fw-bold text-success fs-5">৳ {new Intl.NumberFormat().format(proposal.proposed_budget)}</span>
                            </li>
                            <li className="mb-3">
                                <small className="text-muted d-block">Attachments</small>
                                {proposal.documents.length ? (
                                    <div className="d-flex flex-column gap-2 mt-1">
                                        {proposal.documents.map((doc, i) => (
                                            <a key={i} href={doc.url} target="_blank" className="btn btn-sm btn-outline-primary text-start text-truncate">
                                                <i className="bi bi-paperclip me-1"></i> {doc.name}
                                            </a>
                                        ))}
                                    </div>
                                ) : <span className="text-muted small">None</span>}
                            </li>
                         </ul>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* 3. EVALUATION WORKSPACE */}
      
      {/* ROW 1: Grading Sheet (Full Width) */}
      <div className="card border-0 shadow-lg rounded-4 mb-4">
           <div className="card-header bg-primary text-white py-3 px-4 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold"><i className="bi bi-calculator me-2"></i> Grading Sheet</h5>
                <span className="badge bg-white text-primary fw-bold">Total Max: {maxPossibleScore}</span>
           </div>
           <div className="card-body p-4">
               <div className="table-responsive">
                    <table className="table table-bordered align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{width: '5%'}}>#</th>
                                <th style={{width: '35%'}}>Criteria</th>
                                <th style={{width: '15%'}} className="text-center">Score</th>
                                <th style={{width: '45%'}}>Specific Remarks (Optional)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {criteria.length > 0 ? (
                                criteria.map((item, index) => (
                                    <tr key={index}>
                                        <td className="text-center fw-bold text-secondary">{index + 1}</td>
                                        <td>
                                            <div className="fw-bold text-dark">{item.label}</div>
                                            <small className="text-muted">Max Marks: {item.marks}</small>
                                        </td>
                                        <td>
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    className={`form-control fw-bold text-center ${marksBreakdown[item.label] > item.marks ? 'is-invalid' : ''} ${isReadOnly ? 'bg-light' : ''}`}
                                                    value={marksBreakdown[item.label] ?? ""}
                                                    onChange={(e) => handleMarkChange(item.label, item.marks, e.target.value)}
                                                    disabled={isReadOnly}
                                                    placeholder="0"
                                                    min="0" 
                                                    max={item.marks}
                                                />
                                                <span className="input-group-text bg-light text-muted small">/ {item.marks}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <input 
                                                type="text" 
                                                className={`form-control ${isReadOnly ? 'bg-light' : ''}`}
                                                placeholder="Add specific comment..."
                                                // Ensure we access via the exact label key and handle undefined with ""
                                                value={criteriaRemarks[item.label] || ""}
                                                onChange={(e) => handleRemarkChange(item.label, e.target.value)}
                                                disabled={isReadOnly}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-muted">
                                        No criteria found. Please contact the administrator to set up review settings.
                                    </td>
                                </tr>
                            )}
                            {/* Total Row */}
                            <tr className="table-light border-top-2">
                                <td colSpan="2" className="text-end fw-bold text-uppercase py-3">Total Score Obtained:</td>
                                <td className="text-center py-3">
                                    <span className={`display-6 fw-bold ${totalMarks >= (maxPossibleScore/2) ? 'text-success' : 'text-danger'}`}>
                                        {totalMarks}
                                    </span>
                                    <span className="text-muted fw-bold"> / {maxPossibleScore}</span>
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
               </div>
           </div>
      </div>

      {/* ROW 2: Final Comments & Actions */}
      <div className="card border-0 shadow-lg rounded-4 mb-5">
            <div className="card-header bg-white py-3 px-4 border-bottom">
                <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-chat-square-quote-fill me-2 text-info"></i> Final Verdict & Summary</h5>
            </div>
            <div className="card-body p-4">
                <p className="text-muted small mb-2">
                    {isReadOnly 
                        ? "This review has been submitted. If the project is still under review, you may edit it using the button at the top."
                        : "Please provide an overall summary, suggestions for improvement, and your final recommendation."
                    }
                </p>
                
                <textarea 
                    className={`form-control p-3 mb-4 ${isReadOnly ? 'bg-light text-secondary' : 'bg-white border-primary'}`}
                    rows="6"
                    placeholder="Type your final evaluation summary here..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    readOnly={isReadOnly}
                    style={{ resize: "none", fontSize: "1rem", lineHeight: "1.6" }}
                ></textarea>

                {/* Submit Actions */}
                {(!isSubmitted || isEditing) && (
                    <div className="d-flex justify-content-end align-items-center gap-3">
                         <span className="text-muted small">
                            <i className="bi bi-info-circle me-1"></i> 
                            {isEditing ? "Updates overwrite previous data." : "Action cannot be undone."}
                         </span>
                         <button 
                            className={`btn btn-lg fw-bold shadow-sm px-5 ${isEditing ? 'btn-warning text-dark' : 'btn-primary'}`}
                            onClick={submitReview}
                        >
                            {isEditing ? <><i className="bi bi-arrow-repeat me-2"></i> Update Evaluation</> : <><i className="bi bi-send-check-fill me-2"></i> Submit Evaluation</>}
                        </button>
                    </div>
                )}

                {/* Submitted Message */}
                {isSubmitted && !isEditing && (
                    <div className={`alert border-0 text-center mb-0 ${isProjectLocked ? 'alert-secondary bg-light text-secondary' : 'alert-success bg-success-subtle text-success'}`}>
                        {isProjectLocked 
                            ? <><i className="bi bi-lock-fill me-2"></i> Project is Ongoing/Completed. Review is permanently locked.</>
                            : <><i className="bi bi-check-circle-fill me-2"></i> Evaluation submitted. You can edit this at the top of the page.</>
                        }
                    </div>
                )}
            </div>
      </div>

      <style jsx>{`
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
}