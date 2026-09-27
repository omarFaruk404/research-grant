"use client";

import { useState, useEffect } from "react";

export default function ReviewerDashboard() {
  const [stats, setStats] = useState(null);
  const [fiscalYear, setFiscalYear] = useState("");
  const [allYears, setAllYears] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get User ID from Local Storage
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      if (parsed.reviewer_id) {
        loadData(parsed.reviewer_id);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [fiscalYear]);

  async function loadData(reviewerId) {
    try {
      const res = await fetch(`/api/reviewer/stats?reviewer_id=${reviewerId}${fiscalYear ? `&fiscal_year=${fiscalYear}` : ""}`);
      const data = await res.json();
      
      if (data.success) {
        setStats(data.stats);
        if (data.availableYears) setAllYears(data.availableYears);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <div className="spinner-border text-primary" style={{width: "3rem", height: "3rem"}} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-5 text-center text-muted">Unable to load dashboard data.</div>;
  }

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* 1. Header & Filters */}
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="fw-bold text-dark mb-1">Reviewer Dashboard</h2>
          <p className="text-secondary mb-0">Welcome back, {user?.name || "Reviewer"}. Here is your review performance overview.</p>
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
        
        {/* Pending Reviews (Action Item - Highlighted Red) */}
        <StatCard 
          title="Pending Reviews" 
          value={stats.pendingReviews || 0} 
          icon="bi-hourglass-split" 
          color="danger" 
          bg="bg-danger-subtle"
        />

        {/* Completed Reviews */}
        <StatCard 
          title="Completed Reviews" 
          value={stats.completedReviews || 0} 
          icon="bi-check-all" 
          color="success" 
          bg="bg-success-subtle"
        />

        {/* Total Earnings */}
        <StatCard 
          title="Total Earned" 
          value={`৳ ${stats.totalEarnings?.toLocaleString() || 0}`} 
          icon="bi-cash-stack" 
          color="primary" 
          bg="bg-primary-subtle"
          isCurrency={true}
        />

        {/* Average Turnaround (Optional Metric) */}
        <StatCard 
          title="Pending Payments" 
          value={`৳ ${stats.pendingEarnings?.toLocaleString() || 0}`} 
          icon="bi-wallet2" 
          color="warning" 
          bg="bg-warning-subtle"
          isCurrency={true}
        />
      </div>

      {/* 3. Recent Activity Section */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="mb-0 fw-bold d-flex align-items-center">
                <i className="bi bi-clock-history text-primary me-2"></i> Recent Review Activity
              </h5>
            </div>
            <div className="card-body p-0">
              {stats.recentActivities?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.recentActivities.map((activity, index) => (
                    <div key={index} className="list-group-item px-4 py-3 border-bottom-0 border-top">
                      <div className="d-flex align-items-start">
                        <div className="me-3 mt-1 text-primary">
                          <i className={`bi ${activity.type === 'submitted' ? 'bi-check-circle-fill text-success' : 'bi-file-earmark-text-fill text-primary'} fs-4`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 text-dark fw-medium">{activity.description}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                <i className="bi bi-calendar-event me-1"></i> {new Date(activity.date).toLocaleDateString()}
                            </small>
                            <span className="badge bg-light text-secondary border">{activity.project_code}</span>
                          </div>
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
            <h3 className={`fw-bold mb-0 text-${color} ${isCurrency ? 'fs-3' : 'display-6'}`}>
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