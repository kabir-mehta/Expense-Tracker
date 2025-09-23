import React, { useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username: username,
        password: password
      }, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">💰 Expense Tracker System</h2>
      <div className="container d-flex justify-content-center align-items-center vh-75">
        <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
          <h2 className="text-center mb-4">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label>Username</label>
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
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
          <p className="mt-3 text-center">
            Don’t have an account?{" "}
            <NavLink to="/register">Register here</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
