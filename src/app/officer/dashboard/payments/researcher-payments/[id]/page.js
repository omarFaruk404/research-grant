// app/officer/dashboard/researcher-payments/[id]/page.js
"use client";
import { useParams } from "next/navigation";
import { projects, researcherPayments } from "@/lib/dummy";

export default function ResearcherPaymentDetails() {
  const { id } = useParams();
  const project = projects.find((p) => p.id === parseInt(id));
  const payments = researcherPayments.filter((pay) => pay.project_id === project.id);

  const released = payments.reduce((sum, pay) => sum + pay.amount, 0);
  const remaining = project.allocated_budget - released;

  return (
    <div className="container my-5">
      <h2>Manage Payments for {project.title}</h2>
      <p><strong>Allocated Budget:</strong> {project.allocated_budget}</p>
      <p><strong>Total Released:</strong> {released}</p>
      <p><strong>Remaining:</strong> {remaining}</p>

      <h4 className="mt-4">Payment Slots</h4>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Slot</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((pay) => (
            <tr key={pay.id}>
              <td>{pay.payment_slot}</td>
              <td>{pay.amount}</td>
              <td>{pay.payment_date}</td>
              <td>{pay.payment_note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-success mt-3">Release Next Slot</button>
    </div>
  );
}
