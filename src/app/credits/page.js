"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function CreditsPage() {
  const [user, setUser] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const router = useRouter();

  // --- Check User Session (For Navbar) ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.user_id) setUser(parsedUser);
      } catch (err) {}
    }
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
          padding: 6rem 0 8rem;
          margin-top: 60px;
          clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
        }
        .team-card {
            background: white;
            border-radius: 1rem;
            border: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            transition: transform 0.3s ease;
            overflow: hidden;
            height: 100%;
        }
        .team-card:hover {
            transform: translateY(-5px);
        }
        .profile-img-container {
            width: 140px;
            height: 140px;
            margin: 0 auto;
            border-radius: 50%;
            overflow: hidden;
            border: 4px solid white;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            position: relative;
            background-color: #e9ecef;
        }
        .role-badge {
            font-size: 0.75rem;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-weight: 700;
        }
        .nav-link:hover {
            color: #5c67f2 !important;
        }
        .contact-link {
            text-decoration: none;
            color: #6c757d;
            transition: color 0.2s;
        }
        .contact-link:hover {
            color: #5c67f2;
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
                    <li className="nav-item"><Link href="/circulars" className="nav-link fw-semibold" style={{color: '#5c67f2'}}>Notices</Link></li>
                    <li className="nav-item"><Link href="/#about" className="nav-link">About</Link></li>
                    <li className="nav-item"><Link href="/#process" className="nav-link">Grant Process</Link></li>
                    <li className="nav-item"><Link href="/#contact" className="nav-link">Contact</Link></li>
                </ul>
                <button onClick={goToDashboard} className="btn ms-lg-3 d-none d-lg-inline-flex px-4 py-2 rounded-pill fw-bold text-white shadow-sm" style={{ backgroundColor: '#5c67f2' }}>
                    {user ? "Dashboard" : "Login"}
                </button>
            </div>
        </div>
      </nav>

      {/* --- HEADER --- */}
      <div className="header-gradient text-center">
        <div className="container">
          <h1 className="fw-bold display-5 mb-2">Project Credits</h1>
          <p className="opacity-75 lead mb-0">
            The team behind the University of Barishal Research Grant Portal
          </p>
        </div>
      </div>

      {/* --- TEAM SECTION --- */}
      <div className="container pb-5 flex-grow-1" style={{ marginTop: "-5rem" }}>
        <div className="row g-4 justify-content-center">
            
            {/* SUPERVISOR CARD */}
            <div className="col-lg-5 col-md-6">
                <div className="card team-card text-center p-4">
                    <div className="profile-img-container mb-4">
                        <img 
                            src="/assets/credits/mdsamsuddoha.jpg" 
                            alt="Md Samsuddoha" 
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Supervisor"; }} 
                        />
                    </div>
                    
                    <span className="badge bg-primary bg-opacity-10 text-primary role-badge mb-3 d-inline-block px-3 py-2 rounded-pill">
                        Project Manager & Supervisor
                    </span>
                    
                    <h3 className="fw-bold text-dark mb-1">Md Samsuddoha</h3>
                    <p className="text-muted fw-medium mb-3">Assistant Professor</p>
                    
                    <div className="small text-secondary mb-4 border-top border-bottom py-3 bg-light rounded px-3">
                        Department of Computer Science & Engineering<br/>
                        Faculty of Engineering<br/>
                        University of Barishal
                    </div>

                    {/* <p className="text-secondary small fst-italic mb-4 px-3">
                        "Guided the development team and served as the primary consultant throughout the entire project lifecycle."
                    </p> */}

                    <div className="d-flex justify-content-center gap-3">
                        <a href="mailto:msamsuddoha@bu.ac.bd" className="btn btn-outline-primary rounded-circle btn-sm d-flex align-items-center justify-content-center" style={{width: '36px', height: '36px'}}>
                            <i className="bi bi-envelope-fill"></i>
                        </a>
                        <a href="tel:+8801737349075" className="btn btn-outline-primary rounded-circle btn-sm d-flex align-items-center justify-content-center" style={{width: '36px', height: '36px'}}>
                            <i className="bi bi-telephone-fill"></i>
                        </a>
                    </div>
                    <div className="mt-2 small text-muted">msamsuddoha@bu.ac.bd</div>
                </div>
            </div>

            {/* DEVELOPER CARD */}
            <div className="col-lg-5 col-md-6">
                <div className="card team-card text-center p-4">
                    <div className="profile-img-container mb-4">
                         <img 
                            src="/assets/credits/khanmdomarfaruk.jpg" 
                            alt="Khan MD Omar Faruk" 
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Developer"; }}
                        />
                    </div>
                    
                    <span className="badge bg-success bg-opacity-10 text-success role-badge mb-3 d-inline-block px-3 py-2 rounded-pill">
                        Lead Developer
                    </span>
                    
                    <h3 className="fw-bold text-dark mb-1">Khan MD Omar Faruk</h3>
                    <p className="text-muted fw-medium mb-3">Student</p>
                    
                    <div className="small text-secondary mb-4 border-top border-bottom py-3 bg-light rounded px-3">
                        Department of Computer Science & Engineering<br/>
                        Session: 2021-2022<br/>
                        University of Barishal
                    </div>

                    {/* <p className="text-secondary small fst-italic mb-4 px-3">
                        "Designed and developed the full-stack architecture of the Research Project Grant Portal."
                    </p> */}

                    <div className="d-flex justify-content-center gap-3">
                        <a href="mailto:omar.sk2004@gmail.com" className="btn btn-outline-primary rounded-circle btn-sm d-flex align-items-center justify-content-center" style={{width: '36px', height: '36px'}}>
                            <i className="bi bi-envelope-fill"></i>
                        </a>
                        <a href="tel:+8801733505123" className="btn btn-outline-primary rounded-circle btn-sm d-flex align-items-center justify-content-center" style={{width: '36px', height: '36px'}}>
                            <i className="bi bi-telephone-fill"></i>
                        </a>
                    </div>
                    <div className="mt-2 small text-muted">omar.sk2004@gmail.com</div>
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