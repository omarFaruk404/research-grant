"use client";

import { useEffect, useState } from "react";

export default function ResearcherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    fetch(`/api/researcher/dashboard?user_id=${parsedUser.user_id}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: "60vh"}}>
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  );
  
  if (!data) return <div className="p-5 text-center text-danger">Failed to load dashboard data</div>;

  // Configuration for the 6 Stats Cards to keep your loop structure
  const statsConfig = [
    { label: "Total Projects", value: data.projects.total, icon: "bi-folder2-open", color: "primary", bg: "bg-primary-subtle" },
    { label: "Proposal Submitted", value: data.projects.proposal_submitted, icon: "bi-send", color: "info", bg: "bg-info-subtle" },
    { label: "Under Review", value: data.projects.under_review, icon: "bi-hourglass-split", color: "warning", bg: "bg-warning-subtle" },
    { label: "Ongoing", value: data.projects.ongoing, icon: "bi-play-circle-fill", color: "primary", bg: "bg-primary-subtle" },
    { label: "Report Submitted", value: data.projects.final_report_submitted, icon: "bi-file-earmark-check", color: "info", bg: "bg-info-subtle" },
    { label: "Completed", value: data.projects.completed, icon: "bi-check-circle-fill", color: "success", bg: "bg-success-subtle" },
  ];

  return (
    <div className="container-fluid px-4 py-5">
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Dashboard</h2>
          <p className="text-secondary mb-0">Overview of your research activity.</p>
        </div>
        <div className="d-flex align-items-center bg-white p-2 rounded-3 shadow-sm border px-3">
            <i className="bi bi-person-circle text-primary me-2 fs-5"></i>
            <span className="fw-bold text-dark">{user?.name}</span>
        </div>
      </div>

      {/* 1. Project Stats (Grid of 6) - Layout Preserved */}
      <div className="row g-4">
        {statsConfig.map((stat, index) => (
          <div className="col-md-4" key={stat.label}>
            <div className="card border-0 shadow-sm rounded-4 h-100 transition-hover">
              <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-secondary small fw-bold text-uppercase mb-1">{stat.label}</p>
                  <h3 className={`fw-bold mb-0 text-${stat.color}`}>{stat.value || 0}</h3>
                </div>
                <div className={`rounded-circle d-flex align-items-center justify-content-center ${stat.bg} text-${stat.color}`} style={{width: '50px', height: '50px'}}>
                  <i className={`bi ${stat.icon} fs-4`}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>



      {/* 3. Final Reports - Layout Preserved */}
      <div className="card mt-4 border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-file-earmark-bar-graph me-2 text-primary"></i> Final Reports</h5>
        </div>
        <div className="card-body p-4">
            <div className="d-flex gap-4">
                <div className="d-flex align-items-center p-3 rounded-3 bg-success-subtle flex-grow-1 border border-success-subtle">
                    <div className="me-3 bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: 40, height: 40}}>
                        <i className="bi bi-check-lg"></i>
                    </div>
                    <div>
                        <div className="fs-4 fw-bold text-dark">{data.reports.accepted || 0}</div>
                        <div className="small text-success fw-bold">Accepted</div>
                    </div>
                </div>
                
                <div className="d-flex align-items-center p-3 rounded-3 bg-danger-subtle flex-grow-1 border border-danger-subtle">
                    <div className="me-3 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: 40, height: 40}}>
                        <i className="bi bi-x-lg"></i>
                    </div>
                    <div>
                        <div className="fs-4 fw-bold text-dark">{data.reports.rejected || 0}</div>
                        <div className="small text-danger fw-bold">Rejected</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 4. Recent Activity - Layout Preserved */}
      <div className="card mt-4 border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-clock-history me-2 text-secondary"></i> Recent Activity</h5>
        </div>
        <div className="card-body p-0">
          {data.recentActivities.length === 0 ? (
            <div className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted opacity-25"></i>
                <p className="text-muted mt-2">No recent activity found.</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {data.recentActivities.map((a, i) => (
                <div key={i} className="list-group-item px-4 py-3 border-light">
                  <div className="d-flex align-items-start">
                    <div className="me-3 mt-1 text-primary">
                        <i className="bi bi-activity"></i>
                    </div>
                    <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-dark fw-medium">{a.description}</span>
                            <small className="text-muted bg-light px-2 py-1 rounded border">
                                <i className="bi bi-calendar-event me-1"></i> {a.date}
                            </small>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .transition-hover:hover {
            transform: translateY(-3px);
            box-shadow: 0 .5rem 1rem rgba(0,0,0,.1) !important;
            transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}