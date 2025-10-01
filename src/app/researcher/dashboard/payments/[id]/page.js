"use client";
import { useParams } from "next/navigation";
import Link from "next/link";

// Dummy data for payment details
const dummyPayments = [
  {
    id: 1,
    project_id: 101,
    project_title: "AI in Healthcare",
    fiscal_year: "2025",
    researcher_name: "Dr. John Doe",
    amount: 2500,
    slot: 1,
    total_slots: 4,
    released_at: "2025-06-15",
    total_project_funding: 10000,
  },
  {
    id: 2,
    project_id: 101,
    project_title: "AI in Healthcare",
    fiscal_year: "2025",
    researcher_name: "Dr. John Doe",
    amount: 2500,
    slot: 2,
    total_slots: 4,
    released_at: "2025-09-01",
    total_project_funding: 10000,
  },
  {
    id: 3,
    project_id: 202,
    project_title: "Climate Change Impact Study",
    fiscal_year: "2024",
    researcher_name: "Dr. John Doe",
    amount: 5000,
    slot: 1,
    total_slots: 2,
    released_at: "2024-04-10",
    total_project_funding: 10000,
  },
];

export default function PaymentDetailsPage() {
  const { id } = useParams();
  const payment = dummyPayments.find((p) => p.id === Number(id));

  if (!payment) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Payment not found</div>
        <Link href="/researcher/dashboard/payments" className="btn btn-secondary">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Payment Details</h2>

      <div className="card mt-3">
        <div className="card-body">
          <p>
            <strong>Project:</strong> {payment.project_title}
          </p>
          <p>
            <strong>Fiscal Year:</strong> {payment.fiscal_year}
          </p>
          <p>
            <strong>Researcher:</strong> {payment.researcher_name}
          </p>
          <p>
            <strong>Amount Released:</strong> ${payment.amount}
          </p>
          <p>
            <strong>Slot:</strong> {payment.slot} / {payment.total_slots}
          </p>
          <p>
            <strong>Released At:</strong> {payment.released_at}
          </p>
          <p>
            <strong>Total Project Funding:</strong> ${payment.total_project_funding}
          </p>
          <p>
            <strong>Remaining:</strong> $
            {payment.total_project_funding - payment.amount}
          </p>
        </div>
      </div>

      <Link
        href="/researcher/dashboard/payments"
        className="btn btn-secondary mt-3"
      >
        Back to Payments
      </Link>
    </div>
  );
}
