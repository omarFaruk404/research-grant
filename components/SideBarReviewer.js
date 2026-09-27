"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const SideBar = ({ isOpen, setIsOpen, isMobile }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const getLinkClass = (path) => {
    const isActive = pathname === path;
    return `nav-link d-flex align-items-center gap-2 py-2 px-3 w-100 rounded menu-link ${
      isActive ? "active-link" : ""
    }`;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    try {
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      router.push("/login");
    }
  }, []);

  return (
    <>
      {/* 1. MOBILE HAMBURGER 
          (Visible only on mobile when sidebar is CLOSED) 
      */}
      {isMobile && !isOpen && (
        <button
          className="btn position-fixed shadow-sm rounded-circle d-flex align-items-center justify-content-center"
          style={{ 
            top: "15px", 
            left: "15px", 
            width: "45px", 
            height: "45px", 
            zIndex: 1050, 
            backgroundColor: "#6366f1", 
            color: "#fff", 
            border: "none" 
          }}
          onClick={() => setIsOpen(true)}
        >
          <i className="bi bi-list fs-4"></i>
        </button>
      )}

      {/* 2. SIDEBAR WRAPPER */}
      <aside
        id="reviewer-sidebar-wrapper"
        className={`position-fixed h-100 bg-white border-end shadow-sm ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
        style={{
          top: 0,
          left: 0,
          width: "260px",
          zIndex: 1040,
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Smooth ease
        }}
      >
        
        {/* 3. DESKTOP TOGGLE BUTTON 
            (Visible only on Desktop. Attached to the outside right edge.)
        */}
        {!isMobile && (
          <button
            className="btn position-absolute shadow-sm d-flex align-items-center justify-content-center p-0"
            // Toggle state based on current prop
            onClick={() => setIsOpen(!isOpen)}
            style={{
              top: "20px",
              left: "100%", // Pushes it exactly outside the component
              width: "35px",
              height: "35px",
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderLeft: "none",
              borderRadius: "0 50% 50% 0", 
              zIndex: 1050,
              cursor: "pointer",
              transform: "translateY(50%)" 
            }}
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <i 
                className={`bi ${isOpen ? "bi-chevron-left" : "bi-chevron-right"} text-secondary`} 
                style={{ fontSize: "12px" }}
            ></i>
          </button>
        )}

        {/* 4. INNER SCROLLABLE CONTENT */}
        <div 
            className="d-flex flex-column h-100" 
            style={{ overflowY: "auto", overflowX: "hidden" }}
        >
            
            {/* Close Button (Inner - Mobile Only) */}
            {isMobile && (
                <div className="d-flex justify-content-end p-2">
                    <button className="btn btn-sm btn-light rounded-circle" onClick={() => setIsOpen(false)}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="p-4 border-bottom">
                <h5 className="fw-bold mb-0 dashboard-title">Reviewer Panel</h5>
                <p className="text-muted mb-0 small text-truncate">{user?.name || "Researcher"}</p>
            </div>

            {/* Menu */}
            <ul className="nav flex-column flex-grow-1 p-3 gap-2">
                <li className="nav-item">
                    <Link href="/reviewer/dashboard" className={getLinkClass("/reviewer/dashboard")}>
                        <i className="bi bi-speedometer2"></i>
                        Dashboard
                    </Link>
                </li>
                <li className="nav-item">
                    <Link href="/reviewer/dashboard/reviews" className={getLinkClass("/reviewer/dashboard/reviews")}>
                        <i className="bi bi-collection"></i>
                        All Reviews
                    </Link>
                </li>
                <li className="nav-item">
                    <Link href="/reviewer/dashboard/circulars" className={getLinkClass("/reviewer/dashboard/circulars")}>
                        <i className="bi bi-megaphone"></i>
                        Circulars
                    </Link>
                </li>
                <li className="nav-item">
                    <Link href="/reviewer/dashboard/payments" className={getLinkClass("/reviewer/dashboard/payments")}>
                        <i className="bi bi-cash-stack"></i>
                        My Payments
                    </Link>
                </li>
            </ul>

            {/* Logout */}
            <div className="p-3 border-top mt-auto">
                <button
                    className="btn w-100 d-flex align-items-center justify-content-center gap-2 text-danger menu-link-logout"
                    style={{ background: "none", border: "1px solid #fee2e2" }}
                    onClick={logout}
                >
                    <i className="bi bi-box-arrow-right"></i>
                    Logout
                </button>
            </div>
        </div>
      </aside>

      {/* 5. OVERLAY (Mobile Only) */}
      {isMobile && isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50"
          style={{ zIndex: 1035 }}
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Styles */}
      <style jsx>{`
        :global(.menu-link) {
          color: #4b5563 !important;
          background-color: transparent;
          transition: all 0.2s ease;
          cursor: pointer;
          text-decoration: none;
          font-weight: 500;
        }
        :global(.menu-link:hover),
        :global(.active-link) {
          background-color: #6366f1 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
        }
        :global(.menu-link i) {
          color: inherit !important;
          font-size: 1.1rem;
        }
        .menu-link-logout:hover {
          background-color: #fee2e2 !important;
          color: #dc2626 !important;
        }
        .dashboard-title {
          color: #6366f1;
          letter-spacing: -0.5px;
        }

        /* Sidebar Transforms */
        .sidebar-open {
          transform: translateX(0);
        }
        .sidebar-closed {
          transform: translateX(-100%);
        }
      `}</style>
    </>
  );
};

export default SideBar;