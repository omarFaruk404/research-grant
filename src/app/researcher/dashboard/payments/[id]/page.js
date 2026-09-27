"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResearcherPaymentDetails() {
  const { id } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    async function loadData() {
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (!storedUser) return router.push("/login");
      const user = JSON.parse(storedUser);

      if (!user.researcher_id) return;

      try {
        const res = await fetch(`/api/researcher/payments/${id}?researcher_id=${user.researcher_id}`);
        const result = await res.json();
        console.log("Payment Details Result:", result);
        if (result.success) {
          setData(result.project);
        } else {
          console.error(result.error);
        }
      } catch (err) {
        console.error("Error loading payment details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, router]);

  // --- HELPERS ---
  const formatMoney = (amount) => {
    return amount ? `৳${Number(amount).toLocaleString()}` : "৳0";
  };

  const formatDate = (dateStr) => {
    if(!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB");
  };

  const getStatusBadge = (status) => {
    const map = { 3: "Ongoing", 4: "Report Submitted", 5: "Completed" };
    const label = map[status] || "Unknown";
    const color = status === 5 ? "bg-success-subtle text-success" : "bg-primary-subtle text-primary";
    return <span className={`badge rounded-pill px-3 py-2 ${color}`}>{label.toUpperCase()}</span>;
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!data) return <div className="text-center mt-5 text-danger fw-bold">Project details not found.</div>;

  return (
    <div className="container-fluid px-4 mt-5 position-relative">
      
      {/* --- HEADER --- */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
            <Link href="/researcher/dashboard/payments" className="text-decoration-none text-secondary small fw-bold mb-2 d-inline-block">
              &larr; BACK TO PAYMENTS
            </Link>
            <h2 className="fw-bold text-dark mb-1">Payment Breakdown</h2>
            <div className="d-flex align-items-center gap-3">
                <span className="text-muted small"><i className="bi bi-upc-scan me-1"></i> {data.code_no || "N/A"}</span>
                {getStatusBadge(data.status)}
            </div>
        </div>
      </div>

      {/* --- PROJECT INFO --- */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
            <h5 className="fw-bold text-dark mb-3">{data.title}</h5>
            <div className="row g-3 text-secondary small">
                <div className="col-md-3">
                    <div className="text-uppercase fw-bold opacity-75 mb-1">Fiscal Year</div>
                    <div className="text-dark fw-bold fs-6">{data.fiscal_year || "-"}</div>
                </div>
                <div className="col-md-3">
                    <div className="text-uppercase fw-bold opacity-75 mb-1">Researcher</div>
                    <div className="text-dark">{data.researcher_name}</div>
                </div>
                <div className="col-md-3">
                    <div className="text-uppercase fw-bold opacity-75 mb-1">Department</div>
                    <div className="text-dark">{data.department_name || "-"}</div>
                </div>
            </div>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="row g-4 mb-4">
          {/* Allocated */}
          <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 bg-primary text-white h-100">
                  <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="opacity-75 text-uppercase fw-bold small">Total Allocated</span>
                          <i className="bi bi-wallet2 fs-4 opacity-50"></i>
                      </div>
                      <div className="display-6 fw-bold">{formatMoney(data.allocated_budget)}</div>
                  </div>
              </div>
          </div>
          {/* Released */}
          <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 bg-success text-white h-100">
                  <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="opacity-75 text-uppercase fw-bold small">Total Released</span>
                          <i className="bi bi-check-circle fs-4 opacity-50"></i>
                      </div>
                      <div className="display-6 fw-bold">{formatMoney(data.totalReleased)}</div>
                  </div>
              </div>
          </div>
          {/* Remaining */}
          <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 bg-white h-100 border-start border-5 border-warning">
                  <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="text-secondary text-uppercase fw-bold small">Remaining Balance</span>
                          <i className="bi bi-hourglass-split fs-4 text-warning"></i>
                      </div>
                      <div className={`display-6 fw-bold ${data.remaining < 0 ? 'text-danger' : 'text-dark'}`}>
                          {formatMoney(data.remaining)}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* --- PAYMENT HISTORY TABLE --- */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
          <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0 text-dark">Payment History</h5>
              <span className="badge bg-light text-secondary border">Records: {1 + (data.payments?.length || 0)}</span>
          </div>
          <div className="table-responsive">
              <table className="table mb-0">
                  <thead style={{ backgroundColor: "#5c67f2" }}>
                      <tr>
                          <th className="text-white ps-4 py-3 border-0" style={{backgroundColor: "#5c67f2"}}>Installment</th>
                          <th className="text-white py-3 border-0" style={{backgroundColor: "#5c67f2"}}>Date</th>
                          <th className="text-white py-3 border-0" style={{backgroundColor: "#5c67f2"}}>Note / Reference</th>
                          <th className="text-white pe-4 py-3 text-end border-0" style={{backgroundColor: "#5c67f2"}}>Amount</th>
                      </tr>
                  </thead>
                  <tbody>


                      {/* 2. Additional Payments */}
                      {data.payments && data.payments.length > 0 ? (
                          data.payments.map((p) => (
                              <tr key={p.id} className="align-middle border-bottom">
                                  <td className="ps-4 py-3 fw-medium text-dark">
                                      {p.payment_slot ? `${p.payment_slot}th Installment` : "Ad-hoc Payment"}
                                  </td>
                                  <td className="py-3 text-secondary">{formatDate(p.payment_date)}</td>
                                  <td className="py-3 text-secondary small">{p.payment_note || "-"}</td>
                                  <td className="pe-4 py-3 text-end fw-bold text-success">
                                      + {formatMoney(p.amount)}
                                  </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                              <td colSpan="4" className="text-center py-4 text-muted small">
                                  No additional payments have been released yet.
                              </td>
                          </tr>
                      )}
                  </tbody>
                  {/* Footer Total */}
                  <tfoot className="bg-white">
                      <tr>
                          <td colSpan="3" className="ps-4 py-3 fw-bold text-uppercase text-secondary text-end border-0">Total Released</td>
                          <td className="pe-4 py-3 text-end fw-bold text-dark fs-5 border-0 border-top border-dark border-2">{formatMoney(data.totalReleased)}</td>
                      </tr>
                  </tfoot>
              </table>
          </div>
      </div>

    </div>
  );
}