"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [circulars, setCirculars] = useState([]);
    const [ongoingProjects, setOngoingProjects] = useState([]);
    const [completedProjects, setCompletedProjects] = useState([]);

    // --- 1. Logic: Auth & Data Fetching ---
const [latestProposal, setLatestProposal] = useState(null);

  useEffect(() => {
    async function loadKeyDates() {
      try {
        const res = await fetch("/api/circulars/latest-proposal");
        const data = await res.json();
        setLatestProposal(data.latestProposal || null);
      } catch (err) {
        console.error("Error loading key dates:", err);
      }
    }
    loadKeyDates();
  }, []);
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            setLoading(false); // No user, just show public page
            return;
        }
        try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser.user_id && parsedUser.role) {
                setUser(parsedUser);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        async function loadData() {
            try {
                const [circularRes, homeRes] = await Promise.all([
                    fetch("/api/circulars"),
                    fetch("/api/home"),
                ]);

                const circularData = await circularRes.json();
                const projectData = await homeRes.json();

                setCirculars(circularData.circulars || []);
                setOngoingProjects(projectData.ongoing || []);
                setCompletedProjects(projectData.completed || []);
            } catch (err) {
                console.error("Error loading homepage data:", err);
            }
        }
        loadData();
    }, []);

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
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;

    return (
        <>
            {/* --- CSS STYLES (From mystyle.css) --- */}
            <style jsx global>{`
        :root {
          --primary-color: #0d6efd;
          --secondary-color: #198754;
          --dark-text: #0f172a;
          --muted-text: #64748b;
          --bg-1: #f7f9ff;
          --bg-2: #f2fbf6;
          --card-border: rgba(15, 23, 42, 0.10);
          --shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
          --shadow-hover: 0 18px 40px rgba(15, 23, 42, 0.14);
          --brand-gradient: linear-gradient(135deg, #0d6efd 0%, #4f46e5 100%);
          --soft-gradient: radial-gradient(circle at top left, #e8f3ff, #ffffff 55%, #e9fff1);
        }
        body {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
          color: var(--dark-text);
          background: linear-gradient(180deg, var(--bg-1) 0%, #ffffff 35%, var(--bg-2) 100%);
          overflow-x: hidden;
        }
        .bg-pattern {
          position: fixed; inset: 0; pointer-events: none;
          background-image:
            radial-gradient(circle at 15% 20%, rgba(13,110,253,.10), transparent 45%),
            radial-gradient(circle at 85% 10%, rgba(79,70,229,.10), transparent 45%),
            radial-gradient(circle at 80% 85%, rgba(25,135,84,.10), transparent 50%);
          z-index: 0;
        }
        body > * { position: relative; z-index: 1; }

        .navbar {
          background: rgba(255, 255, 255, 0.82) !important;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }
        .navbar-brand span { font-weight: 800; letter-spacing: 0.2px; }
        .nav-link { font-weight: 600; color: #0f172a !important; }
        .nav-link:hover { color: var(--primary-color) !important; }
        
        .btn-gradient {
          background: var(--brand-gradient);
          border: none;
          color: white;
          box-shadow: 0 10px 18px rgba(13,110,253,0.20);
        }
        .btn-gradient:hover { color: white; filter: brightness(0.96); }

        #hero {
          background: var(--soft-gradient);
          padding: 7rem 0 4.5rem;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }
        #hero h1 { font-weight: 900; letter-spacing: -0.4px; }
        #hero .lead { color: var(--muted-text) !important; }
        
        .hero-highlight {
          background: rgba(13, 110, 253, 0.10);
          border: 1px solid rgba(13, 110, 253, 0.20);
          border-radius: 999px;
          padding: 0.42rem 0.95rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.92rem;
        }

        section { padding: 3.8rem 0; }
        section.bg-light-custom {
          background: linear-gradient(180deg, rgba(13,110,253,0.04) 0%, rgba(255,255,255,0.92) 100%) !important;
          border-top: 1px solid rgba(15, 23, 42, 0.06);
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }

        .info-card, .custom-card {
          border-radius: 1.1rem !important;
          border: 1px solid var(--card-border) !important;
          background: rgba(255,255,255,0.92);
          box-shadow: var(--shadow);
          transition: transform 0.20s ease, box-shadow 0.20s ease, border-color 0.20s ease;
        }
        .info-card:hover, .custom-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-hover);
          border-color: rgba(13, 110, 253, 0.35) !important;
        }

        .icon-circle {
          width: 46px; height: 46px;
          border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          background: rgba(13, 110, 253, 0.12);
          color: var(--primary-color);
          font-size: 1.25rem;
          box-shadow: inset 0 0 0 1px rgba(13,110,253,0.15);
        }

        .process-step { position: relative; padding-top: 1.5rem; }
        .process-step-number {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: var(--brand-gradient);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; margin: 0 auto 0.8rem;
          box-shadow: 0 10px 18px rgba(13,110,253,0.25);
        }
        @media (min-width: 768px) {
          .process-step::before {
            content: ""; position: absolute; top: 22px; left: 50%;
            width: 100%; height: 2px; background: rgba(15, 23, 42, 0.10);
            z-index: -1; transform: translateX(-50%);
          }
          .process-step:last-child::before { width: 50%; left: 0; transform: none; }
        }

        .timeline-badge {
          border-radius: 999px;
          padding: 0.18rem 0.8rem;
          font-size: 0.78rem;
        }

        .accordion-item {
          border-radius: 1rem !important;
          overflow: hidden;
          border: 1px solid rgba(15, 23, 42, 0.10) !important;
          box-shadow: 0 10px 24px rgba(15,23,42,0.06);
        }
        .accordion-button:focus { box-shadow: none; }
        .accordion-button { font-weight: 700; }

        .table { border-color: rgba(15, 23, 42, 0.08); }
        .table thead th { font-weight: 800; color: #0f172a; }

        footer {
          background: linear-gradient(180deg, #0b1120 0%, #070b16 100%);
          color: #cbd5f5;
          padding: 2.2rem 0 1.3rem;
          font-size: 0.95rem;
          border-top: 1px solid rgba(255,255,255,0.10);
        }
        footer a { color: #93c5fd; text-decoration: none; }
        footer a:hover { color: #ffffff; text-decoration: underline; }
      `}</style>

{/* --- NAVBAR --- */}
      {/* --- NAVBAR --- */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top px-3 shadow-sm">
        <div className="container">
            <Link href="/" className="navbar-brand d-flex align-items-center">
                <i className="bi bi-mortarboard-fill me-2" style={{ color: '#5c67f2' }}></i>
                <span className="fw-bold">UoB Research Grants</span>
            </Link>
            
            <button 
                className="navbar-toggler" 
                type="button" 
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="mainNavbar">
                <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                        <Link href="/circulars" className="nav-link fw-semibold active" style={{color: '#5c67f2'}}>Notices</Link>
                    </li>
                    <li className="nav-item"><Link href="/#about" className="nav-link">About</Link></li>
                    <li className="nav-item"><Link href="/#process" className="nav-link">Grant Process</Link></li>
                    <li className="nav-item"><Link href="/#eligibility" className="nav-link">Eligibility</Link></li>
                    <li className="nav-item"><Link href="/#contact" className="nav-link">Contact</Link></li>
                </ul>
                <button 
                    onClick={goToDashboard} 
                    className="btn ms-lg-3 d-none d-lg-inline-flex px-4 py-2 rounded-pill fw-bold text-white shadow-sm"
                    style={{ backgroundColor: '#5c67f2' }}
                >
                    {user ? "Dashboard" : "Login"}
                </button>
            </div>
        </div>
      </nav>

            {/* --- HERO SECTION --- */}
            <header id="hero" className="position-relative d-flex align-items-center" style={{ minHeight: "85vh", padding: "0" }}>

                {/* 1. Background Image */}
                <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                        backgroundImage: "url('/assets/background/university.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        zIndex: 0
                    }}
                ></div>

                {/* 2. Dark Overlay (for text readability) */}
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-75" style={{ zIndex: 1 }}></div>

                {/* 3. Content */}
                <div className="container position-relative" style={{ zIndex: 2 }}>
                    <div className="row justify-content-center text-center">
                        <div className="col-lg-10 col-xl-8">


                            <h1 className="display-3 fw-bold text-white mb-4">
                                Research Project <br /> Grant Portal
                            </h1>

                            <p className="text-white fw-bold mb-5 mx-auto" style={{ maxWidth: "750px" }}>
                                A centralized platform for University of Barishal faculty and researchers to submit, track, and manage research project grants — from proposal submission to final fund release.
                            </p>

                            <div className="d-flex flex-wrap justify-content-center gap-3">
                                <a href="#circulars" className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-lg border-0"
                                    style={{ background: "linear-gradient(135deg, #0d6efd 0%, #4f46e5 100%)" }}>
                                    View Current Call for Proposals
                                </a>
                                <a href="#process" className="btn btn-outline-light btn-lg rounded-pill px-5 fw-bold">
                                    Understand the Grant Process
                                </a>
                            </div>

                        </div>
                    </div>
                </div>
            </header>

            {/* --- ABOUT SECTION --- */}
            <section id="about">
                <div className="container">
                    <div className="row gy-4 align-items-center">
                        <div className="col-lg-6">
                            <h2 className="mb-3 fw-bold">About the Research Project Grant</h2>
                            <p className="text-muted">
                                The Research Project Grant scheme is an institutional initiative of the University of Barishal to foster a vibrant research culture across all departments and faculties. It supports innovative, high-impact research ideas from early-career and experienced researchers.
                            </p>
                            <p className="text-muted mb-3">
                                Through this portal, Principal Investigators (PIs) can submit new project proposals, track evaluation status, upload interim and final reports, and initiate fund release requests in a transparent, structured workflow.
                            </p>
                            <ul className="list-unstyled mb-3 text-muted">
                                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Transparent and standardized evaluation process</li>
                                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Supports interdisciplinary and collaborative research</li>
                                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Integrated tracking from proposal to final fund release</li>
                            </ul>
                        </div>
                        <div className="col-lg-6">
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <div className="info-card p-3 h-100 text-center">
                                        <h3 className="fw-bold mb-0 text-primary">3</h3>
                                        <small className="text-muted">Major Stages</small>
                                        <p className="small mt-2 mb-0">Proposal & Evaluation, Implementation, Final Reporting.</p>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="info-card p-3 h-100 text-center">
                                        <h3 className="fw-bold mb-0 text-success">Multiple</h3>
                                        <small className="text-muted">Funding Categories</small>
                                        <p className="small mt-2 mb-0">Seed grants, thematic calls, and collaborative projects.</p>
                                    </div>
                                </div>
                                <div className="col-sm-12">
                                    <div className="info-card p-3 h-100">
                                        <div className="d-flex align-items-start">
                                            <div className="icon-circle me-3"><i className="bi bi-people-fill"></i></div>
                                            <div>
                                                <h6 className="mb-1 fw-bold">Stakeholders</h6>
                                                <p className="small mb-0 text-muted">Principal Investigators, Co-investigators, Dept. Research Committees, Central Research Committee, Accounts Section, and Admin.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
{/* --- KEY DATES SECTION --- */}
      <section id="key-dates" className="bg-light-custom">
        <div className="container">
            <div className="row gy-4 align-items-center">
                <div className="col-lg-5">
                    <h2 className="mb-3 fw-bold">
                        Key Dates {latestProposal?.fiscal_year ? `(${latestProposal.fiscal_year})` : "(Current Cycle)"}
                    </h2>
                    <p className="text-muted">Tentative schedule to help researchers plan their work.</p>
                    <ul className="list-unstyled">
                        {[
                            { phase: "Phase 1", color: "primary", text: "Call announcement & guidelines" },
                            { phase: "Phase 2", color: "secondary", text: "Online proposal submission window" },
                            { phase: "Phase 3", color: "warning", text: "Review, evaluation, and decision" },
                            { phase: "Phase 4", color: "success", text: "Project start & first fund release" },
                            { phase: "Phase 5", color: "info", text: "Final report & final fund release" }
                        ].map((item, i) => (
                            <li key={i} className="mb-2">
                                <span className={`timeline-badge text-bg-${item.color} text-white`}>{item.phase}</span>
                                <span className="ms-2 text-muted small fw-medium">{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="col-lg-7">
                    <div className="custom-card p-0 overflow-hidden">
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-3">Stage</th>
                                        <th>Description</th>
                                        <th className="pe-3">Timeline</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* 1. Call Opening (Dynamic) */}
                                    <tr>
                                        <td className="ps-3 fw-bold text-dark">Call Opening</td>
                                        <td className="text-muted small">
                                            {latestProposal ? latestProposal.title : "Publication of circular & guidelines"}
                                        </td>
                                        <td className="pe-3 text-muted small">
                                            {latestProposal && latestProposal.notice_published_date
                                                ? new Date(latestProposal.notice_published_date).toLocaleDateString() 
                                                : "To be announced"}
                                        </td>
                                    </tr>

                                    {/* 2. Submission Deadline (Dynamic) */}
                                    <tr>
                                        <td className="ps-3 fw-bold text-dark">Submission Deadline</td>
                                        <td className="text-muted small">Last date for online submission</td>
                                        <td className="pe-3 text-muted small">
                                            {latestProposal && latestProposal.submission_deadline
                                                ? new Date(latestProposal.submission_deadline).toLocaleDateString() 
                                                : "To be announced"}
                                        </td>
                                    </tr>

                                    {/* 3. Static Rows */}
                                    {[
                                        { stage: "Evaluation Period", desc: "Peer review and committee evaluation", time: "To be announced" },
                                        { stage: "Result Declaration", desc: "Notification to selected projects", time: "To be announced" },
                                        { stage: "Final Report", desc: "Submission of technical report", time: "Project duration" }
                                    ].map((row, i) => (
                                        <tr key={i}>
                                            <td className="ps-3 fw-bold text-dark">{row.stage}</td>
                                            <td className="text-muted small">{row.desc}</td>
                                            <td className="pe-3 text-muted small">{row.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>
            {/* --- GRANT PROCESS SECTION --- */}
            <section id="process" className="bg-light-custom">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold">Grant Process Overview</h2>
                        <p className="text-muted mb-0">Understanding the complete lifecycle of a research project under this scheme.</p>
                    </div>
                    <div className="row text-center gy-4">
                        {[
                            { num: 1, title: "Call Announcement", text: "University announces themes, budget limits, and timelines." },
                            { num: 2, title: "Proposal Submission", text: "PIs submit online proposals with work plan, budget & docs." },
                            { num: 3, title: "Review & Evaluation", text: "Proposals evaluated by experts based on quality & impact." },
                            { num: 4, title: "Award & Fund Release", text: "Selected projects receive approval letter and funds." },
                            { num: 5, title: "Implementation & Report", text: "Conduct research, submit reports, and request final fund." }
                        ].map((step, idx) => (
                            <div key={idx} className="col-md-2 col-sm-6 mx-md-auto process-step">
                                <div className="process-step-number">{step.num}</div>
                                <h6 className="fw-bold">{step.title}</h6>
                                <p className="small text-muted">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- ELIGIBILITY SECTION --- */}
            <section id="eligibility">
                <div className="container">
                    <div className="row gy-4">
                        <div className="col-lg-6">
                            <h2 className="mb-3 fw-bold">Eligibility Criteria</h2>
                            <p className="text-muted">The following are general guidelines. Detailed conditions will be specified in each call.</p>
                            <ul className="list-group list-group-flush bg-transparent">
                                {[
                                    "Applicants must be full-time faculty members or approved researchers.",
                                    "Each project must have a designated Principal Investigator (PI).",
                                    "Interdepartmental and multidisciplinary projects are encouraged.",
                                    "PIs must comply with university rules on research ethics and finance.",
                                    "A PI may hold a limited number of concurrent internally-funded projects."
                                ].map((item, i) => (
                                    <li key={i} className="list-group-item bg-transparent ps-0 border-0 d-flex">
                                        <i className="bi bi-dot fs-4 text-primary me-2" style={{ lineHeight: 0.7 }}></i> <span className="text-muted">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-lg-6">
                            <h2 className="mb-3 fw-bold">What Can Be Funded?</h2>
                            <div className="row g-3">
                                {[
                                    { title: "Research Equipment", desc: "Small and medium-scale equipment directly related to objectives.", icon: "bi-laptop" },
                                    { title: "Consumables", desc: "Lab consumables, software licenses, data acquisition costs.", icon: "bi-box-seam" },
                                    { title: "Research Assistants", desc: "Support for student assistants or project staff.", icon: "bi-person-plus" },
                                    { title: "Fieldwork & Travel", desc: "Field visits, data collection, and dissemination activities.", icon: "bi-geo-alt" }
                                ].map((item, i) => (
                                    <div key={i} className="col-sm-6">
                                        <div className="info-card p-3 h-100">
                                            <h6 className="mb-1 fw-bold">{item.title}</h6>
                                            <p className="small mb-0 text-muted">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="small text-muted mt-3 mb-0">
                                <i className="bi bi-exclamation-circle me-1"></i> Exact funding limits and ineligible items will be mentioned in each call document.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- DYNAMIC PUBLIC DATA SECTION (Inserted here) --- */}
            <section id="circulars" className="bg-light-custom">
                <div className="container">


                    {/* 2. Projects Data Grid */}
                    <div className="row g-4">
                        <div className="col-lg-6">
                            <div className="custom-card h-100 p-0 overflow-hidden">
                                <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
                                    <h6 className="fw-bold mb-0 text-primary"><i className="bi bi-hourglass-split me-2"></i>Ongoing Projects</h6>
                                    <span className="badge bg-primary-subtle text-primary rounded-pill">{ongoingProjects.length}</span>
                                </div>
                                <div className="table-responsive" style={{ maxHeight: "350px" }}>
                                    <table className="table table-hover align-middle mb-0 small">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="ps-3">Project Title</th>
                                                <th>Researcher</th>
                                                <th className="text-end pe-3">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ongoingProjects.map((p) => (
                                                <tr key={p.id}>
                                                    <td className="ps-3 fw-medium text-truncate" style={{ maxWidth: "200px" }} title={p.title}>{p.title}</td>
                                                    <td>{p.researcher_name}</td>
                                                    <td className="text-end pe-3 text-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {ongoingProjects.length === 0 && <tr><td colSpan="3" className="text-center py-3">No ongoing projects.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="custom-card h-100 p-0 overflow-hidden">
                                <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
                                    <h6 className="fw-bold mb-0 text-success"><i className="bi bi-check-circle-fill me-2"></i>Completed Projects</h6>
                                    <span className="badge bg-success-subtle text-success rounded-pill">{completedProjects.length}</span>
                                </div>
                                <div className="table-responsive" style={{ maxHeight: "350px" }}>
                                    <table className="table table-hover align-middle mb-0 small">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="ps-3">Project Title</th>
                                                <th>Researcher</th>
                                                <th className="text-end pe-3">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {completedProjects.map((p) => (
                                                <tr key={p.id}>
                                                    <td className="ps-3 fw-medium text-truncate" style={{ maxWidth: "200px" }} title={p.title}>{p.title}</td>
                                                    <td>{p.researcher_name}</td>
                                                    <td className="text-end pe-3 text-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {completedProjects.length === 0 && <tr><td colSpan="3" className="text-center py-3">No completed projects.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* --- RESOURCES SECTION --- */}
            <section id="resources">
                <div className="container">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold">Guidelines & Resources</h2>
                        <p className="text-muted">Documents to help you prepare a competitive proposal.</p>
                    </div>
                    <div className="row g-3">
                        {[
                            { title: "Call for Proposals", icon: "bi-file-earmark-text-fill", desc: "Download the latest circular, scope, and priority areas.", link: "Download PDF" },
                            { title: "Proposal Template", icon: "bi-journal-text", desc: "Standard template for work plan, methodology, and outcomes.", link: "Download Template" },
                            { title: "Financial Guidelines", icon: "bi-cash-coin", desc: "Rules for budgeting, allowable expenses, and reporting.", link: "Download Guidelines" }
                        ].map((res, i) => (
                            <div key={i} className="col-md-4">
                                <div className="info-card p-4 h-100 d-flex flex-column">
                                    <div className="d-flex align-items-center mb-3">
                                        <i className={`bi ${res.icon} me-2 text-primary fs-4`}></i>
                                        <h6 className="mb-0 fw-bold">{res.title}</h6>
                                    </div>
                                    <p className="small text-muted mb-3">{res.desc}</p>
                                    <a href="#" className="mt-auto small fw-bold text-decoration-none text-primary">
                                        {res.link} <i className="bi bi-download ms-1"></i>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FAQ SECTION --- */}
            <section id="faq" className="bg-light-custom">
                <div className="container">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold">Frequently Asked Questions</h2>
                        <p className="text-muted">Quick answers for researchers and administrators.</p>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="accordion" id="faqAccordion">
                                {[
                                    { q: "Who can submit a proposal through this portal?", a: "Only eligible faculty members and approved researchers of the University of Barishal can submit proposals." },
                                    { q: "Do I need an account to view information on this page?", a: "No. This public home page is viewable without logging in. However, submission requires authentication." },
                                    { q: "How are proposals evaluated?", a: "Proposals are evaluated based on scientific merit, feasibility, alignment with priorities, and budget justification by expert committees." },
                                    { q: "When is the final fund released?", a: "After completion of the project and approval of the final technical and financial reports." }
                                ].map((faq, i) => (
                                    <div key={i} className="accordion-item mb-3 border-0 shadow-sm">
                                        <h2 className="accordion-header" id={`faqHeading${i}`}>
                                            <button className="accordion-button collapsed fw-bold text-dark" type="button" data-bs-toggle="collapse" data-bs-target={`#faqCollapse${i}`}>
                                                {faq.q}
                                            </button>
                                        </h2>
                                        <div id={`faqCollapse${i}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                            <div className="accordion-body text-muted">
                                                {faq.a}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CONTACT SECTION --- */}
            <section id="contact">
                <div className="container">
                    <div className="row gy-4">
                        <div className="col-lg-6">
                            <h2 className="fw-bold">Contact & Support</h2>
                            <p className="text-muted">For queries related to the Research Project Grant scheme or portal usage.</p>
                            <ul className="list-unstyled text-muted">
                                <li className="mb-2"><i className="bi bi-building me-2 text-primary"></i> <strong>Office:</strong> Research & Development Cell, University of Barishal</li>
                                <li className="mb-2"><i className="bi bi-envelope me-2 text-primary"></i> <strong>Email:</strong> <a href="mailto:research.grants@bu.ac.bd" className="text-decoration-none">research.grants@bu.ac.bd</a></li>
                                <li className="mb-2"><i className="bi bi-telephone me-2 text-primary"></i> <strong>Phone:</strong> +880-XXX-XXXXXXX</li>
                            </ul>
                        </div>
                        <div className="col-lg-6">
                            <div className="info-card p-4 h-100">
                                <h6 className="mb-3 fw-bold">For Stakeholders</h6>
                                <ul className="small text-muted mb-3 ps-3">
                                    <li>Departmental Research Committees (Monitoring)</li>
                                    <li>Central Research Committee (Evaluation)</li>
                                    <li>Finance Section (Fund Disbursement)</li>
                                    <li>University Leadership (Reports & Analytics)</li>
                                </ul>
                                <p className="small text-muted mb-0 fst-italic">Dashboard features are available after login.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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
        </>
    );
}