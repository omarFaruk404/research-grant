"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function CreateProjectPage() {
  const router = useRouter();

  // Data State
  const [researchers, setResearchers] = useState([]);
  const [filteredResearchers, setFilteredResearchers] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [allCirculars, setAllCirculars] = useState([]); 
  const [filteredCirculars, setFilteredCirculars] = useState([]); 

  // UI State
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResearcherName, setSelectedResearcherName] = useState("");
  const dropdownRef = useRef(null);

  // Keyword State (Problem Domain)
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");

  // Form State
  const [form, setForm] = useState({
    code_no: "",
    title: "",
    researcher_id: "",
    fiscal_year_id: "",
    circular_id: "", 
    abstract: "",
    proposed_budget: "",
    documents: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    async function fetchData() {
      try {
        const [resResearchers, resFiscal, resCirculars] = await Promise.all([
          fetch("/api/researchers"),
          fetch("/api/fiscal-years"),
          fetch("/api/circulars/proposals"), 
        ]);

        const researchersData = await resResearchers.json();
        const fiscalData = await resFiscal.json();
        const circularsData = await resCirculars.json();

        setResearchers(researchersData || []);
        setFilteredResearchers(researchersData || []);
        
        // Active Fiscal Years only
        const activeFiscalYears = (fiscalData || []).filter(fy => fy.is_active);
        setFiscalYears(activeFiscalYears);

        setAllCirculars(circularsData || []);
        
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
    fetchData();
  }, []);

  /* ---------- FILTER CIRCULARS ---------- */
  useEffect(() => {
    if (form.fiscal_year_id) {
      const relevantCirculars = allCirculars.filter(
        (c) => c.fiscal_year_id === parseInt(form.fiscal_year_id)
      );
      setFilteredCirculars(relevantCirculars);
    } else {
      setFilteredCirculars([]);
    }
  }, [form.fiscal_year_id, allCirculars]);

  /* ---------- CLICK OUTSIDE RESEARCHER DROPDOWN ---------- */
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSearch(false);
        setFilteredResearchers(researchers);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [researchers]);

  /* ---------- HANDLERS ---------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, documents: [...files] }));
    } else {
      setForm((prev) => {
        const updated = { ...prev, [name]: value };
        if (name === "fiscal_year_id") updated.circular_id = "";
        return updated;
      });
    }
  };

  const handleResearcherSelect = (id, name) => {
    setForm((prev) => ({ ...prev, researcher_id: id }));
    setSelectedResearcherName(name);
    setShowSearch(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredResearchers(
      researchers.filter((r) => r.name.toLowerCase().includes(value))
    );
  };

  /* ---------- KEYWORD HANDLERS ---------- */
  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  };

  const addKeyword = () => {
    const val = keywordInput.trim();
    if (val && !keywords.includes(val) && keywords.length < 5) {
      setKeywords([...keywords, val]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (indexToRemove) => {
    setKeywords(keywords.filter((_, index) => index !== indexToRemove));
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("code_no", form.code_no);
    formData.append("title", form.title);
    formData.append("researcher_id", form.researcher_id);
    formData.append("fiscal_year_id", form.fiscal_year_id);
    formData.append("circular_id", form.circular_id); 
    formData.append("abstract", form.abstract);
    formData.append("proposed_budget", form.proposed_budget);

    // Append Keywords as JSON string (matches the JSON column type)
    formData.append("problem_domain", JSON.stringify(keywords));

    form.documents.forEach((file) => {
      formData.append("documents", file);
    });

    try {
      const res = await fetch("/api/officer/projects/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Project created successfully!");
        setKeywords([]);
        // Optional: router.push("/officer/dashboard/projects");
      } else {
        setMessage(data.message || "Failed to create project");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred while submitting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-4 py-4">
      
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button 
          onClick={() => router.back()} 
          className="btn btn-outline-secondary btn-sm me-3"
          type="button"
        >
          ← Back
        </button>
        <h2 className="fw-bold text-dark mb-0">Create New Project</h2>
      </div>

      {message && (
        <div className={`alert ${message.includes("success") ? "alert-success" : "alert-danger"}`}>
          {message}
        </div>
      )}

      <div className="card border-0 shadow-sm" style={{ borderRadius: "10px" }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              
              {/* --- TITLE ROW (Full Width) --- */}
              <div className="col-12">
                <label className="form-label fw-semibold">Project Title *</label>
                <input 
                  name="title" 
                  className="form-control" 
                  required 
                  onChange={handleChange} 
                  placeholder="Enter full project title" 
                />
              </div>

              {/* --- ABSTRACT ROW (Full Width) --- */}
              <div className="col-12">
                <label className="form-label fw-semibold">Abstract</label>
                <textarea 
                  name="abstract" 
                  className="form-control" 
                  rows="4" 
                  onChange={handleChange} 
                  placeholder="Detailed project abstract..."
                />
              </div>

              <div className="col-12"><hr className="text-secondary opacity-25" /></div>

              {/* --- LEFT COLUMN --- */}
              <div className="col-md-6">
                
                {/* Researcher Searchable Dropdown */}
                <div className="mb-3 position-relative" ref={dropdownRef}>
                  <label className="form-label fw-semibold">Researcher *</label>
                  {!showSearch ? (
                    <div
                      className="form-select text-start"
                      style={{ cursor: "pointer", color: selectedResearcherName ? "inherit" : "#6c757d" }}
                      onClick={() => {
                        setShowSearch(true);
                        setSearchTerm("");
                        setFilteredResearchers(researchers);
                      }}
                    >
                      {selectedResearcherName || "Select Researcher..."}
                    </div>
                  ) : (
                    <input
                      className="form-control"
                      value={searchTerm}
                      onChange={handleSearch}
                      autoFocus
                      placeholder="Type to search..."
                    />
                  )}

                  {showSearch && (
                    <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}>
                      {filteredResearchers.length > 0 ? (
                        filteredResearchers.map((r) => (
                          <li
                            key={r.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => handleResearcherSelect(r.id, r.name)}
                            style={{ cursor: "pointer" }}
                          >
                            {r.name}
                          </li>
                        ))
                      ) : (
                        <li className="list-group-item text-muted">No researcher found</li>
                      )}
                    </ul>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Project Code *</label>
                  <input name="code_no" className="form-control" required onChange={handleChange} placeholder="e.g. PROJ-2024-001" />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">Proposed Budget (BDT) *</label>
                  <input
                    type="number"
                    name="proposed_budget"
                    className="form-control"
                    required
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                {/* --- PROBLEM DOMAIN (KEYWORDS) --- */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Problem Domain <span className="text-muted small fw-normal">(Keywords, Max 5)</span>
                  </label>
                  
                  <div className="border rounded p-2 bg-white d-flex flex-wrap gap-2 align-items-center">
                    {keywords.map((kw, idx) => (
                      <span key={idx} className="badge bg-primary bg-opacity-10 text-primary d-flex align-items-center gap-2 px-2 py-1 border border-primary border-opacity-25 rounded-pill">
                        {kw}
                        <button 
                          type="button" 
                          className="btn-close" 
                          style={{ width: "0.5rem", height: "0.5rem" }} 
                          onClick={() => removeKeyword(idx)}
                        ></button>
                      </span>
                    ))}
                    
                    {keywords.length < 5 && (
                      <input 
                        type="text" 
                        className="border-0 flex-grow-1" 
                        style={{ outline: "none", minWidth: "120px" }}
                        placeholder={keywords.length === 0 ? "Type and press Enter..." : "Add another..."}
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleKeywordKeyDown}
                        onBlur={addKeyword} // Add on blur as well
                      />
                    )}
                  </div>
                  {keywords.length >= 5 && <div className="form-text text-warning">Maximum 5 keywords reached.</div>}
                </div>

              </div>

              {/* --- RIGHT COLUMN --- */}
              <div className="col-md-6">
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">Fiscal Year *</label>
                  <select name="fiscal_year_id" className="form-select" required onChange={handleChange}>
                    <option value="">Select Fiscal Year</option>
                    {fiscalYears.map((fy) => (
                      <option key={fy.id} value={fy.id}>
                        {fy.year_label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Circular (Proposal) *</label>
                  <select 
                    name="circular_id" 
                    className="form-select" 
                    required 
                    onChange={handleChange}
                    value={form.circular_id}
                    disabled={!form.fiscal_year_id}
                  >
                    <option value="">
                      {!form.fiscal_year_id 
                        ? "Select Fiscal Year First" 
                        : filteredCirculars.length === 0 
                          ? "No Circulars Found" 
                          : "Select Circular"
                      }
                    </option>
                    {filteredCirculars.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Upload Proposal Documents</label>
                  <input
                    type="file"
                    name="documents"
                    multiple
                    className="form-control"
                    onChange={handleChange}
                  />
                  <div className="form-text">Supported: PDF, DOCX (Max 10MB)</div>
                </div>

              </div>
            </div>

            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <button 
                type="button" 
                className="btn btn-light me-2 text-secondary fw-medium"
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary px-4 fw-bold" 
                style={{ backgroundColor: "#5c67f2", borderColor: "#5c67f2" }}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Project"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}