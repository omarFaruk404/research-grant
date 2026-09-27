"use client";
import { useState, useEffect } from "react";

export default function MailDashboard() {
  const [activeTab, setActiveTab] = useState("researcher");
  const [loading, setLoading] = useState(true);
  
  // Data & Pagination
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filters
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Custom Mail State
  const [customForm, setCustomForm] = useState({ to: "", subject: "", body: "" });
  const [customFile, setCustomFile] = useState(null);
  const [sendingCustom, setSendingCustom] = useState(false);

  // --- INITIAL LOAD (Fiscal Years) ---
  useEffect(() => {
    fetch("/api/fiscal-years") 
      .then(res => res.json())
      .then(data => {
        const years = Array.isArray(data) ? data : (data.data || []);
        setFiscalYears(years);
      })
      .catch(console.error);
  }, []);

  // --- FETCH TABLE DATA ---
  useEffect(() => {
    if (activeTab === "custom") return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          tab: activeTab,
          page: currentPage,
          limit: 10,
          fiscal_year_id: selectedFiscalYear,
          search: searchTerm
        });

        const res = await fetch(`/api/officer/mail?${params.toString()}`);
        const json = await res.json();
        
        if (json.success) {
          setData(json.data);
          setTotalPages(json.meta.totalPages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => fetchData(), 300); // Debounce search
    return () => clearTimeout(timer);

  }, [activeTab, currentPage, selectedFiscalYear, searchTerm]);

  // --- HANDLERS ---

  const handleSendReminder = async (item, type) => {
    if (!confirm(`Send "${type.replace(/_/g, ' ')}" email to ${item.researcher_name || item.reviewer_name}?`)) return;

    const payload = {
      email: item.researcher_email || item.reviewer_email,
      name: item.researcher_name || item.reviewer_name,
      project_title: item.title || item.project_title,
      mail_type: type,
      id_to_update: activeTab === 'researcher' ? item.project_id : item.review_id,
      update_table: activeTab === 'researcher' ? 'project' : 'project_review'
    };

    try {
      const res = await fetch("/api/officer/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        alert("✅ Email sent!");
        // Refresh data to show updated timestamp
        const params = new URLSearchParams({ 
            tab: activeTab, 
            page: currentPage, 
            limit: 10,
            fiscal_year_id: selectedFiscalYear,
            search: searchTerm
        });
        const refresh = await fetch(`/api/officer/mail?${params}`);
        const freshJson = await refresh.json();
        if(freshJson.success) setData(freshJson.data);
      } else {
        alert("❌ Failed: " + json.error);
      }
    } catch (e) { alert("Network Error"); }
  };

  const handleSendCustomMail = async (e) => {
    e.preventDefault();
    if (!customForm.to || !customForm.subject || !customForm.body) return alert("Please fill all fields.");

    setSendingCustom(true);
    const formData = new FormData();
    formData.append("to", customForm.to);
    formData.append("subject", customForm.subject);
    formData.append("body", customForm.body);
    if (customFile) formData.append("attachment", customFile);

    try {
      const res = await fetch("/api/officer/mail", {
        method: "POST",
        body: formData 
      });
      const json = await res.json();
      if (json.success) {
        alert("✅ Custom Email Sent!");
        setCustomForm({ to: "", subject: "", body: "" });
        setCustomFile(null);
      } else {
        alert("❌ Failed: " + json.error);
      }
    } catch (err) { alert("Network Error"); }
    finally { setSendingCustom(false); }
  };

  // --- RENDER HELPERS ---
  const formatDate = (d) => d ? new Date(d).toLocaleDateString() + " " + new Date(d).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-";

  return (
    <div className="container-fluid px-0 mt-5 position-relative">
      
      {/* 1. Header */}
      <div className="d-flex justify-content-between align-items-end mb-4 px-1">
        <div>
          <h2 className="fw-bold text-dark mb-1">Communication Center</h2>
        </div>
      </div>

      {/* 2. Main Card */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        
        {/* Header Tabs */}
        <div className="card-header bg-white p-0 border-bottom">
          <ul className="nav nav-tabs nav-fill card-header-tabs m-0 border-0">
            {['researcher', 'reviewer', 'custom'].map(tab => (
              <li className="nav-item" key={tab}>
                <button 
                  className={`nav-link border-0 py-3 fw-bold text-capitalize ${activeTab === tab ? 'active text-primary border-bottom border-3 border-primary' : 'text-secondary'}`}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  style={{ borderRadius: 0 }}
                >
                  {tab === 'custom' ? 'Custom Mail' : `${tab}s`}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-body p-4">
          
          {/* --- CUSTOM MAIL TAB --- */}
          {activeTab === 'custom' ? (
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="bg-light p-4 rounded-4 border">
                  <h5 className="mb-4 fw-bold text-primary d-flex align-items-center">
                    <div className="bg-white p-2 rounded-circle shadow-sm me-2 d-flex"><i className="bi bi-envelope-plus-fill"></i></div> 
                    Compose Custom Email
                  </h5>
                  <form onSubmit={handleSendCustomMail}>
                    <div className="mb-3">
                      <label className="form-label fw-bold small text-secondary text-uppercase">To (Emails)</label>
                      <input type="text" className="form-control" placeholder="e.g. user1@bu.ac.bd, user2@bu.ac.bd" value={customForm.to} onChange={e => setCustomForm({...customForm, to: e.target.value})} required />
                      <div className="form-text">Separate multiple emails with commas.</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold small text-secondary text-uppercase">Subject</label>
                      <input type="text" className="form-control" placeholder="Email Subject" value={customForm.subject} onChange={e => setCustomForm({...customForm, subject: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold small text-secondary text-uppercase">Message Body</label>
                      <textarea className="form-control" rows="6" placeholder="Write your message here..." value={customForm.body} onChange={e => setCustomForm({...customForm, body: e.target.value})} required></textarea>
                    </div>
                    <div className="mb-4">
                      <label className="form-label fw-bold small text-secondary text-uppercase">Attachment</label>
                      <input type="file" className="form-control" onChange={e => setCustomFile(e.target.files[0])} />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold py-2 shadow-sm" disabled={sendingCustom}>
                      {sendingCustom ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-send-fill me-2"></i>} Send Email
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            
            /* --- TABLE TABS (Researcher / Reviewer) --- */
            <>
              {/* Filters Toolbar */}
              <div className="bg-light p-3 rounded-3 border mb-4 d-flex flex-wrap gap-3 align-items-center">
                {/* Search */}
                <div className="flex-grow-1" style={{ minWidth: '250px' }}>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                    <input type="text" className="form-control border-start-0 ps-0" placeholder="Search by title, name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>

                {/* Fiscal Year Filter */}
                <select className="form-select" style={{maxWidth: '200px'}} value={selectedFiscalYear} onChange={(e) => { setSelectedFiscalYear(e.target.value); setCurrentPage(1); }}>
                  <option value="all">All Fiscal Years</option>
                  {fiscalYears.map(fy => (
                    <option key={fy.id} value={fy.id}>
                        {fy.year_label} {fy.is_active === 1 ? '(Active)' : ''}
                    </option>
                  ))}
                </select>

                <div className="text-secondary small fw-medium ms-auto">
                  Page {currentPage} of {totalPages || 1}
                </div>
              </div>

              {/* Styled Data Table */}
              <div className="table-responsive rounded-3 shadow-sm border">
                <table className="table align-middle mb-0" style={{ tableLayout: 'fixed', minWidth: '900px' }}>
                  <thead>
                    <tr style={{ backgroundColor: "#5c67f2" }}>
                      <th className="text-white small fw-bold py-3 ps-3" style={{width: '30%',backgroundColor: "#5c67f2"}}>Project Title</th>
                      <th className="text-white small fw-bold py-3" style={{width: '20%',backgroundColor: "#5c67f2"}}>{activeTab === 'researcher' ? 'Researcher' : 'Reviewer'}</th>
                      <th className="text-white small fw-bold py-3" style={{width: '10%',backgroundColor: "#5c67f2"}}>Fiscal Year</th>
                      <th className="text-white small fw-bold py-3" style={{width: '15%',backgroundColor: "#5c67f2"}}>{activeTab === 'researcher' ? 'Status' : 'Task Type'}</th>
                      <th className="text-white small fw-bold py-3" style={{width: '15%',backgroundColor: "#5c67f2"}}>Last Reminder</th>
                      <th className="text-white small fw-bold py-3 pe-3 text-end" style={{width: '10%',backgroundColor: "#5c67f2"}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                    ) : data.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-5 text-muted">No records found.</td></tr>
                    ) : (
                      data.map(item => (
                        <tr key={activeTab === 'researcher' ? item.project_id : item.review_id} className="border-bottom hover-bg-light">
                          <td className="ps-3 py-3">
                            <span className="fw-bold text-dark d-block text-truncate" title={item.title || item.project_title}>
                                {item.title || item.project_title}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="fw-medium text-dark">{item.researcher_name || item.reviewer_name}</div>
                            <div className="small text-muted text-truncate">{item.researcher_email || item.reviewer_email}</div>
                          </td>
                          <td className="py-3"><span className="badge bg-light text-secondary border">{item.year_label}</span></td>
                          
                          {/* Status / Type Column */}
                          <td className="py-3">
                            {activeTab === 'researcher' ? (
                              item.report_id ? 
                                <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1">Report Submitted</span> : 
                                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1">Ongoing Project</span>
                            ) : (
                              item.review_type === 1 ? 
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">Proposal Review</span> : 
                                <span className="badge bg-purple-subtle text-purple border border-purple-subtle px-2 py-1" style={{color: '#6f42c1', backgroundColor: '#e0cffc', borderColor: '#d6bbfb'}}>Final Report</span>
                            )}
                          </td>

                          {/* Last Reminder */}
                          <td className="py-3 small text-secondary">
                            {item.last_reminder_sent_at ? (
                                <span className="d-flex align-items-center gap-1"><i className="bi bi-clock-history"></i> {formatDate(item.last_reminder_sent_at)}</span>
                            ) : (
                                <span className="text-muted opacity-50">-</span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 pe-3 text-end">
                            {activeTab === 'researcher' ? (
                              <div className="dropdown">
                                <button className="btn btn-sm btn-light border dropdown-toggle fw-bold text-primary" type="button" data-bs-toggle="dropdown">
                                    <i className="bi bi-envelope me-1"></i> Send
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                                  <li><h6 className="dropdown-header">Select Template</h6></li>
                                  <li><button className="dropdown-item small" onClick={() => handleSendReminder(item, "SUBMIT_FINAL_REPORT")}><i className="bi bi-file-earmark-text me-2"></i> Submit Report Reminder</button></li>
                                  {item.report_id && <li><button className="dropdown-item small" onClick={() => handleSendReminder(item, "UPDATE_FINAL_REPORT")}><i className="bi bi-pencil-square me-2"></i> Request Report Update</button></li>}
                                </ul>
                              </div>
                            ) : (
                              <button className="btn btn-sm btn-warning fw-bold text-dark border-0 shadow-sm" onClick={() => handleSendReminder(item, "FINISH_REVIEW")}>
                                <i className="bi bi-bell-fill me-1"></i> Remind
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-end mt-4">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                            <span aria-hidden="true">&laquo;</span>
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                            <span aria-hidden="true">&raquo;</span>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}