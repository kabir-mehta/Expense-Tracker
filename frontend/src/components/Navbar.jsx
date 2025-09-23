// src/components/Navbar.jsx
import React from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";

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
      <span className="navbar-brand fw-bold">💰 My Expense Tracker</span>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <NavLink className="nav-link text-white fw-bold" to="/dashboard">Dashboard</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white fw-bold" to="/expenses">Expenses</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white fw-bold" to="/reports">Reports</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white fw-bold bg-danger px-3 rounded" to="/login">Logout</NavLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
);
}
