"use client";
import Link from "next/link";

const SideBar = () => {
  return (
    <div
      className="d-flex flex-column flex-shrink-0 p-3 bg-light"
      style={{ width: "260px", minHeight: "90vh" }}
    >
      {/* User Profile */}
      <div className="d-flex align-items-center mb-3">
        <img
          src="/assets/img/profile.jpg"
          alt="profile"
          width="48"
          height="48"
          className="rounded-circle me-2"
        />
        <div>
          <div className="fw-bold">Officer User</div>
          <small className="text-muted">Officer</small>
        </div>
      </div>
      <hr />

      {/* Menu Items */}
      <ul className="nav nav-pills flex-column mb-auto">

        {/* Dashboard */}
        <li className="nav-item">
          <Link
            href="#"
            className="nav-link active d-flex align-items-center"
          >
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </Link>
        </li>

        {/* Researchers */}
        <li>
          <Link href="#" className="nav-link link-dark">
            <i className="bi bi-people me-2"></i> Researchers
          </Link>
        </li>

        {/* Reviewers */}
        <li>
          <Link href="#" className="nav-link link-dark">
            <i className="bi bi-person-check me-2"></i> Reviewers
          </Link>
        </li>

        {/* Projects Dropdown */}
        <li>
          <a
            className="nav-link link-dark d-flex justify-content-between align-items-center"
            data-bs-toggle="collapse"
            href="#projectsMenu"
            role="button"
            aria-expanded="false"
            aria-controls="projectsMenu"
          >
            <span>
              <i className="bi bi-folder me-2"></i> Proposals ⏷
            </span>
            <i className="bi bi-caret-down"></i>
          </a>
          <div className="collapse ps-3" id="projectsMenu">
            <ul className="nav flex-column">
              <li>
                <Link href="/officer/dashboard/all-projects" className="nav-link link-dark">
                  <i className="bi bi-file-earmark-text me-2"></i> All Proposals
                </Link>
              </li>
              <li>
                <Link href="/officer/dashboard/projects/proposal-submitted" className="nav-link link-dark">
                  <i className="bi bi-hourglass-split me-2"></i>Proposal Submitted
                </Link>
              </li>

              <li>
                <Link href="/officer/dashboard/projects/under-review" className="nav-link link-dark">
                  <i className="bi bi-hourglass-split me-2"></i> Under Review
                </Link>
              </li>
              <li>
                <Link href="/officer/dashboard/projects/approved-ongoing" className="nav-link link-dark">
                  <i className="bi bi-check2-circle me-2"></i> Approved / Ongoing
                </Link>
              </li>
              <li>
                <Link href="/officer/dashboard/projects/rejected" className="nav-link link-dark">
                  <i className="bi bi-x-circle me-2"></i> Rejected
                </Link>
              </li>
              <li>
                <Link href="/officer/dashboard/projects/completed" className="nav-link link-dark">
                  <i className="bi bi-flag me-2"></i> Completed
                </Link>
              </li>
            </ul>
          </div>
        </li>


        <li>
          <a
            className="nav-link link-dark d-flex justify-content-between align-items-center"
            data-bs-toggle="collapse"
            href="#circularMenu"
            role="button"
            aria-expanded="false"
            aria-controls="circularMenu"
          >
            <span>
              <i className="bi bi-folder me-2"></i> Circulars ⏷
            </span>
            <i className="bi bi-caret-down"></i>
          </a>
          <div className="collapse ps-3" id="circularMenu">
            <ul className="nav flex-column">
              <li>
                <Link href="/officer/dashboard/circulars" className="nav-link link-dark">
                  <i className="bi bi-file-earmark-text me-2"></i> All Circulars
                </Link>
              </li>
              <li>
                <Link href="/officer/dashboard/circulars/create-circular" className="nav-link link-dark">
                  <i className="bi bi-file-earmark-text me-2"></i> Create Circular
                </Link>
              </li>
            </ul>
          </div>
        </li>


        {/* Payments */}
        <li>
          <Link href="/officer/dashboard/payments/researcher-payments" className="nav-link link-dark">
            <i className="bi bi-cash-stack me-2"></i> Researcher Payments
          </Link>
        </li>
        <li>
          <Link href="/officer/dashboard/payments/reviewer-payments" className="nav-link link-dark">
            <i className="bi bi-credit-card me-2"></i> Reviewer Payments
          </Link>
        </li>

        {/* Fiscal Years */}
        <li>
          <Link href="/officer/dashboard/fiscal-years" className="nav-link link-dark">
            <i className="bi bi-calendar3 me-2"></i> Fiscal Years
          </Link>
        </li>

        {/* Reports & Reviews */}
        <li>
          <Link href="/officer/dashboard/reports" className="nav-link link-dark">
            <i className="bi bi-journal-text me-2"></i> Reports
          </Link>
        </li>

      </ul>

      <hr />

      {/* Footer */}
      <div className="mt-auto">
        <button className="btn btn-outline-danger w-100 mb-2">
          <i className="bi bi-box-arrow-right me-2"></i> Logout
        </button>
      </div>
    </div>
  );
};

export default SideBar;
