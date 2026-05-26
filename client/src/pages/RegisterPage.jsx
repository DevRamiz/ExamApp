import { useState } from "react";
import { mockApiService } from "../api/mockApiService";
import { notifyService } from "../services/notifyService";

function RegisterPage({ onRegister, goToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  function handleSubmit(event) {
    event.preventDefault();

    try {
      const user = mockApiService.register(name, email, password, role);
      onRegister(user);
      notifyService.success("Registration succeeded");
    } catch (error) {
      notifyService.error(error.message);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>E-Test System</h1>
        <h2>Register</h2>

        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} required />

          <label>Email</label>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

          <label>Password</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />

          <label>Role</label>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          <button type="submit">Register</button>
        </form>

        <button className="link-button" onClick={goToLogin}>Back to login</button>
      </div>
    </section>
  );
}

export default RegisterPage;
