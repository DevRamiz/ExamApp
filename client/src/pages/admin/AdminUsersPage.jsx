import { useEffect, useState } from "react";
import { apiRequest } from "../../api/http.js";

const emptyForm = { name: "", email: "", password: "", role: "teacher" };
export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function load() { try { const data = await apiRequest(`/admin/users?search=${encodeURIComponent(search)}`); setUsers(data.users); } catch (err) { setError(err.message); } }
  useEffect(() => { load(); }, []);
  async function create(event) { event.preventDefault(); setError(""); try { await apiRequest("/admin/users", { method: "POST", body: JSON.stringify(form) }); setForm(emptyForm); setMessage("User created."); load(); } catch (err) { setError(err.message); } }
  async function update(user, patch) { setError(""); try { await apiRequest(`/admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify(patch) }); load(); } catch (err) { setError(err.message); } }
  return <div><header className="page-header"><div><p className="eyebrow">Admin tools</p><h1>User management</h1><p>Create lecturers, disable accounts, change roles, and unlock users.</p></div></header>{error && <div className="alert alert-error">{error}</div>}{message && <div className="alert alert-success">{message}</div>}
    <form className="card form-grid" onSubmit={create}><label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label><label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label><label>Temporary password<input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength="8" required /></label><label>Role<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="teacher">Teacher</option><option value="student">Student</option><option value="admin">Admin</option></select></label><div className="span-2"><button className="button button-primary">Create user</button></div></form>
    <section className="card inline-search"><input placeholder="Search users" value={search} onChange={(e) => setSearch(e.target.value)} /><button className="button button-secondary" onClick={load}>Search</button></section>
    <div className="table-card"><table><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Locked</th><th>Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><small>{user.email}</small></td><td><select value={user.role} onChange={(e) => update(user, { role: e.target.value })}><option value="admin">Admin</option><option value="teacher">Teacher</option><option value="student">Student</option></select></td><td>{user.isActive ? "Active" : "Disabled"}</td><td>{user.lockedUntil ? new Date(user.lockedUntil).toLocaleString() : "No"}</td><td><div className="row-actions"><button className="button button-small button-secondary" onClick={() => update(user, { isActive: !user.isActive })}>{user.isActive ? "Disable" : "Enable"}</button>{user.lockedUntil && <button className="button button-small button-secondary" onClick={() => update(user, { unlock: true })}>Unlock</button>}</div></td></tr>)}</tbody></table></div>
  </div>;
}
