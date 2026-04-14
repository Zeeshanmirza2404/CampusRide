import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    role: "rider",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { name, email, phone, college, password, confirmPassword } = formData;

    if (!name || !email || !phone || !college || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const result = await signup({
        name,
        email,
        phone,
        college,
        role: formData.role,
        password,
      });

      console.log("[Signup Debug] result:", result);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Signup failed");
      }
    } catch (err) {
      console.error("[Signup Error]:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <i
            className="bi bi-car-front-fill logo-icon"
            style={{ fontSize: "32px" }}
          ></i>
          <span className="logo-text" style={{ fontSize: "28px" }}>
            CampusRide
          </span>
        </div>

        <h2 className="text-center mb-2">Create Account</h2>
        <p className="text-center text-muted-custom mb-4">
          Join the campus ride-sharing community
        </p>

        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className={`form-control form-control-custom ${error && !formData.name ? "is-invalid" : ""}`}
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className={`form-control form-control-custom ${error && !formData.email ? "is-invalid" : ""}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className={`form-control form-control-custom ${error && !formData.phone ? "is-invalid" : ""}`}
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">College Name</label>
            <input
              type="text"
              name="college"
              className={`form-control form-control-custom ${error && !formData.college ? "is-invalid" : ""}`}
              placeholder="Enter your college name"
              value={formData.college}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">User Type:</label>
            <select
              className="form-select form-control-custom"
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value }))
              }
            >
              <option value="rider">Rider</option>
              <option value="driver">Driver</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className={`form-control form-control-custom ${error && !formData.password ? "is-invalid" : ""}`}
              placeholder="Create a password (min 6 chars)"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className={`form-control form-control-custom ${error && !formData.confirmPassword ? "is-invalid" : ""}`}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-bold"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating Account...
              </>
            ) : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "var(--primary-color)", fontWeight: 500 }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
