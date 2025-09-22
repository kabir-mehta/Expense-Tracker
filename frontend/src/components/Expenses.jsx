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

  // Delete confirmation modal
  const [showModal, setShowModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Search & Filter states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [fromDate, setFromDate] = useState(""); 
  const [toDate, setToDate] = useState("");     

  // Sorting state
  const [sortBy, setSortBy] = useState(""); // "", "amount", "date", "category"

  const categoryColors = {
    Food: "danger",
    Travel: "primary",
    Rent: "success",
    Utilities: "warning",
    Shopping: "info",
    Others: "secondary"
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

  const confirmDelete = (id) => {
    setExpenseToDelete(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;
    await axios.delete(`http://localhost:5000/api/expenses/${expenseToDelete}`, { withCredentials: true });
    setShowModal(false);
    setExpenseToDelete(null);
    fetchExpenses();
  };

  // Filtered expenses with search, category, and date range
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? e.category === selectedCategory : true;
    const expenseDate = new Date(e.date);
    const matchesFromDate = fromDate ? expenseDate >= new Date(fromDate) : true;
    const matchesToDate = toDate ? expenseDate <= new Date(toDate) : true;
    return matchesSearch && matchesCategory && matchesFromDate && matchesToDate;
  });

  // Sort filtered expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (!sortBy) return 0;
    if (sortBy === "amount") return a.amount - b.amount;
    if (sortBy === "date") return new Date(a.date) - new Date(b.date);
    if (sortBy === "category") return a.category.localeCompare(b.category);
    return 0;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setFromDate("");
    setToDate("");
    setSortBy("");
  };

  return (
    <>
      <nav className="sticky-top">
        <Navbar />
      </nav>

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

        {/* Search, Filters, Sorting */}
        <div className="d-flex align-items-end mb-3 gap-2">
          <div className="flex-grow-1">
            <label className="form-label small">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search by description"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label small">Category</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Rent">Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Shopping">Shopping</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div>
            <label className="form-label small">From</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label small">To</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label small">Sort By</label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">None</option>
              <option value="amount">Amount</option>
              <option value="date">Date</option>
              <option value="category">Category</option>
            </select>
          </div>
          <div>
            <button className="btn btn-outline-secondary" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Amount</th><th>Date</th><th>Category</th><th>Description</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.map(e => (
              <tr key={e.id}>
                <td>₹{e.amount}</td>
                <td>{e.date}</td>
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
                    onClick={() => confirmDelete(e.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Delete Confirmation Modal */}
        {showModal && (
          <div className="modal show fade" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this expense?</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>No</button>
                  <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <button className="btn btn-outline-success mt-3" onClick={() => window.location.href="/api/expenses/export"}>
          ⬇️ Export to Excel
        </button>
      </div>
    </>
  );
}
