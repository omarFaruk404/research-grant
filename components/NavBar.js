"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NavBar = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // ✅ Load user from localStorage and protect dashboard routes
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      // Require at least user_id and current_role
      if (!parsedUser?.user_id || !parsedUser?.current_role) {
        router.push("/login");
        return;
      }

      setUser(parsedUser);
    } catch (err) {
      router.push("/login");
    }
  }, [router]);

  // ✅ Switch role (only for users with role = 4 (both researcher & reviewer))
  const handleSwitchRole = () => {
    if (!user || user.role !== 4) return;

    let newCurrentRole = user.current_role;

    if (user.current_role === "researcher") {
      newCurrentRole = "reviewer";
    } else if (user.current_role === "reviewer") {
      newCurrentRole = "researcher";
    } else {
      // officer or invalid current_role – no switching
      return;
    }

    const updatedUser = { ...user, current_role: newCurrentRole };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Redirect to the appropriate dashboard after switch
    if (newCurrentRole === "researcher") {
      router.push("/researcher/dashboard");
    } else if (newCurrentRole === "reviewer") {
      router.push("/reviewer/dashboard");
    }
  };

  // ✅ Logout: clear user and go to login
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  // ✅ Helper to get the correct profile link based on current role
  const getProfileLink = () => {
    if (!user) return "#";
    
    if (user.current_role === "researcher") {
      return "/researcher/dashboard/profile";
    } else if (user.current_role === "reviewer") {
      return "/reviewer/dashboard/profile";
    } else {
      // Default to officer if role is not researcher/reviewer (or role 1)
      return "/officer/dashboard/profile";
    }
  };

  return (
    <nav
      // Changed 'navbar-dark' to 'navbar-light' for dark text on light background
      className="navbar navbar-expand-lg navbar-light px-3 fixed-top"
      style={{
        backgroundColor: "#F8F9FA", // ✅ Updated Background Color
        zIndex: 999,
      }}
    >
      {/* Brand with Logo Placeholder */}
      <a className="navbar-brand fw-bold text-dark" href="#">
        
      </a>

      {/* Collapse button for mobile */}
      <button
        className="navbar-toggler border-0"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        {/* Push content to the right */}
        <ul className="navbar-nav ms-auto align-items-center">
          {/* Messages icon */}
          <li className="nav-item me-3">
            <a className="nav-link position-relative text-secondary" href="#">
              <i className="bi bi-envelope fs-5"></i>
            </a>
          </li>

          {/* Profile Dropdown */}
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle d-flex align-items-center text-dark" // Changed text to dark
              href="#"
              id="profileDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {/* ✅ FIXED: Added object-fit-cover to prevent stretching */}
              <img
                src={user?.profile_photo || "/assets/img/profile.jpg"}
                alt="profile"
                width="32"
                height="32"
                className="rounded-circle me-2 border object-fit-cover"
              />
              <span className="text-dark fw-medium">{user?.name}</span>
            </a>
            <ul
              className="dropdown-menu dropdown-menu-end border-0 shadow"
              aria-labelledby="profileDropdown"
            >
              <li className="dropdown-item">
                <div className="d-flex align-items-center">
                  {/* ✅ FIXED: Added object-fit-cover to prevent stretching */}
                  <img
                    src={user?.profile_photo || "/assets/img/profile.jpg"}
                    alt="profile"
                    width="48"
                    height="48"
                    className="rounded-circle me-3 border object-fit-cover"
                  />
                  <div>
                    <div className="fw-bold text-dark">{user?.name}</div>
                    <small className="text-muted">{user?.email}</small>
                  </div>
                </div>
              </li>

              <li>
                <hr className="dropdown-divider" />
              </li>

              {/* ✅ Dynamic Profile Link */}
              <li className="px-3 mb-2">
                <Link
                  href={getProfileLink()}
                  className="btn btn-sm w-100"
                  style={{
                    backgroundColor: "#6679EE",
                    color: "#fff",
                  }}
                >
                  Edit Profile
                </Link>
              </li>

              {/* 🔁 Show switch role only if user has DB role = 4 */}
              {user?.role === 4 && (
                <li className="px-3 mb-2">
                  <button
                    className="btn btn-sm w-100"
                    style={{
                      backgroundColor: "#243447",
                      color: "#fff",
                    }}
                    onClick={handleSwitchRole}
                  >
                    {user.current_role === "researcher"
                      ? "Switch to Reviewer"
                      : user.current_role === "reviewer"
                      ? "Switch to Researcher"
                      : "Switch Role"}
                  </button>
                </li>
              )}

              <li>
                <hr className="dropdown-divider" />
              </li>

              <li>
                <button
                  className="dropdown-item text-danger"
                  type="button"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;