"use client";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ProposalDetailsPage() {
  const { id } = useParams();

  // ✅ Always call hooks at the top level
  const [finalReportFile, setFinalReportFile] = useState(null);

  // Dummy proposals data
  const proposals = [
    {
      id: "1",
      title: "AI in Healthcare",
      description: "This proposal explores the use of AI in healthcare systems...",
      files: ["proposal.pdf", "budget.xlsx"],
      status: "pending_review",
      reviewerComments: "",
      marks: null,
      funding: null,
      finalReport: null,
    },
    {
      id: "2",
      title: "Climate Change Impact Study",
      description: "Research on long-term effects of climate change...",
      files: ["climate-proposal.pdf"],
      status: "reviewed",
      reviewerComments: "Well-prepared proposal, approved.",
      marks: {
        feasibility: 18,
        impact: 19,
        usefulness: 17,
        innovation: 16,
        methodology: 18,
      },
      funding: {
        totalAmount: 8000,
        slotsReleased: 2,
        totalSlots: 4,
        releasedAmount: 4000,
      },
      finalReport: null,
    },
    {
      id: "3",
      title: "Smart Agriculture with IoT",
      description: "Using IoT sensors to optimize crop yield.",
      files: ["iot-agriculture.pdf"],
      status: "ongoing",
      reviewerComments: "Approved, funding released in slots.",
      marks: {
        feasibility: 17,
        impact: 18,
        usefulness: 19,
        innovation: 15,
        methodology: 16,
      },
      funding: {
        totalAmount: 12000,
        slotsReleased: 1,
        totalSlots: 4,
        releasedAmount: 3000,
      },
      finalReport: null,
    },
    {
      id: "4",
      title: "Blockchain for Supply Chain",
      description: "Improving transparency in supply chain management using blockchain.",
      files: ["blockchain-proposal.pdf"],
      status: "completed",
      reviewerComments: "Strong implementation and final report delivered.",
      marks: {
        feasibility: 18,
        impact: 17,
        usefulness: 18,
        innovation: 19,
        methodology: 18,
      },
      funding: {
        totalAmount: 15000,
        slotsReleased: 4,
        totalSlots: 4,
        releasedAmount: 15000,
      },
      finalReport: {
        file: "final-report-blockchain.pdf",
        reviewer: "Dr. Sarah Lee",
        comments: "Excellent final report. Objectives achieved.",
        marks: {
          feasibility: 19,
          impact: 18,
          usefulness: 20,
          innovation: 18,
          methodology: 19,
        },
      },
    },
    {
      id: "5",
      title: "Renewable Energy Efficiency Study",
      description: "Research on improving renewable energy efficiency.",
      files: ["renewable-energy.pdf"],
      status: "rejected",
      reviewerComments: "Proposal lacks feasibility.",
      marks: null,
      funding: null,
      finalReport: null,
    },
  ];

  // Find proposal by ID
  const proposal = proposals.find((p) => p.id === id);

  if (!proposal) {
    return (
      <div className="container mt-4">
        <h2>Proposal Not Found</h2>
      </div>
    );
  }

  const totalMarks = proposal.marks
    ? Object.values(proposal.marks).reduce((sum, val) => sum + val, 0)
    : 0;

  const finalReportTotal =
    proposal.finalReport && proposal.finalReport.marks
      ? Object.values(proposal.finalReport.marks).reduce((a, b) => a + b, 0)
      : 0;

  return (
    <div className="container mt-4">
      <h2>{proposal.title}</h2>
      <p>
        <strong>Status:</strong>{" "}
        <span
          className={`badge ${
            proposal.status === "pending_review"
              ? "bg-warning text-dark"
              : proposal.status === "reviewed"
              ? "bg-info"
              : proposal.status === "ongoing"
              ? "bg-primary"
              : proposal.status === "completed"
              ? "bg-success"
              : proposal.status === "rejected"
              ? "bg-danger"
              : "bg-secondary"
          }`}
        >
          {proposal.status}
        </span>
      </p>
      <p>{proposal.description}</p>

      <h5>Uploaded Files</h5>
      <ul>
        {proposal.files.map((file, idx) => (
          <li key={idx}>
            <a href={`/${file}`} download>
              {file}
            </a>
          </li>
        ))}
      </ul>

      {/* Reviewer Feedback & Marks */}
      {proposal.status !== "pending_review" && proposal.marks && (
        <div className="mt-4">
          <h5>Reviewer Feedback</h5>
          <p>
            <strong>Comments:</strong> {proposal.reviewerComments}
          </p>

          <h6>Marks Breakdown</h6>
          <table className="table table-bordered table-sm w-50">
            <thead className="table-light">
              <tr>
                <th>Category</th>
                <th>Marks (out of 20)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(proposal.marks).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
              <tr className="fw-bold">
                <td>Total</td>
                <td>{totalMarks} / 100</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Funding Info */}
      {(proposal.status === "ongoing" ||
        proposal.status === "reviewed" ||
        proposal.status === "completed") &&
        proposal.funding && (
          <div className="mt-5">
            <h5>Funding & Payments</h5>
            <p>
              <strong>Total Amount:</strong> ${proposal.funding.totalAmount}
            </p>
            <p>
              <strong>Slots Released:</strong> {proposal.funding.slotsReleased} /{" "}
              {proposal.funding.totalSlots}
            </p>
            <p>
              <strong>Released Amount:</strong> ${proposal.funding.releasedAmount}
            </p>
            <p>
              <strong>Remaining:</strong> $
              {proposal.funding.totalAmount - proposal.funding.releasedAmount}
            </p>
          </div>
        )}

      {/* Submit Final Report if ongoing */}
      {proposal.status === "ongoing" && (
        <div className="mt-5">
          <h5>Submit Final Report</h5>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Final report submitted!");
            }}
          >
            <div className="mb-3">
              <label className="form-label">Upload Final Report</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => setFinalReportFile(e.target.files[0])}
              />
            </div>
            <button type="submit" className="btn btn-success">
              Submit Report
            </button>
          </form>
        </div>
      )}

      {/* Final Report Section if completed */}
      {proposal.status === "completed" && proposal.finalReport && (
        <div className="mt-5">
          <h5>Final Report</h5>
          <p>
            <strong>File:</strong>{" "}
            <a href={`/${proposal.finalReport.file}`} download>
              {proposal.finalReport.file}
            </a>
          </p>
          <p>
            <strong>Reviewed By:</strong> {proposal.finalReport.reviewer}
          </p>
          <p>
            <strong>Reviewer Comments:</strong> {proposal.finalReport.comments}
          </p>

          <h6>Final Report Marks</h6>
          <table className="table table-bordered table-sm w-50">
            <thead className="table-light">
              <tr>
                <th>Category</th>
                <th>Marks (out of 20)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(proposal.finalReport.marks).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
              <tr className="fw-bold">
                <td>Total</td>
                <td>{finalReportTotal} / 100</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
