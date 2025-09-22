import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard", { withCredentials: true })
      .then(res => setStats(res.data))
      .catch(() => setStats(null));
  }, []);

  if (!stats) {
    return <div><Navbar /><div className="container mt-5">Loading...</div></div>;
  }

  return (
    <>
    <Navbar />

      <div className="container mt-5">
        <h2 className="mb-4 fw-bold">📊 Dashboard</h2>
        <div className="row">
          <div className="col-md-3 mb-3">
            <div className="card shadow text-center p-3">
              <h5>Total This Month</h5>
              <p className="fw-bold text-success">₹{stats.total_this_month}</p>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card shadow text-center p-3">
              <h5>Top Category</h5>
              <p className="fw-bold text-primary">{stats.top_category || "N/A"}</p>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card shadow text-center p-3">
              <h5>Total Expenses</h5>
              <p className="fw-bold">{stats.total_expenses}</p>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card shadow text-center p-3">
              <h5>Avg Daily Spend</h5>
              <p className="fw-bold text-warning">₹{stats.avg_daily}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
