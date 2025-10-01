"use client";
import { circulars } from "@/lib/circular";
import Link from "next/link";
import { useState } from "react";

export default function AllCirculars() {
  const [search, setSearch] = useState("");

  const filteredCirculars = circulars.filter((c) =>
    [c.title, c.notice_code, c.type]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="container my-5">
      <h2 className="mb-4">All Circulars</h2>

      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="Search circulars..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="table table-hover table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Notice Code</th>
            <th>Title</th>
            <th>Type</th>
            <th>Published Date</th>
            <th>Attachment</th>
          </tr>
        </thead>
        <tbody>
          {filteredCirculars.length > 0 ? (
            filteredCirculars.map((c) => (
              <tr key={c.id}>
                <td>{c.notice_code}</td>
                <td>{c.title}</td>
                <td>
                  <span className="badge bg-primary">{c.type}</span>
                </td>
                <td>{c.notice_published_date}</td>
                <td>
                  <a href={c.attachment} target="_blank" className="btn btn-sm btn-outline-info">
                    View
                  </a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4">
                No circulars found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Link href="/officer/dashboard/circulars/create-circular" className="btn btn-primary mt-3">
        + Create Circular
      </Link>
    </div>
  );
}
