"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const router = useRouter();
  const [userType, setUserType] = useState("researcher");
  const [searchName, setSearchName] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [data, setData] = useState({ researchers: [], reviewers: [] });
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update department options based on selected faculty
  useEffect(() => {
    if (!data.researchers.length) return;
    
    let depts = [];
    if (selectedFaculty) {
      depts = data.researchers
        .filter((r) => r.faculty_name === selectedFaculty)
        .map((r) => r.department_name);
    } else {
      depts = data.researchers.map((r) => r.department_name);
    }
    setDepartmentOptions([...new Set(depts)].filter(Boolean)); // Unique and truthy
    setSelectedDepartment("");
  }, [selectedFaculty, data.researchers]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      setData(json);
      console.log("Fetched users:", json);
      const faculties = [...new Set(json.researchers.map((r) => r.faculty_name))].filter(Boolean);
      setFacultyOptions(faculties);

      const departments = [...new Set(json.researchers.map((r) => r.department_name))].filter(Boolean);
      setDepartmentOptions(departments);
    } catch (err) {
      console.error(err);
    }
  };

  // --- ACTIONS ---
  const handleView = (id) => {
    router.push(`/officer/dashboard/users/${id}`);
  };

  const handleEdit = (id) => {
    router.push(`/officer/dashboard/users/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        // Optimistically update UI
        setData((prev) => ({
          ...prev,
          researchers: prev.researchers.filter((u) => u.user_id !== id),
          reviewers: prev.reviewers.filter((u) => u.user_id !== id),
        }));
        alert("User deleted successfully.");
      } else {
        alert("Failed to delete user.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // --- FILTERING ---
  const filteredResearchers = data.researchers.filter(
    (r) =>
      r.user_name.toLowerCase().includes(searchName.toLowerCase()) &&
      (selectedFaculty ? r.faculty_name === selectedFaculty : true) &&
      (selectedDepartment ? r.department_name === selectedDepartment : true)
  );

  const filteredReviewers = data.reviewers.filter((r) =>
    r.user_name.toLowerCase().includes(searchName.toLowerCase())
  );

  const usersToShow = userType === "researcher" ? filteredResearchers : filteredReviewers;

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Users Management</h2>
        <Link href="/officer/dashboard/users/add-user" className="btn btn-primary px-4 py-2 fw-semibold" style={{ backgroundColor: "#5c67f2", borderColor: "#5c67f2" }}>
          + Add User
        </Link>
      </div>

      {/* Toggle Buttons */}
      <div className="mb-4 d-flex gap-2">
        <button
          className={`btn fw-medium px-4 ${userType === "researcher" ? "text-white" : "text-secondary bg-light border"}`}
          style={{ backgroundColor: userType === "researcher" ? "#5c67f2" : "", borderColor: userType === "researcher" ? "#5c67f2" : "" }}
          onClick={() => setUserType("researcher")}
        >
          Researchers
        </button>
        <button
          className={`btn fw-medium px-4 ${userType === "reviewer" ? "text-white" : "text-secondary bg-light border"}`}
          style={{ backgroundColor: userType === "reviewer" ? "#5c67f2" : "", borderColor: userType === "reviewer" ? "#5c67f2" : "" }}
          onClick={() => setUserType("reviewer")}
        >
          Reviewers
        </button>
      </div>

      {/* Filters Bar */}
      <div className="d-flex flex-wrap mb-4 gap-3 bg-white p-3 rounded shadow-sm border">
        <div className="flex-grow-1" style={{ minWidth: "200px" }}>
          <input
            type="text"
            placeholder="Search by name..."
            className="form-control border-secondary-subtle"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>

        {userType === "researcher" && (
          <>
            <select
              className="form-select border-secondary-subtle"
              style={{ width: "200px" }}
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
            >
              <option value="">All Faculties</option>
              {facultyOptions.map((f, idx) => (
                <option key={idx} value={f}>{f}</option>
              ))}
            </select>

            <select
              className="form-select border-secondary-subtle"
              style={{ width: "200px" }}
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departmentOptions.map((d, idx) => (
                <option key={idx} value={d}>{d}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Styled Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "10px", overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="table mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
            
            {/* Table Header - Style applied directly to TR for visibility */}
            <thead>
              <tr style={{ backgroundColor: "#5c67f2" }}>
                {/* Serial Number Column Header */}
                <th className="text-white text-uppercase small fw-bold py-3 ps-4" style={{ border: "none", width: "50px", backgroundColor: "#5c67f2" }}>#</th>
                
                <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Name</th>
                <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Email</th>
                <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Phone</th>
                
                {userType === "researcher" ? (
                  <>
                    {/* Faculty column removed */}
                    <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Department</th>
                    <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Designation</th>
                  </>
                ) : (
                  <>
                    <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Department</th>
                    <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>University</th>
                    <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none" }}>Designation</th>
                  </>
                )}
                
                <th className="text-white text-uppercase small fw-bold py-3 pe-4 text-end" style={{ backgroundColor: "#5c67f2", border: "none" }}>Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {usersToShow.length > 0 ? (
                usersToShow.map((user, idx) => (
                  <tr
                    key={user.user_id || idx}
                    className="align-middle border-bottom hover-bg-light"
                    style={{ transition: "background-color 0.2s" }}
                  >
                    {/* Serial Number Cell */}
                    <td className="ps-4 py-3 fw-medium text-secondary">
                      {idx + 1}
                    </td>

                    {/* Name */}
                    <td className="py-3">
                      <div className="fw-bold text-dark">{user.user_name}</div>
                    </td>

                    {/* Email */}
                    <td className="py-3 text-secondary">{user.email}</td>

                    {/* Phone */}
                    <td className="py-3 text-secondary">{user.phone || "-"}</td>

                    {/* Conditional Columns */}
                    {userType === "researcher" ? (
                      <>
                        {/* Faculty cell removed */}
                        <td className="py-3 text-secondary">{user.department_name || "-"}</td>
                        <td className="py-3 text-secondary fw-medium">{user.designation || "-"}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 text-secondary">{user.department || "-"}</td>
                        <td className="py-3 text-secondary">{user.university || "-"}</td>
                        <td className="py-3 text-secondary fw-medium">{user.designation || "-"}</td>
                      </>
                    )}

                    {/* ACTIONS */}
                    <td className="pe-4 py-3 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        
                        {/* View */}
                        <button
                          onClick={() => handleView(user.user_id)}
                          className="btn btn-sm btn-light text-primary border-0"
                          title="View Details"
                          style={{ backgroundColor: "#eef2ff" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                          </svg>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleEdit(user.user_id)}
                          className="btn btn-sm btn-light text-warning border-0"
                          title="Edit"
                          style={{ backgroundColor: "#fff8e1" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  {/* Adjusted colSpan to match new column count */}
                  <td colSpan={userType === "researcher" ? 7 : 7} className="text-center py-5 text-muted">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}