import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/admin.css";

function AdminPanel() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/admin/submissions")
      .then((res) => setSubmissions(res.data))
      .catch((err) => console.error("Error loading submissions:", err));
  }, []);
useEffect(() => {
  const isAdmin = localStorage.getItem("isAdmin");
  if (isAdmin !== "true") {
    navigate("/"); // Redirect to login
  }
}, []);

  return (
    <div className="admin-panel">
      <h2> Admin Panel – Submissions Overview</h2>
      <div className="table-wrapper">
      <table className="submissions-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Team</th>
            <th>Problem</th>
            <th>Language</th>
            <th>Submitted At</th>
            <th>Code</th>
            <th>Output</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => (
            <tr key={sub.id}>
              <td>{sub.team_id}</td>
              <td>{sub.team_name} </td>
              <td>{sub.problem_title}</td>
              <td>{sub.language}</td>
              <td>{new Date(sub.submitted_at).toLocaleString()}</td>
              <td>
                <pre className="code-preview">{sub.code}</pre>
              </td>
              <td>{sub.output}</td>
              <td>{sub.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default AdminPanel;
