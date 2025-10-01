// app/officer/dashboard/reviewer-payments/page.js
"use client";
import Link from "next/link";
import { projects, projectReviews, reviewerPayments } from "@/lib/dummy";

export default function ReviewerPayments() {
  return (
    <div className="container my-5">
      <h2>Reviewer Payments</h2>
      <table className="table table-bordered table-hover mt-3">
        <thead className="table-dark">
          <tr>
            <th>Reviewer</th>
            <th>Project</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projectReviews.map((review) => {
            const project = projects.find((p) => p.id === review.project_id);
            const payment = reviewerPayments.find(
              (pay) =>
                pay.reviewer_id === review.reviewer_id &&
                pay.project_id === review.project_id
            );

            return (
              <tr key={review.id}>
                <td>{review.reviewer_name}</td>
                <td>{project?.title}</td>
                <td>{review.review_type}</td>
                <td>{payment ? payment.amount : "Not Paid"}</td>
                <td>{payment ? "Paid" : "Pending"}</td>
                <td>
                  <Link
                    href={`/officer/dashboard/payments/reviewer-payments/${review.id}`}
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
