import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/student" replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      await register(form);
      navigate("/student");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="brand auth-brand"><span>EF</span><div><strong>ExamFlow</strong><small>Student registration</small></div></div>
        <h1>Create student account</h1>
        <p className="muted">Lecturer accounts are created by the system administrator.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} className="form-stack">
          <label>Full name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Password (8+ characters, a letter and number)<input type="password" minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
          <button className="button button-primary" disabled={busy}>{busy ? "Creating..." : "Create account"}</button>
        </form>
        <p className="auth-link">Already registered? <Link to="/login">Sign in</Link></p>
      </section>
    </div>
  );
}
