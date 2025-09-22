// src/components/Expenses.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function Expenses() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ amount: "", date: "", category: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  // ✅ Same category colors as Reports.jsx pie chart
  const categoryColors = {
    Food: "danger",     // red
    Travel: "primary",  // blue
    Rent: "success",    // green
    Utilities: "warning", // yellow
    Shopping: "info",   // light blue
    Others: "secondary" // gray
  };

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    const res = await axios.get("http://localhost:5000/api/expenses", { withCredentials: true });
    setExpenses(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`http://localhost:5000/api/expenses/${editingId}`, form, { withCredentials: true });
      setEditingId(null);
    } else {
      await axios.post("http://localhost:5000/api/expenses", form, { withCredentials: true });
    }
    setForm({ amount: "", date: "", category: "", description: "" });
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/expenses/${id}`, { withCredentials: true });
    fetchExpenses();
  };

  const handleExport = async () => {
    const res = await axios.get("http://localhost:5000/api/expenses/export", {
      withCredentials: true,
      responseType: "blob"
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };


  return (
    <>
      <Navbar />
      
      <div className="container mt-4">

        <h2 className="mb-3 fw-bold">Manage Expenses</h2>

        {/* Form */}
        <div className="card p-3 mb-4">
          <form onSubmit={handleSubmit} className="row g-2">
            <div className="col-md-2">
              <input type="number" className="form-control" placeholder="Amount"
                value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <input type="date" className="form-control"
                value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="col-md-2">
              {/* ✅ Dropdown for category */}
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Shopping">Shopping</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="col-md-3">
              <input type="text" className="form-control" placeholder="Description"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Amount</th><th>Date</th><th>Category</th><th>Description</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}>
                <td>₹{e.amount}</td>
                <td>{e.date}</td>
                {/* ✅ Dynamic badge color based on category */}
                <td>
                  <span className={`badge bg-${categoryColors[e.category] || "secondary"}`}>
                    {e.category}
                  </span>
                </td>
                <td>{e.description}</td>
                <td>
                  <button className="btn btn-warning btn-sm me-2"
                    onClick={() => { setForm(e); setEditingId(e.id); }}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(e.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="btn btn-outline-success mt-3" onClick={handleExport}>⬇️ Export to Excel</button>
        <br />
        <br />
        {/* <button className="btn btn-secondary btn-sm" onClick={goToDashboard}>⬅️ Back to Dashboard</button> */}
      </div>
    </>
  );
}
