"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function SingleCircularPage() {
  const params = useParams(); // Get ID from URL
  const router = useRouter();
  
  const [circular, setCircular] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  // --- Fetch Data ---
  useEffect(() => {
    // 1. Fetch User Session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.user_id) setUser(parsedUser);
      } catch (err) {}
    }

    // 2. Fetch Circular Details
    async function fetchCircular() {
      if (!params.id) return;
      try {
        // UPDATED: Using dynamic route /api/circulars/[id]
        const res = await fetch(`/api/circulars/${params.id}`);
        
        if (!res.ok) {
            console.error("Circular not found");
            setLoading(false);
            return;
        }

        const data = await res.json();
        
        // Handle if API returns { circular: {...} } or just {...}
        const item = data.circular || data;
        setCircular(item);

      } catch (error) {
        console.error("Failed to load circular", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCircular();
  }, [params.id]);

  // --- Helpers ---
  const getTypeBadgeClass = (type) => {
    if (type === "proposal") return "bg-success-subtle text-success";
    if (type === "notice") return "bg-primary-subtle text-primary";
    return "bg-secondary-subtle text-secondary";
  };

  const goToDashboard = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    switch (user.role) {
      case 1: router.push("/officer/dashboard"); break;
      case 2: router.push("/researcher/dashboard"); break;
      case 3: router.push("/reviewer/dashboard"); break;
      case 4: router.push("/researcher/dashboard"); break;
      default: router.push("/login");
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;

  if (!circular) return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-muted">
        <i className="bi bi-exclamation-circle display-1 mb-3 opacity-25"></i>
        <h3>Circular Not Found</h3>
        <Link href="/circulars" className="btn btn-outline-primary mt-3">Back to List</Link>
    </div>
  );

  return (
    <div className="d-flex flex-column min-vh-100">
      
      {/* --- CSS STYLES --- */}
      <style jsx global>{`
        :root {
          --primary-color: #5c67f2;
          --bg-soft: #f8f9fa;
        }
        body {
          background-color: var(--bg-soft);
        }
        .header-gradient {
          background: linear-gradient(135deg, #5c67f2 0%, #0a58ca 100%);
          color: white;
          padding: 8rem 0 4rem;
          margin-top: 0;
          clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
        }
        .detail-card {
            margin-top: -60px;
            background: white;
            border-radius: 1rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            border: none;
        }
        .meta-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6c757d;
            font-weight: 600;
            margin-bottom: 0.25rem;
        }
        .nav-link:hover {
            color: #5c67f2 !important;
        }
      `}</style>

      {/* --- NAVBAR --- */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top px-3 shadow-sm">
        <div className="container">
            <Link href="/" className="navbar-brand d-flex align-items-center">
                <i className="bi bi-mortarboard-fill me-2" style={{ color: '#5c67f2' }}></i>
                <span className="fw-bold">UoB Research Grants</span>
            </Link>
            <button className="navbar-toggler" type="button" onClick={() => setIsNavCollapsed(!isNavCollapsed)}>
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="mainNavbar">
                <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li className="nav-item"><Link href="/circulars" className="nav-link fw-semibold active" style={{color: '#5c67f2'}}>Notices</Link></li>
                    <li className="nav-item"><Link href="/#about" className="nav-link">About</Link></li>
                    <li className="nav-item"><Link href="/#process" className="nav-link">Grant Process</Link></li>
                    <li className="nav-item"><Link href="/#eligibility" className="nav-link">Eligibility</Link></li>
                    <li className="nav-item"><Link href="/#contact" className="nav-link">Contact</Link></li>
                </ul>
                <button onClick={goToDashboard} className="btn ms-lg-3 d-none d-lg-inline-flex px-4 py-2 rounded-pill fw-bold text-white shadow-sm" style={{ backgroundColor: '#5c67f2' }}>
                    {user ? "Dashboard" : "Login"}
                </button>
            </div>
        </div>
      </nav>

      {/* --- HEADER BACKGROUND --- */}
      <div className="header-gradient text-center">
        <div className="container"></div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="container pb-5 flex-grow-1">
        <div className="row justify-content-center">
            <div className="col-lg-10">
                
                {/* Back Button */}
                <div className="mb-3">
                    <Link href="/circulars" className="text-decoration-none text-white-50 fw-bold small">
                        <i className="bi bi-arrow-left me-1"></i> BACK TO LIST
                    </Link>
                </div>

                {/* Main Card */}
                <div className="card detail-card p-4 p-md-5">
                    
                    {/* Top Meta Tags */}
                    <div className="d-flex flex-wrap gap-2 mb-3">
                        <span className={`badge rounded-pill px-3 py-2 fw-bold ${getTypeBadgeClass(circular.circular_type)}`}>
                            {circular.circular_type ? circular.circular_type.toUpperCase() : "UNKNOWN"}
                        </span>
                        {circular.notice_code && (
                            <span className="badge bg-light text-secondary border">Code: {circular.notice_code}</span>
                        )}
                        {circular.year_label && (
                             <span className="badge bg-light text-secondary border">FY: {circular.year_label}</span>
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="fw-bold text-dark mb-4 display-6">{circular.title}</h2>

                    <hr className="opacity-10 mb-4" />

                    {/* Details Grid */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center">
                                <div className="bg-light rounded-circle p-3 me-3 text-primary">
                                    <i className="bi bi-calendar-event fs-4"></i>
                                </div>
                                <div>
                                    <div className="meta-label">Published Date</div>
                                    <div className="fw-bold text-dark">
                                        {circular.notice_published_date ? new Date(circular.notice_published_date).toLocaleDateString("en-GB", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {circular.circular_type === 'proposal' && (
                            <div className="col-md-6">
                                <div className="d-flex align-items-center">
                                    <div className="bg-danger-subtle rounded-circle p-3 me-3 text-danger">
                                        <i className="bi bi-hourglass-split fs-4"></i>
                                    </div>
                                    <div>
                                        <div className="meta-label text-danger">Submission Deadline</div>
                                        {/* UPDATED: Show Date or N/A */}
                                        <div className="fw-bold text-danger">
                                            {circular.proposal_submission_deadline ? new Date(circular.proposal_submission_deadline).toLocaleDateString("en-GB", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {circular.description && (
                        <div className="mb-5">
                            <h5 className="fw-bold mb-3">Description</h5>
                            <div className="text-secondary lh-lg">
                                {circular.description}
                            </div>
                        </div>
                    )}

                    {/* Attachments Section */}
                    <div className="bg-light rounded-4 p-4 border border-dashed">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                            <div>
                                <h5 className="fw-bold mb-1">Official Document</h5>
                                <p className="text-muted small mb-0">Download the official circular for full details.</p>
                                {/* UPDATED: Show Filename */}
                                {circular.attachment && (
                                    <div className="mt-2 text-primary small d-flex align-items-center">
                                        <i className="bi bi-paperclip me-1"></i>
                                        {circular.attachment}
                                    </div>
                                )}
                            </div>
                            
                            {circular.attachment ? (
                                <a 
                                    href={`/uploads/circulars/${circular.attachment}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-sm"
                                    style={{ backgroundColor: '#5c67f2', borderColor: '#5c67f2' }}
                                >
                                    {/* UPDATED: Button Text */}
                                    <i className="bi bi-download me-2"></i> Download
                                </a>
                            ) : (
                                <button className="btn btn-secondary btn-lg rounded-pill px-5" disabled>
                                    No Attachment
                                </button>
                            )}
                        </div>
                    </div>

                    {/* CTA for Proposals */}
                    {circular.circular_type === 'proposal' && (
                         <div className="mt-5 text-center">
                            <p className="text-muted mb-3">Ready to submit your research proposal?</p>
                            <button 
                                onClick={goToDashboard} 
                                className="btn btn-outline-dark rounded-pill px-5 py-2 fw-semibold"
                            >
                                {user ? "Go to Dashboard to Apply" : "Login to Apply"}
                            </button>
                         </div>
                    )}

                </div>
            </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-dark text-light py-4 border-top border-secondary mt-auto">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <div className="text-white-50">
              &copy; {new Date().getFullYear()} University of Barishal — Research Project Grant Portal
            </div>
            <div className="small">
              <Link href="/credits" className="text-decoration-none text-white hover-underline">
                Credits
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}