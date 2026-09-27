"use client";

import { useState, useEffect } from "react";

export default function ReviewSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("proposal"); // 'proposal' or 'final'

  const [proposalCriteria, setProposalCriteria] = useState([]);
  const [finalCriteria, setFinalCriteria] = useState([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/officer/review-settings");
      const data = await res.json();
      
      if (res.ok) {
        // Normalization helper (handles string array vs object array)
        const normalizeData = (list) => {
            if (!Array.isArray(list)) return [];
            return list.map((item, index) => {
                if (typeof item === 'string') {
                    return { id: Date.now() + index, label: item, marks: 0 };
                }
                return item;
            });
        };

        setProposalCriteria(normalizeData(data.proposal_criteria));
        setFinalCriteria(normalizeData(data.final_report_criteria));
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (list) => {
    return list.reduce((sum, item) => sum + (parseFloat(item.marks) || 0), 0);
  };

  const handleAddCriteria = (type) => {
    const newItem = { id: Date.now(), label: "", marks: 0 };
    if (type === "proposal") setProposalCriteria([...proposalCriteria, newItem]);
    else setFinalCriteria([...finalCriteria, newItem]);
  };

  const handleDeleteCriteria = (type, id) => {
    if (type === "proposal") setProposalCriteria(proposalCriteria.filter((item) => item.id !== id));
    else setFinalCriteria(finalCriteria.filter((item) => item.id !== id));
  };

  const handleChange = (type, id, field, value) => {
    const list = type === "proposal" ? [...proposalCriteria] : [...finalCriteria];
    const index = list.findIndex((item) => item.id === id);
    if (index > -1) {
      list[index][field] = field === "marks" ? parseFloat(value) || 0 : value;
      if (type === "proposal") setProposalCriteria(list);
      else setFinalCriteria(list);
    }
  };

  // --- UPDATED SAVE HANDLER ---
  const handleSave = async () => {
    setSaving(true);
    let payload = {};
    let total = 0;

    // 1. Determine what to save based on Active Tab
    if (activeTab === "proposal") {
        total = calculateTotal(proposalCriteria);
        if (total !== 100) {
            alert(`Error: Proposal Criteria total marks must be 100. Current: ${total}`);
            setSaving(false);
            return;
        }
        payload = { proposal_criteria: proposalCriteria }; // Only send proposal data
    } 
    else if (activeTab === "final") {
        total = calculateTotal(finalCriteria);
        if (total !== 100) {
            alert(`Error: Final Report Criteria total marks must be 100. Current: ${total}`);
            setSaving(false);
            return;
        }
        payload = { final_report_criteria: finalCriteria }; // Only send final report data
    }

    // 2. Send API Request
    try {
      const res = await fetch("/api/officer/review-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(`${activeTab === 'proposal' ? 'Proposal' : 'Final Report'} settings saved successfully!`);
      } else {
        alert("Failed to save settings.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid px-4 mt-5 position-relative mb-5">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-0">Review Assessment Settings</h2>
        <p className="text-muted">Configure the evaluation criteria and marks distribution.</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* Tabs */}
        <div className="card-header bg-white border-bottom px-4 py-3">
            <ul className="nav nav-pills card-header-pills" role="tablist">
                <li className="nav-item">
                    <button 
                        className={`nav-link fw-semibold px-4 ${activeTab === 'proposal' ? 'active' : 'text-muted'}`}
                        onClick={() => setActiveTab('proposal')}
                    >
                        Proposal Criteria
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link fw-semibold px-4 ${activeTab === 'final' ? 'active' : 'text-muted'}`}
                        onClick={() => setActiveTab('final')}
                    >
                        Final Report Criteria
                    </button>
                </li>
            </ul>
        </div>

        {/* Content */}
        <div className="card-body p-4">
            <CriteriaEditor 
                type={activeTab}
                items={activeTab === 'proposal' ? proposalCriteria : finalCriteria}
                onAdd={() => handleAddCriteria(activeTab)}
                onDelete={(id) => handleDeleteCriteria(activeTab, id)}
                onChange={(id, field, val) => handleChange(activeTab, id, field, val)}
                total={calculateTotal(activeTab === 'proposal' ? proposalCriteria : finalCriteria)}
            />
        </div>

        {/* Footer with Context-Aware Save Button */}
        <div className="card-footer bg-light px-4 py-3 text-end border-top">
             <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn btn-primary px-5 fw-bold"
            >
                {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-save me-2"></i>}
                {/* Button text changes based on tab */}
                Save {activeTab === 'proposal' ? 'Proposal' : 'Final Report'} Settings
            </button>
        </div>
      </div>
    </div>
  );
}

function CriteriaEditor({ type, items, onAdd, onDelete, onChange, total }) {
    const isTotalValid = total === 100;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 text-secondary">
                    {type === 'proposal' ? 'Proposal Evaluation Criteria' : 'Final Report Evaluation Criteria'}
                </h5>
                <div className={`fw-bold px-3 py-2 rounded-3 ${isTotalValid ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                    Total Marks: {total} / 100
                    {!isTotalValid && <i className="bi bi-exclamation-triangle-fill ms-2"></i>}
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th style={{width: '5%'}}>#</th>
                            <th style={{width: '65%'}}>Criteria Description</th>
                            <th style={{width: '20%'}}>Marks</th>
                            <th style={{width: '10%'}} className="text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={item.id}>
                                <td className="text-muted fw-bold">{index + 1}</td>
                                <td>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        placeholder="Criteria Label"
                                        value={item.label}
                                        onChange={(e) => onChange(item.id, 'label', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="number" 
                                        className="form-control"
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                        value={item.marks}
                                        onChange={(e) => onChange(item.id, 'marks', e.target.value)}
                                    />
                                </td>
                                <td className="text-end">
                                    <button 
                                        className="btn btn-outline-danger btn-sm border-0"
                                        onClick={() => onDelete(item.id)}
                                    >
                                        <i className="bi bi-trash-fill fs-5"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button 
                className="btn btn-light text-primary border-primary border-dashed w-100 py-2 fw-semibold mt-2"
                onClick={onAdd}
                style={{borderStyle: 'dashed'}}
            >
                <i className="bi bi-plus-circle me-2"></i> Add New Criteria
            </button>
        </div>
    );
}