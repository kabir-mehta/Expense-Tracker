import React, { useState, useEffect } from "react";

export default function ExpenseForm({ onSubmit, expense }) {
  const [amount, setAmount] = useState(expense?.amount || "");
  const [category, setCategory] = useState(expense?.category || "");
  const [date, setDate] = useState(expense?.date || "");
  const [description, setDescription] = useState(expense?.description || "");

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount);
      setCategory(expense.category);
      setDate(expense.date);
      setDescription(expense.description);
    }
  }, [expense]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ amount, category, date, description });
    setAmount(""); setCategory(""); setDate(""); setDescription("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <input
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <input
        placeholder="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Save</button>
    </form>
  );
}
