"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CircularPage() {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [user, setUser] = useState(null);

  // Navbar toggle state
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const router = useRouter();

  // --- 1. Fetch Data ---
  useEffect(() => {
    async function fetchCirculars() {
      try {
        const res = await fetch("/api/circulars");
        const data = await res.json();
        setCirculars(Array.isArray(data) ? data : data.circulars || []);
      } catch (error) {
        console.error("Failed to load circulars", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCirculars();

    // Check User Session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.user_id && parsedUser.role) {
          setUser(parsedUser);
        }
      } catch (err) {
        // ignore error
      }
    }
  }, []);

  // --- 2. Filtering Logic ---
  const filteredCirculars = circulars.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notice_code && item.notice_code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === "all" || item.circular_type === filterType;

    return matchesSearch && matchesType;
  });

  // --- 3. Helpers ---
  const isNew = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

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

  return (
    // WRAPPER: Flex column with min-height 100vh ensures the footer stays at bottom
    <div className="d-flex flex-column min-vh-100">
      
      {/* --- CSS STYLES (Scoped) --- */}
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
          padding: 4rem 0 3rem;
          margin-top: 60px;
        }
        .table-custom thead th {
            background-color: #5c67f2;
            color: white;
            border: none;
            padding: 1rem;
            font-size: 0.85rem;
            text-transform: uppercase;
        }
        .table-custom tbody td {
            vertical-align: middle;
            padding: 1rem;
            border-bottom: 1px solid #e9ecef;
        }
        .hover-bg-light:hover {
            background-color: #f8f9fa;
        }
        .nav-link:hover {
            color: #5c67f2 !important;
        }
        .btn-view {
            background-color: #eef2ff;
            color: #5c67f2;
            transition: all 0.2s;
        }
        .btn-view:hover {
            background-color: #5c67f2;
            color: white;
            transform: translateY(-2px);
        }
      `}</style>


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


      {/* --- HEADER --- */}
      <div className="header-gradient text-center">
        <div className="container">
          <h1 className="fw-bold mb-2">Circulars & Notifications</h1>
          <p className="opacity-75 mb-0">
            Browse the latest research grants, policy updates, and university notices.
          </p>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      {/* Added flex-grow-1 to push footer down */}
      <div className="container py-5 flex-grow-1">
        
        {/* Controls */}
        <div className="row g-3 mb-4 justify-content-between align-items-center">
          <div className="col-md-6 col-lg-5">
            <div className="input-group shadow-sm">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by title or notice code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4 col-lg-3">
            <select
              className="form-select shadow-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="proposal">Proposals</option>
              <option value="notice">General Notices</option>
            </select>
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        {filteredCirculars.length > 0 ? (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table mb-0 table-custom" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
                        <thead>
                            <tr>
                                <th className="ps-4">Title</th>
                                <th>Fiscal Year</th>
                                <th>Notice Code</th>
                                <th>Type</th>
                                <th>Published Date</th>
                                <th>Attachment</th>
                                <th className="text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCirculars.map((item) => (
                                <tr key={item.id} className="hover-bg-light">
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">{item.title}</div>
                                        {isNew(item.created_at) && (
                                            <span className="badge bg-danger ms-2 animate-pulse" style={{ fontSize: '0.65rem' }}>NEW</span>
                                        )}
                                    </td>
                                    <td className="text-secondary fw-medium">{item.year_label || "-"}</td>
                                    <td className="text-secondary fw-medium">{item.notice_code || "-"}</td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 py-2 fw-bold ${getTypeBadgeClass(item.circular_type)}`} style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                                            {item.circular_type ? item.circular_type.toUpperCase() : "UNKNOWN"}
                                        </span>
                                    </td>
                                    <td className="text-secondary fw-bold">
                                        {item.notice_published_date ? new Date(item.notice_published_date).toLocaleDateString("en-GB") : '-'}
                                    </td>
                                    
                                    {/* Attachment Column */}
                                    <td>
                                        {item.attachment ? (
                                            <a 
                                                href={`/uploads/circulars/${item.attachment}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold"
                                                style={{ borderColor: '#5c67f2', color: '#5c67f2' }}
                                            >
                                                <i className="bi bi-download me-1"></i> Download
                                            </a>
                                        ) : (
                                            <span className="text-muted small fst-italic">No Attachment</span>
                                        )}
                                    </td>

                                    {/* Action Column */}
                                    <td className="pe-4 text-end">
                                        <Link 
                                            href={`/circulars/${item.id}`} 
                                            className="btn btn-sm btn-view rounded-circle d-inline-flex align-items-center justify-content-center"
                                            style={{ width: '32px', height: '32px' }}
                                            title="View Details"
                                        >
                                            <i className="bi bi-eye-fill"></i>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="text-center py-5 text-muted bg-white rounded-4 shadow-sm border border-dashed">
                <i className="bi bi-folder-x display-4 d-block mb-3 opacity-50"></i>
                <h5>No circulars found</h5>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        )}
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