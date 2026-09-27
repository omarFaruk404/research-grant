"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function UserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/users/${id}`);
        const json = await res.json();
        if (res.ok) {
          setData(json);
        } else {
          alert("User not found");
          router.push("/officer/dashboard/users");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  if (loading) return <div className="d-flex justify-content-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!data) return null;

  const { user, researcher, reviewer } = data;

  const getRoleBadge = (role) => {
    if (role === 2) return <span className="badge bg-info text-dark">Researcher</span>;
    if (role === 3) return <span className="badge bg-success">Reviewer</span>;
    if (role === 4) return <span className="badge bg-primary">Researcher & Reviewer</span>;
    return <span className="badge bg-secondary">Unknown</span>;
  };

  return (
    <div className="container-fluid px-4 mt-5 mb-5">
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
            <button onClick={() => router.back()} className="btn btn-light border me-3 rounded-circle shadow-sm" style={{width: 40, height: 40}}>
                <i className="bi bi-arrow-left"></i>
            </button>
            <div>
                <h2 className="fw-bold text-dark mb-0">User Details</h2>
                <p className="text-secondary small mb-0">View profile and role information</p>
            </div>
        </div>
        <Link href={`/officer/dashboard/users/${id}/edit`} className="btn btn-primary fw-bold shadow-sm">
            <i className="bi bi-pencil-square me-2"></i> Edit User
        </Link>
      </div>

      <div className="row g-4">
        
        {/* Left: Profile Card */}
        <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 text-center p-4">
                <div className="d-flex justify-content-center mb-3">
                    <div className="rounded-circle overflow-hidden border border-4 border-light shadow-sm" style={{ width: 150, height: 150 }}>
                        <img 
                            src={user.photo || "/assets/images/avatar-placeholder.png"} 
                            alt={user.name} 
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => e.target.src = "https://via.placeholder.com/150?text=User"}
                        />
                    </div>
                </div>
                <h4 className="fw-bold text-dark mb-1">{user.name}</h4>
                <p className="text-muted mb-2">{user.email}</p>
                <div className="mb-3">{getRoleBadge(user.role)}</div>
                <hr className="my-3"/>
                <div className="text-start">
                    <div className="mb-2"><small className="text-uppercase fw-bold text-secondary" style={{fontSize: '0.7rem'}}>Phone</small><div className="fw-medium text-dark">{user.phone || "N/A"}</div></div>
                    <div className="mb-2"><small className="text-uppercase fw-bold text-secondary" style={{fontSize: '0.7rem'}}>Joined Date</small><div className="fw-medium text-dark">{new Date(user.created_at).toLocaleDateString()}</div></div>
                </div>
            </div>
        </div>

        {/* Right: Role Details */}
        <div className="col-lg-8">
            
            {/* Researcher Info */}
            {(user.role === 2 || user.role === 4) && researcher && (
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className="card-header bg-white border-bottom py-3 px-4">
                        <h6 className="mb-0 fw-bold text-primary"><i className="bi bi-mortarboard me-2"></i> Researcher Profile</h6>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="text-secondary small fw-bold text-uppercase">Designation</label>
                                <div className="fw-medium text-dark">{researcher.designation || "-"}</div>
                            </div>
                            <div className="col-md-6">
                                <label className="text-secondary small fw-bold text-uppercase">Faculty</label>
                                <div className="fw-medium text-dark">{researcher.faculty_name || "-"}</div>
                            </div>
                            <div className="col-12">
                                <label className="text-secondary small fw-bold text-uppercase">Department</label>
                                <div className="fw-medium text-dark">{researcher.department_name || "-"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviewer Info */}
            {(user.role === 3 || user.role === 4) && reviewer && (
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className="card-header bg-white border-bottom py-3 px-4">
                        <h6 className="mb-0 fw-bold text-success"><i className="bi bi-spectacles me-2"></i> Reviewer Profile</h6>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="text-secondary small fw-bold text-uppercase">Designation</label>
                                <div className="fw-medium text-dark">{reviewer.designation || "-"}</div>
                            </div>
                            <div className="col-md-6">
                                <label className="text-secondary small fw-bold text-uppercase">University</label>
                                <div className="fw-medium text-dark">{reviewer.university || "N/A"}</div>
                            </div>
                            
                            {/* Logic to show Faculty/Dept based on Internal/External */}
                            <div className="col-md-6">
                                <label className="text-secondary small fw-bold text-uppercase">Faculty</label>
                                <div className="fw-medium text-dark">
                                    {/* Show Derived Internal Faculty Name OR N/A for external */}
                                    {reviewer.internal_faculty_name || <span className="text-muted fst-italic">N/A (External)</span>}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="text-secondary small fw-bold text-uppercase">Department</label>
                                <div className="fw-medium text-dark">
                                    {/* Show Internal Dept Name OR External Dept Text */}
                                    {reviewer.internal_department_name || reviewer.department || "-"}
                                </div>
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