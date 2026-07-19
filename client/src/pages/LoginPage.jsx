import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "teacher@test.com", password: "123456" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : user.role === "teacher" ? "/teacher" : "/student"} replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const current = await login(form);
      navigate(current.role === "admin" ? "/admin" : current.role === "teacher" ? "/teacher" : "/student");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="brand auth-brand"><span>EF</span><div><strong>ExamFlow</strong><small>Full-stack exam system</small></div></div>
        <h1>Welcome back</h1>
        <p className="muted">Sign in as an administrator, lecturer, or student.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} className="form-stack">
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
          <button className="button button-primary" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
        </form>
        <div className="demo-box">
          <strong>Demo accounts</strong>
          <button type="button" onClick={() => setForm({ email: "admin@test.com", password: "123456" })}>Admin</button>
          <button type="button" onClick={() => setForm({ email: "teacher@test.com", password: "123456" })}>Teacher</button>
          <button type="button" onClick={() => setForm({ email: "student@test.com", password: "123456" })}>Student</button>
        </div>
        <p className="auth-link">New student? <Link to="/register">Create an account</Link></p>
      </section>
    </div>
  );
}
