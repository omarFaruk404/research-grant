"use client";
import { useState, useEffect } from "react";

export default function OfficerDashboard() {
  const [stats, setStats] = useState(null);
  const [fiscalYear, setFiscalYear] = useState("");
  const [allYears, setAllYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/officer/stats${fiscalYear ? `?fiscal_year=${fiscalYear}` : ""}`);
        const data = await res.json();
        setStats(data);
        if (data.availableYears) setAllYears(data.availableYears);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [fiscalYear]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <div className="spinner-border text-primary" style={{width: "3rem", height: "3rem"}} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* 1. Header & Filters */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="fw-bold text-dark mb-1">Dashboard Overview</h2>
          <p className="text-secondary mb-0">Welcome back, Officer. Here is the current status of research activities.</p>
        </div>
        
        <div className="d-flex align-items-center bg-white p-2 rounded-3 shadow-sm border">
          <span className="text-secondary small fw-bold text-uppercase px-2">Fiscal Year:</span>
          <select
            className="form-select form-select-sm border-0 bg-light fw-bold text-primary"
            style={{ width: "140px", cursor: "pointer" }}
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
          >
            <option value="">All Time</option>
            {allYears.map((fy) => (
              <option key={fy} value={fy}>{fy}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="row g-4 mb-5">
        
        {/* Row 1: People & Initial Stages */}
        
        {/* Researchers */}
        <StatCard 
          title="Researchers" 
          value={stats.totalResearchers || 0} 
          icon="bi-people-fill" 
          color="primary" 
          bg="bg-primary-subtle"
        />

        {/* Reviewers */}
        <StatCard 
          title="Reviewers" 
          value={stats.totalReviewers || 0} 
          icon="bi-person-check-fill" 
          color="dark" 
          bg="bg-secondary-subtle"
        />

        {/* Submitted Proposals (NEW) */}
        <StatCard 
          title="Submitted Proposals" 
          value={stats.submittedProjects || 0} 
          icon="bi-file-earmark-plus-fill" 
          color="primary" 
          bg="bg-primary-subtle"
        />

        {/* Under Review (NEW) */}
        <StatCard 
          title="Under Review" 
          value={stats.underReviewProjects || 0} 
          icon="bi-search" 
          color="info" 
          bg="bg-info-subtle"
        />

        {/* Row 2: Active & Completed Stages */}

        {/* Ongoing Projects */}
        <StatCard 
          title="Ongoing Projects" 
          value={stats.ongoingProjects || 0} 
          icon="bi-hourglass-split" 
          color="warning" 
          bg="bg-warning-subtle"
        />

        {/* Completed Projects */}
        <StatCard 
          title="Completed Projects" 
          value={stats.completedProjects || 0} 
          subValue={`${stats.completedThisYear || 0} this year`}
          icon="bi-check-circle-fill" 
          color="success" 
          bg="bg-success-subtle"
        />

        {/* Pending Reviews (Action Item) */}
        <StatCard 
          title="Pending Reviews" 
          value={stats.pendingReviews || 0} 
          icon="bi-clipboard-data" 
          color="danger" 
          bg="bg-danger-subtle"
        />

        {/* Rejected (Optional Filler to keep grid balanced) */}
        {/* <StatCard 
          title="Rejected Proposals" 
          value={stats.rejectedProjects || 0} 
          icon="bi-x-circle-fill" 
          color="secondary" 
          bg="bg-light"
        /> */}
      </div>

      {/* 3. Recent Activity Section */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="mb-0 fw-bold d-flex align-items-center">
                <i className="bi bi-activity text-primary me-2"></i> Recent Activity
              </h5>
            </div>
            <div className="card-body p-0">
              {stats.recentActivities?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.recentActivities.map((activity, index) => (
                    <div key={index} className="list-group-item px-4 py-3 border-bottom-0 border-top">
                      <div className="d-flex align-items-start">
                        <div className="me-3 mt-1 text-primary">
                          <i className="bi bi-dot fs-3"></i>
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 text-dark fw-medium">{activity.description}</p>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i> {activity.date}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary opacity-50"></i>
                  No recent activities found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// --- Helper Component: Stat Card ---
function StatCard({ title, value, subValue, icon, color, bg, isCurrency }) {
  return (
    <div className="col-xl-3 col-md-6">
      <div className="card border-0 shadow-sm h-100 rounded-4 stat-card transition-all">
        <div className="card-body p-4 d-flex align-items-center justify-content-between">
          <div>
            <p className="text-secondary text-uppercase small fw-bold mb-1 tracking-wide">{title}</p>
            <h3 className={`fw-bold mb-0 text-${color} ${isCurrency ? 'fs-4' : 'display-6'}`}>
              {value}
            </h3>
            {subValue && <small className="text-muted mt-1 d-block"><i className="bi bi-arrow-up-right small me-1"></i>{subValue}</small>}
          </div>
          <div className={`icon-box rounded-circle d-flex align-items-center justify-content-center ${bg} text-${color}`} style={{width: '60px', height: '60px'}}>
            <i className={`bi ${icon} fs-3`}></i>
          </div>
        </div>
      </div>
      <style jsx>{`
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 .5rem 1rem rgba(0,0,0,.1) !important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}