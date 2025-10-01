"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/home");
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Error fetching projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const goToDashboard = () => {
    const role = localStorage.getItem("role");
    if (role) {
      router.push(`/${role}/dashboard`);
    } else {
      router.push("/login");
    }
  };

  return (
    <div>
      <NavBar/>
      {/* Hero Section */}
      <div className="bg-primary text-white text-center p-5">
        <h1>Research Grant Management System</h1>
        <p>Submit, Review, and Manage Research Grants with Ease</p>
      </div>

      {/* Recent Projects Section */}
      <div className="card shadow p-4 mb-5">
        <h3 className="mb-3">Recent Projects</h3>
        {loading ? (
          <p>Loading...</p>
        ) : projects.length === 0 ? (
          <p>No recent projects found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Researcher</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.status === "under_review"
                            ? "bg-warning text-dark"
                            : p.status === "reviewed"
                            ? "bg-info text-dark"
                            : p.status === "approved"
                            ? "bg-success"
                            : p.status === "rejected"
                            ? "bg-danger"
                            : "bg-secondary"
                        }`}
                      >
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>{p.researcher_name}</td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="text-center mt-4">
          <button onClick={goToDashboard} className="btn btn-primary btn-lg">
            Go to Dashboard
          </button>
        </div>
      </div>
      {/* Features Section */}
      <div className="container my-5">
        <h2 className="text-center mb-4">Why Use Our Platform?</h2>
        <div className="row text-center">
          <div className="col-md-4 mb-3">
            <div className="card p-4 shadow-sm h-100">
              <h4>For Researchers</h4>
              <p>Submit grant proposals easily, track progress, and receive feedback in real time.</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card p-4 shadow-sm h-100">
              <h4>For Reviewers</h4>
              <p>Review proposals, provide scores, and manage evaluations in one dashboard.</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card p-4 shadow-sm h-100">
              <h4>For Administrators</h4>
              <p>Manage users, allocate grants, and generate reports for better decision making.</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-light py-5">
        <div className="container text-center">
          <h2>About the System</h2>
          <p className="lead">
            The Research Grant Management System streamlines the process of submitting, reviewing, and approving research proposals, making funding allocation transparent and efficient.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container text-center my-5">
        <h2>Contact Us</h2>
        <p>Email: support@researchgrants.com</p>
        <p>Phone: +123 456 7890</p>
      </div>
    </div>
  );
}

