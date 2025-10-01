"use client";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CircularDetailsPage() {
  const { id } = useParams();

  // Dummy circulars
  const circulars = [
    {
      id: 1,
      title: "Call for Research in AI",
      type: "Proposal",
      fiscalYear: "2025",
      description: "Submit proposals in the field of Artificial Intelligence.",
    },
    {
      id: 2,
      title: "Annual Reminder - Ethics Guidelines",
      type: "Reminder",
      fiscalYear: "2025",
      description: "Follow ethics guidelines while conducting research.",
    },
    {
      id: 3,
      title: "Circular on Budget Revisions",
      type: "Document",
      fiscalYear: "2024",
      description: "Policy changes on budget revisions for research projects.",
    },
  ];

  const circular = circulars.find((c) => c.id === Number(id));

  if (!circular) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Circular not found</div>
        <Link href="/researcher/dashboard/circulars" className="btn btn-secondary">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>{circular.title}</h2>
      <p>
        <strong>Type:</strong> {circular.type}
      </p>
      <p>
        <strong>Fiscal Year:</strong> {circular.fiscalYear}
      </p>
      <p>{circular.description}</p>

      {circular.type === "Proposal" && (
        <Link
          href={`/researcher/dashboard/circulars/${circular.id}/apply`}
          className="btn btn-success"
        >
          Apply
        </Link>
      )}

      <Link
        href="/researcher/dashboard/circular"
        className="btn btn-secondary ms-2"
      >
        Back
      </Link>
    </div>
  );
}
