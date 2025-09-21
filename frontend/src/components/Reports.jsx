// src/components/Reports.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Reports() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState({ monthly: [], categories: [] });

  useEffect(() => {
    axios.get("http://localhost:5000/api/reports", { withCredentials: true })
      .then(res => setReportData(res.data));
  }, []);

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">📊 Expense Reports</h2>

      <div className="row">
        <div className="col-md-6">
          <div className="card p-3 shadow">
            <h5 className="text-center">Monthly Expenses</h5>
            <Bar
              data={{
                labels: reportData.monthly.map(m => m.month),
                datasets: [{ label: "Total Spent", data: reportData.monthly.map(m => m.amount), backgroundColor: "#0d6efd" }]
              }}
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3 shadow">
            <h5 className="text-center">By Category</h5>
            <Pie
              data={{
                labels: reportData.categories.map(c => c.category),
                datasets: [{ data: reportData.categories.map(c => c.amount), backgroundColor: ["#0d6efd", "#198754", "#dc3545", "#ffc107", "#6610f2"] }]
              }}
            />
          </div>
        </div>
      </div>

      <button className="btn btn-secondary btn-sm" onClick={goToDashboard}>⬅️ Back to Dashboard</button>
    </div>
  );
}
