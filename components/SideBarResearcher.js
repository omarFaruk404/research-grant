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
          <Link href="/researcher/dashboard/proposals" className="nav-link link-dark">
            <i className="bi bi-people me-2"></i> My Proposals
          </Link>
        </li>



        {/* Reviewers */}
        <li>
          <Link href="/researcher/dashboard/circulars" className="nav-link link-dark">
            <i className="bi bi-person-check me-2"></i> Circulars
          </Link>
        </li>
        <li>
          <Link href="/researcher/dashboard/submit-proposal" className="nav-link link-dark">
            <i className="bi bi-person-check me-2"></i> Submit Proposal
          </Link>
        </li>

        {/* Payments */}
        <li>
          <Link href="/researcher/dashboard/payments" className="nav-link link-dark">
            <i className="bi bi-cash-stack me-2"></i>Payments
          </Link>
        </li>


        {/* Reports & Reviews */}
        <li>
          <Link href="/researcher/dashboard/my-reports" className="nav-link link-dark">
            <i className="bi bi-journal-text me-2"></i> My Reports
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
