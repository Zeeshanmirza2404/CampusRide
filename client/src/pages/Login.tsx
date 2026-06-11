import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      console.log("[Login Debug] result:", result);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error("[Login Error]:", err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <i className="bi bi-car-front-fill logo-icon" style={{ fontSize: '32px' }}></i>
          <span className="logo-text" style={{ fontSize: '28px' }}>CampusRide</span>
        </div>

        <h2 className="text-center mb-2">Welcome Back</h2>
        <p className="text-center text-muted-custom mb-4">
          Sign in to continue to your account
        </p>

        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-control form-control-custom ${error && !email ? 'is-invalid' : ''}`}
              placeholder="Enter your email"
              value={email}
              onChange={handleInputChange(setEmail)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-control form-control-custom ${error && !password ? 'is-invalid' : ''}`}
              placeholder="Enter your password"
              value={password}
              onChange={handleInputChange(setPassword)}
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
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
