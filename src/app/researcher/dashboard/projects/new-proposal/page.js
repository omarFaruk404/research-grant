"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function CreateProjectPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Data States
  const [fiscalYears, setFiscalYears] = useState([]);
  const [allCirculars, setAllCirculars] = useState([]);
  
  // Form State
  const [form, setForm] = useState({
    title: "",
    fiscal_year_id: "",
    circular_id: "",
    abstract: "",
    keywords: [], // Array of strings
    proposed_budget: "",
  });

  // UI States
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]); // Array of File objects
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 1. Load User
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      if (!parsed.researcher_id || parsed.current_role !== "researcher") {
        router.push("/login");
        return;
      }
      setUser(parsed);
    } catch (err) {
      router.push("/login");
    }
  }, [router]);

  // 2. Load Options (Fiscal Years & Circulars)
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [fyRes, circRes] = await Promise.all([
          fetch("/api/fiscal-years"),
          fetch("/api/circulars/proposals"), // Fetch active circulars
        ]);

        const fyData = await fyRes.json();
        const circData = await circRes.json();

        if (Array.isArray(fyData)) setFiscalYears(fyData);
        else if (fyData.data) setFiscalYears(fyData.data);

        if (Array.isArray(circData)) setAllCirculars(circData);
        else if (circData.data) setAllCirculars(circData.data);
        else if (circData.circulars) setAllCirculars(circData.circulars);

      } catch (err) {
        console.error("Failed to load options:", err);
      }
    }
    fetchOptions();
  }, []);

  // Filter Circulars by Fiscal Year
  const availableCirculars = useMemo(() => {
    if (!form.fiscal_year_id) return [];
    return allCirculars.filter(c => String(c.fiscal_year_id) === String(form.fiscal_year_id));
  }, [allCirculars, form.fiscal_year_id]);

  // --- Handlers ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Reset circular if fiscal year changes
    if (name === "fiscal_year_id") {
      setForm(prev => ({ ...prev, circular_id: "" }));
    }
  };

  // Keyword Handlers
  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newKeyword = keywordInput.trim();
      if (newKeyword && !form.keywords.includes(newKeyword)) {
        setForm(prev => ({ ...prev, keywords: [...prev.keywords, newKeyword] }));
        setKeywordInput("");
      }
    }
  };

  const removeKeyword = (indexToRemove) => {
    setForm(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== indexToRemove)
    }));
  };

  // File Handlers (Additive & Remove)
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      e.target.value = ""; // Reset input to allow re-selecting same file
    }
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("fiscal_year_id", form.fiscal_year_id);
    formData.append("circular_id", form.circular_id);
    formData.append("abstract", form.abstract || "");
    formData.append("keywords", JSON.stringify(form.keywords)); // Send as JSON string
    formData.append("proposed_budget", form.proposed_budget || "0");
    formData.append("researcher_id", String(user.researcher_id));
    formData.append("uploaded_by", String(user.user_id));

    // Append Files
    selectedFiles.forEach((file) => {
      formData.append("documents", file);
    });

    try {
      const res = await fetch("/api/researcher/projects/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Project submitted successfully!");
        router.push("/researcher/dashboard/projects"); // Redirect to list
      } else {
        setMessage(data.message || "Failed to create project");
      }
    } catch (err) {
      console.error("Error creating project:", err);
      setMessage("❌ Error creating project");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* Header */}
      <div className="mb-4 pb-2 border-bottom">
        <h2 className="fw-bold text-dark mb-1">Submit New Proposal</h2>
        <p className="text-muted mb-0">Fill in the details below to create a new research project grant proposal.</p>
      </div>

      {message && <div className="alert alert-danger mb-4 rounded-3 shadow-sm">{message}</div>}

      <div className="row justify-content-center">
        <div className="col-lg-10">
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
            
            {/* 1. Basic Info Card */}
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white p-4 border-bottom">
                <h5 className="fw-bold mb-0 text-primary">Project Information</h5>
              </div>
              <div className="card-body p-4">
                
                {/* Title */}
                <div className="mb-4">
                  <label className="form-label fw-bold small text-secondary">PROJECT TITLE <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="title"
                    className="form-control form-control-lg"
                    placeholder="Enter the full title of your research"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row g-3">
                  {/* Fiscal Year */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-secondary">FISCAL YEAR <span className="text-danger">*</span></label>
                    <select
                      name="fiscal_year_id"
                      className="form-select"
                      value={form.fiscal_year_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Year...</option>
                      {fiscalYears.map((fy) => (
                        <option key={fy.id} value={fy.id}>{fy.year_label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Circular (Filtered) */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-secondary">CIRCULAR <span className="text-danger">*</span></label>
                    <select
                      name="circular_id"
                      className="form-select"
                      value={form.circular_id}
                      onChange={handleChange}
                      disabled={!form.fiscal_year_id}
                      required
                    >
                      <option value="">Select Circular...</option>
                      {availableCirculars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} (Due: {new Date(c.proposal_submission_deadline).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Budget */}
                <div className="mt-4">
                  <label className="form-label fw-bold small text-secondary">PROPOSED BUDGET (BDT) <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text">৳</span>
                    <input
                      type="number"
                      step="0.01"
                      name="proposed_budget"
                      className="form-control"
                      placeholder="e.g. 500000"
                      value={form.proposed_budget}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* 2. Abstract & Keywords Card */}
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white p-4 border-bottom">
                <h5 className="fw-bold mb-0 text-primary">Abstract & Keywords</h5>
              </div>
              <div className="card-body p-4">
                
                {/* Abstract */}
                <div className="mb-4">
                  <label className="form-label fw-bold small text-secondary">ABSTRACT</label>
                  <textarea
                    name="abstract"
                    className="form-control"
                    rows="5"
                    placeholder="Provide a brief summary of your research proposal..."
                    value={form.abstract}
                    onChange={handleChange}
                  ></textarea>
                </div>

                {/* Keywords Input */}
                <div>
                  <label className="form-label fw-bold small text-secondary">KEYWORDS</label>
                  <div className="form-control p-2 d-flex flex-wrap gap-2 align-items-center" style={{ minHeight: '48px' }}>
                    {form.keywords.map((keyword, index) => (
                      <span key={index} className="badge bg-light text-dark border d-flex align-items-center gap-2 px-3 py-2 rounded-pill">
                        {keyword}
                        <button 
                          type="button" 
                          className="btn-close" 
                          style={{ fontSize: '0.5rem' }} 
                          onClick={() => removeKeyword(index)}
                          aria-label="Remove"
                        ></button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="border-0 bg-transparent flex-grow-1"
                      style={{ outline: 'none', minWidth: '150px' }}
                      placeholder={form.keywords.length === 0 ? "Type keyword and press Enter..." : "Add another..."}
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={handleKeywordKeyDown}
                    />
                  </div>
                  <div className="form-text text-muted small">Press <code>Enter</code> or <code>comma</code> to add a tag.</div>
                </div>

              </div>
            </div>

            {/* 3. Documents Card */}
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white p-4 border-bottom">
                <h5 className="fw-bold mb-0 text-primary">Proposal Documents</h5>
              </div>
              <div className="card-body p-4">
                
                <div className="mb-3">
                  <label className="form-label fw-bold small text-secondary">UPLOAD FILES</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    multiple
                  />
                  <div className="form-text text-muted">Supported formats: PDF, DOC, DOCX. You can select multiple files.</div>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="d-flex flex-column gap-2 mt-3">
                    {selectedFiles.map((file, i) => (
                      <div key={i} className="p-3 bg-light border rounded-3 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3 overflow-hidden">
                          <div className="bg-white p-2 rounded border">
                            <i className="bi bi-file-earmark-text text-primary fs-5"></i>
                          </div>
                          <div className="d-flex flex-column">
                            <span className="fw-bold text-dark text-truncate" style={{maxWidth: '300px'}}>{file.name}</span>
                            <span className="text-muted small">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm border-0 bg-white shadow-sm"
                          onClick={() => removeFile(i)}
                          title="Remove file"
                        >
                          <i className="bi bi-trash"></i> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>

            {/* Submit Button */}
            <div className="d-flex justify-content-end gap-3 pb-5">
              <button 
                type="button" 
                className="btn btn-light border px-4 fw-bold"
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary px-5 fw-bold shadow-lg" 
                disabled={loading}
              >
                {loading ? (
                  <span><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</span>
                ) : (
                  <>Submit Proposal <i className="bi bi-arrow-right ms-2"></i></>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}