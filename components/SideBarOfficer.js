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

    // Helper for Link Classes
    const getLinkClass = (path) => {
        const isActive = pathname === path;
        return `nav-link d-flex align-items-center gap-2 py-2 px-3 w-100 rounded menu-link ${isActive ? "active-link" : ""
            }`;
    };

    // Helper for Dropdown Parent
    const dropdownClass = "nav-link d-flex justify-content-between align-items-center px-3 py-2 rounded menu-link";

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        try {
            const user = JSON.parse(storedUser);
            setUser(user);
            if (!user?.user_id || user.role !== 1) router.push("/login");
        } catch {
            router.push("/login");
        }
    }, []);

    return (
        <>
            {/* 1. MOBILE HAMBURGER (Visible only on mobile when sidebar is CLOSED) */}
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
                id="officer-sidebar-wrapper"
                className={`position-fixed h-100 bg-white border-end shadow-sm ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
                style={{
                    top: 0,
                    left: 0,
                    width: "260px",
                    zIndex: 1040,
                    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Smooth ease transition
                }}
            >

                {/* 3. DESKTOP TOGGLE BUTTON (Attached to the outside right edge) */}
                {!isMobile && (
                    <button
                        className="btn position-absolute shadow-sm d-flex align-items-center justify-content-center p-0"
                        onClick={() => setIsOpen(!isOpen)}
                        style={{
                            top: "20px",
                            left: "100%", // Pushes it exactly outside
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
                        <i className={`bi ${isOpen ? "bi-chevron-left" : "bi-chevron-right"} text-secondary`} style={{ fontSize: "12px" }}></i>
                    </button>
                )}

                {/* 4. INNER SCROLLABLE CONTENT */}
                <div
                    className="d-flex flex-column h-100"
                    style={{ overflowY: "auto", overflowX: "hidden" }}
                >
                    {/* Close Button (Mobile Only) */}
                    {isMobile && (
                        <div className="d-flex justify-content-end p-2">
                            <button className="btn btn-sm btn-light rounded-circle" onClick={() => setIsOpen(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    )}

                    {/* Header */}
                    <div className="p-4 border-bottom">
                        <h5 className="fw-bold mb-0 dashboard-title">Officer Panel</h5>
                        <p className="text-muted mb-0 small text-truncate">Officer</p>
                    </div>

                    {/* Menu */}
                    <ul className="nav flex-column flex-grow-1 p-3 gap-2">

                        <li className="nav-item">
                            <Link href="/officer/dashboard" className={getLinkClass("/officer/dashboard")}>
                                <i className="bi bi-speedometer2"></i>
                                Dashboard
                            </Link>
                        </li>

                        {/* Projects Dropdown */}
                        <li className="nav-item">
                            <a className={dropdownClass} data-bs-toggle="collapse" href="#projectsMenu" aria-expanded="false">
                                <span className="d-flex align-items-center gap-2">
                                    <i className="bi bi-folder"></i>
                                    Projects
                                </span>
                                <i className="bi bi-chevron-down small"></i>
                            </a>
                            <div className="collapse ps-3" id="projectsMenu">
                                <ul className="nav flex-column gap-1 mt-1">
                                    <li className="nav-item">
                                        <Link href="/officer/dashboard/projects" className={getLinkClass("/officer/dashboard/projects")}>
                                            <i className="bi bi-collection"></i>
                                            All Projects
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link href="/officer/dashboard/projects/create" className={getLinkClass("/officer/dashboard/projects/create")}>
                                            <i className="bi bi-plus-circle"></i>
                                            Add Project
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link href="/officer/dashboard/projects/download-report" className={getLinkClass("/officer/dashboard/projects/download-report")}>
                                            <i className="bi bi-download"></i>
                                            Download Report
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        <li className="nav-item">
                            <Link href="/officer/dashboard/reports" className={getLinkClass("/officer/dashboard/reports")}>
                                <i className="bi bi-bar-chart"></i>
                                Final Reports
                            </Link>
                        </li>

                        {/* Users Dropdown */}
                        <li className="nav-item">
                            <a className={dropdownClass} data-bs-toggle="collapse" href="#usersMenu" aria-expanded="false">
                                <span className="d-flex align-items-center gap-2">
                                    <i className="bi bi-people"></i>
                                    Users
                                </span>
                                <i className="bi bi-chevron-down small"></i>
                            </a>
                            <div className="collapse ps-3" id="usersMenu">
                                <ul className="nav flex-column gap-1 mt-1">
                                    <li className="nav-item">
                                        <Link href="/officer/dashboard/users" className={getLinkClass("/officer/dashboard/users")}>
                                            <i className="bi bi-list-ul"></i>
                                            Users List
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link href="/officer/dashboard/users/add-user" className={getLinkClass("/officer/dashboard/users/add-user")}>
                                            <i className="bi bi-person-plus"></i>
                                            Add User
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link href="/officer/dashboard/users/invite" className={getLinkClass("/officer/dashboard/users/invite")}>
                                            <i className="bi bi-envelope-plus"></i>
                                            Invite User
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link href="/officer/dashboard/users/faculties-dept" className={getLinkClass("/officer/dashboard/users/faculties-dept")}>
                                            <i className="bi bi-building"></i>
                                            Faculties & Depts
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        {/* Circulars Dropdown */}
                        <li className="nav-item">
                            <a className={dropdownClass} data-bs-toggle="collapse" href="#circularMenu" aria-expanded="false">
                                <span className="d-flex align-items-center gap-2">
                                    <i className="bi bi-megaphone"></i>
                                    Circulars
                                </span>
                                <i className="bi bi-chevron-down small"></i>
                            </a>
                            <div className="collapse ps-3" id="circularMenu">
                                <ul className="nav flex-column gap-1 mt-1">
                                    <li className="nav-item">
                                        <Link href="/officer/dashboard/circulars" className={getLinkClass("/officer/dashboard/circulars")}>
                                            <i className="bi bi-list"></i>
                                            All Circulars
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link href="/officer/dashboard/circulars/create-circular" className={getLinkClass("/officer/dashboard/circulars/create-circular")}>
                                            <i className="bi bi-plus-square"></i>
                                            Create Circular
                                        </Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link href="/officer/dashboard/circulars/send-notification" className={getLinkClass("/officer/dashboard/circulars/send-notification")}>
                                            <i className="bi bi-bell-fill"></i>
                                            Send Notification
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </li>


                        <li className="nav-item">
                            <Link href="/officer/dashboard/mail" className={getLinkClass("/officer/dashboard/mail")}>
                                <i className="bi bi-envelope"></i>
                                Mail
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link href="/officer/dashboard/payments/researcher-payments" className={getLinkClass("/officer/dashboard/payments/researcher-payments")}>
                                <i className="bi bi-cash-stack"></i>
                                Researcher Payments
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link href="/officer/dashboard/payments/reviewer-payments" className={getLinkClass("/officer/dashboard/payments/reviewer-payments")}>
                                <i className="bi bi-credit-card"></i>
                                Reviewer Payments
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link href="/officer/dashboard/fiscal-years" className={getLinkClass("/officer/dashboard/fiscal-years")}>
                                <i className="bi bi-calendar3"></i>
                                Fiscal Years
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link href="/officer/dashboard/review-settings" className={getLinkClass("/officer/dashboard/review-settings")}>
                                <i className="bi bi-gear"></i>
                                Review Settings
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