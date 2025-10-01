"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function ProposalDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  // Detailed dummy proposals (must match IDs from the list page)
  const proposals = [
    {
      id: 1,
      title: "AI in Healthcare",
      description:
        "This proposal explores the use of AI in healthcare systems to improve diagnostics.",
      files: ["/uploads/proposals/ai-proposal.pdf", "/uploads/budgets/ai-budget.xlsx"],
      fiscalYear: "2025",
      status: "under_review",
      reviewerComments: null,
      marks: null,
      funding: null,
      finalReport: null,
    },
    {
      id: 2,
      title: "Climate Change Impact Study",
      description: "Study on sea level rise and agricultural impacts.",
      files: ["/uploads/proposals/climate-proposal.pdf"],
      fiscalYear: "2024",
      status: "reviewed",
      reviewerComments: "Reviewed: please update methodology section.",
      marks: {
        feasibility: 16,
        impact: 17,
        usefulness: 15,
        innovation: 14,
        methodology: 16,
      },
      funding: {
        totalAmount: 20000,
        slotsReleased: 0,
        totalSlots: 2,
        releasedAmount: 0,
      },
      finalReport: null,
    },
    {
      id: 3,
      title: "Smart Agriculture with IoT",
      description: "IoT sensors and automation for smallholder farms.",
      files: ["/uploads/proposals/smart-agri-proposal.pdf"],
      fiscalYear: "2025",
      status: "ongoing",
      reviewerComments: "Approved — proceed with implementation.",
      marks: {
        feasibility: 18,
        impact: 18,
        usefulness: 17,
        innovation: 16,
        methodology: 17,
      },
      funding: {
        totalAmount: 15000,
        slotsReleased: 1,
        totalSlots: 3,
        releasedAmount: 5000,
      },
      finalReport: null,
    },
    {
      id: 4,
      title: "Blockchain for Supply Chain",
      description: "Secure tracking of goods using blockchain.",
      files: ["/uploads/proposals/blockchain-proposal.pdf"],
      fiscalYear: "2025",
      status: "completed",
      reviewerComments: "Initial proposal review: strong submission.",
      marks: {
        feasibility: 17,
        impact: 16,
        usefulness: 18,
        innovation: 15,
        methodology: 17,
      },
      funding: {
        totalAmount: 30000,
        slotsReleased: 3,
        totalSlots: 3,
        releasedAmount: 30000,
      },
      finalReport: {
        file: "/uploads/final_reports/blockchain-final.pdf",
        reviewer: "Prof. Alan Turing",
        comments: "Final report: outcomes achieved, good documentation.",
        marks: {
          feasibility: 18,
          impact: 17,
          usefulness: 18,
          innovation: 17,
          methodology: 18,
        },
      },
    },
    {
      id: 5,
      title: "Renewable Energy Efficiency Study",
      description: "Analysis of improvements to small-scale solar installations.",
      files: ["/uploads/proposals/renewable-proposal.pdf"],
      fiscalYear: "2023",
      status: "rejected",
      reviewerComments: "Insufficient methodology and unclear budget justification.",
      marks: null,
      funding: null,
      rejectionReason:
        "Rejected: budget unrealistic and methodology lacks necessary detail.",
      finalReport: null,
    },
  ];

  const proposal = proposals.find((p) => p.id === Number(id));

  if (!proposal) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Proposal not found.</div>
        <Link href="/researcher/dashboard/my-proposals" className="btn btn-secondary">
          Back to list
        </Link>
      </div>
    );
  }

  const totalMarks = proposal.marks
    ? Object.values(proposal.marks).reduce((s, v) => s + v, 0)
    : null;

  const finalReportTotal =
    proposal.finalReport && proposal.finalReport.marks
      ? Object.values(proposal.finalReport.marks).reduce((s, v) => s + v, 0)
      : null;

  const [finalReportFile, setFinalReportFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function prettyStatusLabel(status) {
    return {
      under_review: "Under Review",
      reviewed: "Reviewed",
      ongoing: "Ongoing",
      completed: "Completed",
      rejected: "Rejected",
    }[status] ?? status;
  }

  function badgeClass(status) {
    switch (status) {
      case "completed":
        return "bg-success";
      case "ongoing":
        return "bg-primary";
      case "under_review":
        return "bg-warning text-dark";
      case "reviewed":
        return "bg-info text-dark";
      case "rejected":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  }

  return (
    <div className="container mt-4">
      <h2>{proposal.title}</h2>

      <p>
        <strong>Status:</strong>{" "}
        <span className={`badge ${badgeClass(proposal.status)}`}>
          {prettyStatusLabel(proposal.status)}
        </span>
      </p>

      <p>
        <strong>Fiscal Year:</strong> {proposal.fiscalYear}
      </p>

      <p>{proposal.description}</p>

      <h6 className="mt-3">Uploaded Files</h6>
      <ul>
        {proposal.files.map((f, i) => (
          <li key={i}>
            <a href={f} target="_blank" rel="noreferrer">
              {f.split("/").slice(-1)[0]}
            </a>
          </li>
        ))}
      </ul>

      {/* UNDER REVIEW */}
      {proposal.status === "under_review" && (
        <div className="alert alert-warning mt-3">This proposal is currently under review.</div>
      )}

      {/* REVIEWED (review completed but project may not be started) */}
      {proposal.status === "reviewed" && (
        <div className="mt-4">
          <h5>Reviewer Feedback</h5>
          <p><strong>Comments:</strong> {proposal.reviewerComments}</p>

          {proposal.marks && (
            <>
              <h6 className="mt-3">Marks Breakdown</h6>
              <table className="table table-bordered table-sm w-50">
                <thead className="table-light">
                  <tr>
                    <th>Category</th>
                    <th>Marks (out of 20)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(proposal.marks).map(([k, v]) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td>{v}</td>
                    </tr>
                  ))}
                  <tr className="fw-bold">
                    <td>Total</td>
                    <td>{totalMarks} / 100</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* ONGOING -> show reviewer feedback + funding + submit final report */}
      {proposal.status === "ongoing" && (
        <>
          <div className="mt-4">
            <h5>Reviewer Feedback</h5>
            <p><strong>Comments:</strong> {proposal.reviewerComments}</p>

            {proposal.marks && (
              <>
                <h6 className="mt-3">Marks Breakdown</h6>
                <table className="table table-bordered table-sm w-50">
                  <thead className="table-light">
                    <tr>
                      <th>Category</th>
                      <th>Marks (out of 20)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(proposal.marks).map(([k, v]) => (
                      <tr key={k}>
                        <td>{k}</td>
                        <td>{v}</td>
                      </tr>
                    ))}
                    <tr className="fw-bold">
                      <td>Total</td>
                      <td>{totalMarks} / 100</td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </div>

          {/* Funding */}
          {proposal.funding && (
            <div className="mt-4">
              <h5>Funding & Payments</h5>
              <p><strong>Total Amount:</strong> ${proposal.funding.totalAmount}</p>
              <p><strong>Slots Released:</strong> {proposal.funding.slotsReleased} / {proposal.funding.totalSlots}</p>
              <p><strong>Released Amount:</strong> ${proposal.funding.releasedAmount}</p>
              <p><strong>Remaining:</strong> ${proposal.funding.totalAmount - proposal.funding.releasedAmount}</p>
            </div>
          )}

          {/* Submit final report */}
          <div className="mt-4">
            <h5>Submit Final Report</h5>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitting(true);
                // Mock submit
                setTimeout(() => {
                  setSubmitting(false);
                  alert("Final report submitted (mock). Officer will review it.");
                  // optionally redirect back
                  // router.push("/researcher/dashboard/my-proposals");
                }, 800);
              }}
            >
              <div className="mb-3">
                <label className="form-label">Upload Final Report (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  className="form-control"
                  required
                  onChange={(e) => setFinalReportFile(e.target.files?.[0] ?? null)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-control" rows="3" placeholder="Short notes about the submission" />
              </div>

              <button className="btn btn-success" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Final Report"}
              </button>
            </form>
          </div>
        </>
      )}

      {/* REJECTED */}
      {proposal.status === "rejected" && (
        <div className="mt-4">
          <div className="alert alert-danger">This proposal was rejected.</div>
          {proposal.rejectionReason && <p><strong>Reason:</strong> {proposal.rejectionReason}</p>}
        </div>
      )}

      {/* COMPLETED -> show final report + final review */}
      {proposal.status === "completed" && proposal.finalReport && (
        <div className="mt-4">
          <h5>Final Report</h5>
          <p>
            <strong>File:</strong>{" "}
            <a href={proposal.finalReport.file} target="_blank" rel="noreferrer">
              {proposal.finalReport.file.split("/").slice(-1)[0]}
            </a>
          </p>
          <p><strong>Reviewed By:</strong> {proposal.finalReport.reviewer}</p>
          <p><strong>Reviewer Comments:</strong> {proposal.finalReport.comments}</p>

          {proposal.finalReport.marks && (
            <>
              <h6 className="mt-3">Final Report Marks</h6>
              <table className="table table-bordered table-sm w-50">
                <thead className="table-light">
                  <tr>
                    <th>Category</th>
                    <th>Marks (out of 20)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(proposal.finalReport.marks).map(([k, v]) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td>{v}</td>
                    </tr>
                  ))}
                  <tr className="fw-bold">
                    <td>Total</td>
                    <td>{finalReportTotal} / 100</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* Funding summary for completed project */}
          {proposal.funding && (
            <div className="mt-4">
              <h6>Funding Summary</h6>
              <p><strong>Total:</strong> ${proposal.funding.totalAmount}</p>
              <p><strong>Released:</strong> ${proposal.funding.releasedAmount} ({proposal.funding.slotsReleased}/{proposal.funding.totalSlots})</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <Link href="/researcher/dashboard/proposals" className="btn btn-secondary">
          Back to My Proposals
        </Link>
      </div>
    </div>
  );
}
