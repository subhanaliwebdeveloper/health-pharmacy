import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav          = useNavigate();

  const [f, setF]       = useState({ name: '', email: '', password: '' });
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await register(f);
      nav('/');
    } catch (e) {
      setErr(e.message);
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
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            minLength="6"
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
            required
          />
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