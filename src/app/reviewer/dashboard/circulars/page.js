"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CircularsPage() {
  const [circulars, setCirculars] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCirculars();
  }, []);

  const fetchCirculars = async () => {
    try {
      const res = await fetch("/api/circulars");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setCirculars(data);
      } else if (data.circulars) {
        setCirculars(data.circulars);
      } else {
        setCirculars([]);
      }
    } catch (error) {
      console.error("Failed to fetch circulars:", error);
    }
  };

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCirculars = circulars.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(circulars.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // VIEW Action
  const handleView = (id) => {
    router.push(`/reviewer/dashboard/circulars/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const getTypeBadgeClass = (type) => {
    if (type === "proposal") return "bg-success-subtle text-success";
    if (type === "notice") return "bg-primary-subtle text-primary";
    return "bg-secondary-subtle text-secondary";
  };

  // --- Pagination Render ---
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <nav className="d-flex justify-content-end mt-4">
        <ul className="pagination">
          {/* Previous Button */}
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button 
              className="page-link shadow-none border-0" 
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="Previous"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
          
          {/* Page Numbers */}
          {[...Array(totalPages)].map((_, index) => (
            <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
              <button 
                className="page-link shadow-none border-0 mx-1 rounded-circle" 
                onClick={() => handlePageChange(index + 1)}
                style={currentPage === index + 1 ? {backgroundColor: '#5c67f2', color: 'white'} : {color: '#333'}}
              >
                {index + 1}
              </button>
            </li>
          ))}

          {/* Next Button */}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button 
              className="page-link shadow-none border-0" 
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="Next"
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
            <h3 className="fw-bold text-dark mb-0">Circulars</h3>
            <p className="text-muted mb-0 mt-1">View all published circulars and notices.</p>
        </div>
      </div>

      {circulars.length > 0 ? (
        <>
          <div className="card border-0 shadow-sm" style={{ borderRadius: "10px", overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="table mb-0" style={{ borderCollapse: "separate", borderSpacing: "0", width: "100%" }}>
                
                {/* Table Header */}
                <thead style={{ backgroundColor: "#5c67f2" }}>
                  <tr>
                    <th className="text-white text-uppercase small fw-bold py-3 ps-4" style={{ backgroundColor: "#5c67f2", border: "none", width: "35%" }}>Title</th>
                    <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none", width: "15%" }}>Fiscal Year</th>
                    <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none", width: "15%" }}>Notice Code</th>
                    <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none", width: "15%" }}>Type</th>
                    <th className="text-white text-uppercase small fw-bold py-3" style={{ backgroundColor: "#5c67f2", border: "none", width: "15%" }}>Published Date</th>
                    <th className="text-white text-uppercase small fw-bold py-3 pe-4 text-end" style={{ backgroundColor: "#5c67f2", border: "none", width: "5%" }}>Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {currentCirculars.map((c) => (
                    <tr
                      key={c.id}
                      className="align-middle border-bottom hover-bg-light"
                      style={{ transition: "background-color 0.2s" }}
                    >
                      {/* Title */}
                      <td className="ps-4 py-3">
                        <div className="fw-bold text-dark text-truncate" title={c.title}>{c.title}</div>
                      </td>

                      {/* Fiscal Year */}
                      <td className="py-3 text-secondary fw-medium">
                        {c.year_label || "-"}
                      </td>

                      {/* Notice Code */}
                      <td className="py-3 text-secondary fw-medium">
                        {c.notice_code || "-"}
                      </td>

                      {/* Type */}
                      <td className="py-3">
                        <span
                          className={`badge rounded-pill px-3 py-2 fw-bold ${getTypeBadgeClass(c.circular_type)}`}
                          style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
                        >
                          {c.circular_type ? c.circular_type.toUpperCase() : "UNKNOWN"}
                        </span>
                      </td>

                      {/* Published Date */}
                      <td className="py-3 text-secondary fw-bold">
                        {formatDate(c.notice_published_date)}
                      </td>

                      {/* ACTIONS COLUMN (Only View) */}
                      <td className="pe-4 py-3 text-end">
                        <div className="d-flex justify-content-end">
                          
                          {/* VIEW BUTTON */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleView(c.id); }}
                            className="btn btn-sm btn-light text-primary border-0 d-flex align-items-center justify-content-center"
                            title="View Details"
                            style={{ backgroundColor: "#eef2ff", width: "32px", height: "32px" }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                              <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                              <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                            </svg>
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination Controls */}
          {renderPagination()}
        </>
      ) : (
        <div className="alert alert-light text-center mt-4 p-5 shadow-sm rounded border border-light-subtle">
            <div className="d-inline-flex align-items-center justify-content-center bg-white rounded-circle mb-3 shadow-sm" style={{width: 60, height: 60}}>
                <i className="bi bi-clipboard-x fs-3 text-secondary"></i>
            </div>
            <h6 className="fw-bold text-secondary">No circulars found</h6>
            <p className="text-muted small mb-0">There are currently no active circulars or notices to display.</p>
        </div>
      )}

      <style jsx>{`
        .hover-bg-light:hover { background-color: #f8f9fa; }
        .page-link:focus { box-shadow: none; }
      `}</style>
    </div>
  );
}