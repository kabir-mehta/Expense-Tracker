// src/components/Navbar.jsx
import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call backend logout route
      await axios.post(
        "http://localhost:5000/api/logout",
        {},
        { withCredentials: true }
      );

      // Clear local storage / frontend token if any
      localStorage.removeItem("token");

      // Redirect to login page
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      alert("Error logging out");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <span className="navbar-brand fw-bold">💰 Expense Tracker</span>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="/dashboard">Dashboard</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/expenses">Expenses</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/reports">Reports</a>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-sm btn-danger ms-3"
                onClick={handleLogout} // use our new function
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
