// app/officer/dashboard/researcher-payments/page.js
"use client";
import Link from "next/link";
import { projects, researcherPayments } from "@/lib/dummy";

export default function ResearcherPayments() {
  const ongoingProjects = projects.filter(
    (p) => p.status === "Approved / Ongoing"
  );

  const getPaymentsForProject = (projectId) =>
    researcherPayments.filter((pay) => pay.project_id === projectId);

  return (
    <div className="container my-5">
      <h2>Researcher Payments</h2>
      <table className="table table-bordered table-hover mt-3">
        <thead className="table-dark">
          <tr>
            <th>Project Code</th>
            <th>Title</th>
            <th>Researcher</th>
            <th>Allocated Budget</th>
            <th>Released</th>
            <th>Remaining</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ongoingProjects.map((p) => {
            const payments = getPaymentsForProject(p.id);
            const released = payments.reduce((sum, pay) => sum + pay.amount, 0);
            const remaining = p.allocated_budget - released;

            return (
              <tr key={p.id}>
                <td>{p.code_no}</td>
                <td>{p.title}</td>
                <td>{p.researcher.name}</td>
                <td>{p.allocated_budget}</td>
                <td>{released}</td>
                <td>{remaining}</td>
                <td>
                  <Link
                    href={`/officer/dashboard/payments/researcher-payments/${p.id}`}
                    className="btn btn-sm btn-primary"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
