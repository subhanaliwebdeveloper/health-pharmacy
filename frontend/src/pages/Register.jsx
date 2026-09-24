import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav          = useNavigate();

  const [f, setF]                     = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [err, setErr]                 = useState('');
  const [busy, setBusy]               = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (f.password !== f.confirmPassword) {
      setErr('Passwords do not match');
      return;
    }
    if (f.password.length < 6) {
      setErr('Password must be at least 6 characters long');
      return;
    }

    setBusy(true);
    setErr('');
    try {
      await register({ name: f.name, email: f.email, password: f.password });
      nav('/');
    } catch (e) {
      setErr(e.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-head">
          <span className="brand-icon">✚</span>
          <h1>Create an Account</h1>
          <p>Register for a better pharmacy experience</p>
        </div>

        {err && <div className="error">{err}</div>}

        <label>
          Full Name
          <input
            type="text"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="Enter your full name"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
            placeholder="Enter your email address"
            required
          />
        </label>

        <label>
          Password
          <div className="password-field-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              minLength="6"
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
              placeholder="At least 6 characters"
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </label>

        <label>
          Confirm Password
          <div className="password-field-wrap">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              minLength="6"
              value={f.confirmPassword}
              onChange={(e) => setF({ ...f, confirmPassword: e.target.value })}
              placeholder="Re-enter your password"
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </label>

        <button className="btn-primary full" type="submit" disabled={busy}>
          {busy ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="center">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}