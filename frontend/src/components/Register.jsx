import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/register", {
        username: username,
        password: password
      }, {
        withCredentials: true, 
        headers: { "Content-Type": "application/json" }
      });
      alert("Registration successful! Please login.");
      window.location.href = "/login";
    } catch (err) {
      alert("Error registering user");
    }
  };

  return (
    <div className= "container mt-4">
      <h2 className="mb-3">💰 Expense Tracker System</h2>
      <div className="container d-flex justify-content-center align-items-center vh-75">
        <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
          <h2 className="text-center mb-4">Register</h2>
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-success w-100">
              Register
            </button>
          </form>
          <p className="mt-3 text-center">
            Already have an account?{" "}
            <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
