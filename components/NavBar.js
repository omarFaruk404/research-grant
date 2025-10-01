"use client";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 fixed-top">
      {/* Brand */}
      <a className="navbar-brand fw-bold" href="#">
        Ready Dashboard
      </a>

      {/* Collapse button for mobile */}
      <button
        className="navbar-toggler"
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
            <a className="nav-link position-relative" href="#">
              <i className="bi bi-envelope fs-5"></i>
            </a>
          </li>

          {/* Notifications Dropdown */}
          <li className="nav-item dropdown me-3">
            <a
              className="nav-link position-relative"
              href="#"
              id="notificationDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src="/assets/icons/notification.png"
                alt="Notifications"
                className="icon"
                height="24"
                width="24"
              />
              <span className="position-absolute translate-middle badge rounded-pill bg-danger"
                style={{
                  top: '10px',      // move it slightly down
                  right: '-10px',    // move it slightly right
                  fontSize: '0.6rem' // optional, make badge smaller
                }}

              >
                3
              </span>
            </a>
            <ul
              className="dropdown-menu dropdown-menu-end p-2"
              aria-labelledby="notificationDropdown"
              style={{ minWidth: "300px" }}
            >
              <li className="dropdown-header fw-bold">
                You have 4 new notifications
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <div className="me-2 text-primary">
                    <i className="bi bi-person-plus fs-5"></i>
                  </div>
                  <div>
                    <div>New user registered</div>
                    <small className="text-muted">5 minutes ago</small>
                  </div>
                </a>
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <div className="me-2 text-success">
                    <i className="bi bi-chat-left-text fs-5"></i>
                  </div>
                  <div>
                    <div>Rahmad commented on Admin</div>
                    <small className="text-muted">12 minutes ago</small>
                  </div>
                </a>
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <img
                    src="/assets/icons/notification.png"
                    alt="Reza"
                    className="rounded-circle me-2"
                  />
                  <div>
                    <div>Reza sent messages to you</div>
                    <small className="text-muted">12 minutes ago</small>
                  </div>
                </a>
              </li>
              <li>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <div className="me-2 text-danger">
                    <i className="bi bi-heart fs-5"></i>
                  </div>
                  <div>
                    <div>Farrah liked Admin</div>
                    <small className="text-muted">17 minutes ago</small>
                  </div>
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a className="dropdown-item text-center fw-bold" href="#">
                  See all notifications
                </a>
              </li>
            </ul>
          </li>

          {/* Profile Dropdown */}<li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              id="profileDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src="/assets/img/profile.jpg"
                alt="profile"
                width="32"
                height="32"
                className="rounded-circle me-2"
              />
              <span>Dr. John Doe</span>
            </a>
            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="profileDropdown"
            >
              {/* Profile header with image on left and text on right */}
              <li className="dropdown-item">
                <div className="d-flex align-items-center">
                  <img
                    src="/assets/img/profile.jpg"
                    alt="profile"
                    width="48"
                    height="48"
                    className="rounded-circle me-3"
                  />
                  <div>
                    <div className="fw-bold">Dr. John Doe</div>
                    <small className="text-muted">johndoe@gmail.com</small>
                  </div>
                </div>
              </li>

              <li>
                <hr className="dropdown-divider" />
              </li>

              {/* Dropdown action buttons */}
              <li className="px-3 mb-2">
                <button className="btn btn-sm btn-danger w-100">View Profile</button>
              </li>

              <li>
                <hr className="dropdown-divider" />
              </li>

              {/* Other links */}
              <li><a className="dropdown-item" href="#">My Profile</a></li>
              <li><a className="dropdown-item" href="#">My Balance</a></li>
              <li><a className="dropdown-item" href="#">Inbox</a></li>
              <li><a className="dropdown-item" href="#">Account Setting</a></li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li><a className="dropdown-item text-danger" href="#">Logout</a></li>
            </ul>
          </li>

        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
