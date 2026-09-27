"use client";
import { useState, useEffect, useMemo } from "react";

export default function SendCircularReminderPage() {
  // --- Data State ---
  const [circulars, setCirculars] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  
  // Derived Data for Dropdowns
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // --- Selection State ---
  const [selectedCircularId, setSelectedCircularId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'researcher', 'reviewer'

  // --- Filter State ---
  const [filterRole, setFilterRole] = useState(""); 
  const [filterFaculty, setFilterFaculty] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // --- 1. Initial Load (Circulars & Users) ---
  useEffect(() => {
    async function init() {
      try {
        const [circRes, userRes] = await Promise.all([
          fetch("/api/circulars"), 
          fetch("/api/circulars/reminders/users") 
        ]);
        
        if (circRes.ok) {
            const cData = await circRes.json();
            setCirculars(Array.isArray(cData) ? cData : cData.circulars || []); 
        }

        if (userRes.ok) {
            const uData = await userRes.json();
            const users = uData.users || [];
            setAllUsers(users);
            extractFilters(users); // ✅ Extract filters from users immediately
        }
      } catch (e) { console.error("Init Error", e); }
      finally { setLoading(false); }
    }
    init();
  }, []);

  // --- Helper: Extract Unique Faculties & Departments from Users ---
  const extractFilters = (users) => {
    const facultyMap = new Map();
    const deptMap = new Map();

    users.forEach(u => {
        // Extract from Researcher Data
        if (u.is_researcher && u.researcher_data) {
            if (u.researcher_data.faculty_id) {
                facultyMap.set(u.researcher_data.faculty_id, u.researcher_data.faculty_name);
            }
            if (u.researcher_data.dept_id) {
                deptMap.set(u.researcher_data.dept_id, u.researcher_data.dept_name);
            }
        }
        // Extract from Reviewer Data (Only Departments)
        if (u.is_reviewer && u.reviewer_data) {
            if (u.reviewer_data.dept_id) {
                deptMap.set(u.reviewer_data.dept_id, u.reviewer_data.dept_name);
            }
        }
    });

    // Convert Maps to Arrays for Select Options
    setFaculties(Array.from(facultyMap, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)));
    setDepartments(Array.from(deptMap, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)));
  };

  // --- 2. Client-Side Filtering Logic ---
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      // A. Text Search (Name/Email)
      if (filterSearch) {
        const searchLower = filterSearch.toLowerCase();
        if (!user.name.toLowerCase().includes(searchLower) && !user.email.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // B. Tab & Role Logic
      if (activeTab === "researcher") {
        if (!user.is_researcher) return false;
        
        // Researcher Filters
        if (filterFaculty && String(user.researcher_data.faculty_id) !== filterFaculty) return false;
        if (filterDept && String(user.researcher_data.dept_id) !== filterDept) return false;

      } else if (activeTab === "reviewer") {
        if (!user.is_reviewer) return false;

        // Reviewer Filters (Department only)
        // Note: We filter by ID. If reviewer has text-only department, they won't match specific ID filter.
        if (filterDept && String(user.reviewer_data.dept_id) !== filterDept) return false;

      } else {
        // "All Users" Tab
        if (filterRole === "researcher" && !user.is_researcher) return false;
        if (filterRole === "reviewer" && !user.is_reviewer) return false;

        // Global filters (Check if ANY role matches)
        if (filterFaculty) {
            if (String(user.researcher_data.faculty_id) !== filterFaculty) return false;
        }
        if (filterDept) {
            const matchesRes = String(user.researcher_data.dept_id) === filterDept;
            const matchesRev = String(user.reviewer_data.dept_id) === filterDept;
            if (!matchesRes && !matchesRev) return false;
        }
      }

      return true;
    });
  }, [allUsers, activeTab, filterRole, filterFaculty, filterDept, filterSearch]);


  // --- Handlers ---

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const visibleIds = filteredUsers.map(u => u.id);
      setSelectedUserIds(new Set([...selectedUserIds, ...visibleIds]));
    } else {
      const newSet = new Set(selectedUserIds);
      filteredUsers.forEach(u => newSet.delete(u.id));
      setSelectedUserIds(newSet);
    }
  };

  const handleSelectUser = (id) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedUserIds(newSet);
  };

  const handleSend = async () => {
    if (!selectedCircularId) return alert("Please select a circular.");
    if (selectedUserIds.size === 0) return alert("Please select at least one recipient.");
    
    if (!confirm(`Send email reminder to ${selectedUserIds.size} users?`)) return;

    setSending(true);
    try {
      const res = await fetch("/api/circulars/reminders/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          circular_id: selectedCircularId,
          recipient_ids: Array.from(selectedUserIds)
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Emails sent successfully!");
        setSelectedUserIds(new Set()); 
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (e) {
      alert("Network Error");
    } finally {
      setSending(false);
    }
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setFilterRole("");
    setFilterFaculty("");
    setFilterDept("");
    setFilterSearch("");
  };

  // Helper to determine what to display in the table based on active tab
  const getDisplayInfo = (user) => {
    if (activeTab === "researcher") {
        return {
            dept: user.researcher_data.dept_name,
            faculty: user.researcher_data.faculty_name,
            role: "Researcher"
        };
    } else if (activeTab === "reviewer") {
        // Reviewer Logic: Use Name if ID is missing
        return {
            dept: user.reviewer_data.dept_name, 
            faculty: "", 
            role: "Reviewer"
        };
    } else {
        // "All" Tab: Combine info or prioritize Researcher
        if (user.is_researcher) {
            return {
                dept: user.researcher_data.dept_name,
                faculty: user.researcher_data.faculty_name,
                role: user.is_reviewer ? "Researcher & Reviewer" : "Researcher"
            };
        } else if (user.is_reviewer) {
            return {
                dept: user.reviewer_data.dept_name,
                faculty: "",
                role: "Reviewer"
            };
        }
        return { dept: "", faculty: "", role: "User" };
    }
  };

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Send Notification</h2>
        <div className="text-secondary small">Select users and notify them about new circulars</div>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN: Controls */}
        <div className="col-lg-3">
          
          {/* Circular Selection */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white py-3 fw-bold">1. Select Circular</div>
            <div className="card-body">
              <select 
                className="form-select mb-2" 
                value={selectedCircularId} 
                onChange={(e) => setSelectedCircularId(e.target.value)}
              >
                <option value="">-- Choose Circular --</option>
                {circulars.map(c => (
                  <option key={c.id} value={c.id}>
                    {/* ✅ Check 'circular_type' from API */}
                    {c.circular_type === 'proposal' ? '📄 [Proposal]' : '📢 [Notice]'} {c.title}
                  </option>
                ))}
              </select>
              {selectedCircularId && (
                <div className="alert alert-info py-2 small mb-0">
                  <i className="bi bi-info-circle me-1"></i> 
                  Selected circular type will determine the email template.
                </div>
              )}
            </div>
          </div>

          {/* Action Box */}
          <div className="card border-0 shadow-sm rounded-4 bg-light">
            <div className="card-body text-center p-4">
              <h5 className="fw-bold mb-1">{selectedUserIds.size}</h5>
              <p className="text-secondary small mb-3">Recipients Selected</p>
              <button 
                className="btn btn-primary w-100 fw-bold py-2" 
                onClick={handleSend}
                disabled={sending || selectedUserIds.size === 0}
              >
                {sending ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-send-fill me-2"></i>}
                Send Emails
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: User Selection */}
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white p-0 border-bottom">
                {/* TABS */}
                <ul className="nav nav-tabs nav-fill card-header-tabs m-0 border-0">
                    {['all', 'researcher', 'reviewer'].map((t) => (
                        <li className="nav-item" key={t}>
                            <button 
                                className={`nav-link border-0 py-3 rounded-0 fw-bold text-capitalize ${activeTab === t ? 'active border-bottom border-primary border-3 text-primary' : 'text-secondary'}`}
                                onClick={() => changeTab(t)}
                            >
                                {t === 'all' ? 'All Users' : `${t}s`}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* FILTERS TOOLBAR */}
            <div className="p-3 bg-light border-bottom d-flex flex-wrap gap-2 align-items-center">
                
                {/* Role Filter (Only for All Users Tab) */}
                {activeTab === 'all' && (
                    <select className="form-select form-select-sm" style={{width: '130px'}} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                        <option value="">All Roles</option>
                        <option value="researcher">Researcher</option>
                        <option value="reviewer">Reviewer</option>
                    </select>
                )}

                {/* Faculty Filter (Hidden for Reviewer Tab) */}
                {activeTab !== 'reviewer' && (
                    <select className="form-select form-select-sm" style={{width: '180px'}} value={filterFaculty} onChange={(e) => setFilterFaculty(e.target.value)}>
                        <option value="">All Faculties</option>
                        {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                )}

                {/* Department Filter */}
                <select className="form-select form-select-sm" style={{width: '180px'}} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>

                {/* Search */}
                <div className="flex-grow-1">
                    <div className="input-group input-group-sm">
                        <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                        <input type="text" className="form-control" placeholder="Search name/email..." value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* USER LIST TABLE */}
            <div className="table-responsive" style={{maxHeight: '600px'}}>
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light sticky-top">
                        <tr>
                            <th className="ps-4" style={{width: '50px'}}>
                                <input 
                                    type="checkbox" 
                                    className="form-check-input" 
                                    onChange={handleSelectAll}
                                    checked={filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.has(u.id))}
                                />
                            </th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Dept / Faculty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm"></div> Loading users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-5 text-muted">No users found matching filters.</td></tr>
                        ) : (
                            filteredUsers.map(user => {
                                const info = getDisplayInfo(user);
                                return (
                                    <tr key={user.id} onClick={() => handleSelectUser(user.id)} style={{cursor: 'pointer'}} className={selectedUserIds.has(user.id) ? "table-primary" : ""}>
                                        <td className="ps-4">
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                checked={selectedUserIds.has(user.id)}
                                                onChange={() => {}} 
                                            />
                                        </td>
                                        <td className="fw-medium">{user.name}</td>
                                        <td className="text-secondary small">{user.email}</td>
                                        <td><span className="badge bg-secondary-subtle text-secondary border">{info.role}</span></td>
                                        <td className="small text-muted">
                                            {info.dept && <div>{info.dept}</div>}
                                            {info.faculty && <div className="text-secondary fst-italic">{info.faculty}</div>}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Footer Status */}
            <div className="card-footer bg-white text-end text-muted small">
                Showing {filteredUsers.length} users
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}