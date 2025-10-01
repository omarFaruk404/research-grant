// app/officer/dashboard/reviewer-payments/[id]/page.js
"use client";
import { useParams } from "next/navigation";
import { projectReviews, projects, reviewerPayments } from "@/lib/dummy";

export default function ReviewerPaymentDetails() {
  const { id } = useParams();
  const review = projectReviews.find((r) => r.id === parseInt(id));
  const project = projects.find((p) => p.id === review.project_id);
  const payment = reviewerPayments.find(
    (pay) =>
      pay.reviewer.id === review.reviewer.id && pay.project.id === review.project.id
  );

  return (
    <div className="container my-5">
      <h2>Manage Payment for Reviewer</h2>
      <p><strong>Reviewer:</strong> {review.reviewer_name}</p>
      {/* <p><strong>Project:</strong> {project.title}</p> */}
      <p><strong>Review Type:</strong> {review.review_type}</p>

      {payment ? (
        <>
          <p><strong>Amount Paid:</strong> {payment.amount}</p>
          <p><strong>Date:</strong> {payment.payment_date}</p>
          <p><strong>Status:</strong> Paid</p>
        </>
      ) : (
        <>
          <p><strong>Status:</strong> Pending</p>
          <button className="btn btn-success">Release Payment</button>
        </>
      )}
    </div>
  );
}
