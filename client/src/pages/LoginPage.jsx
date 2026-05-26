import { useState } from "react";
import { mockApiService } from "../api/mockApiService";
import { notifyService } from "../services/notifyService";

function LoginPage({ onLogin, goToRegister }) {
  const [email, setEmail] = useState("teacher@test.com");
  const [password, setPassword] = useState("123456");

  function handleSubmit(event) {
    event.preventDefault();

    try {
      const user = mockApiService.login(email, password);
      onLogin(user);
      notifyService.success("Login succeeded");
    } catch (error) {
      notifyService.error(error.message);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>E-Test System</h1>
        <h2>Login</h2>
        <p className="muted">Demo teacher: teacher@test.com / 123456</p>
        <p className="muted">Demo student: student@test.com / 123456</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} />

          <label>Password</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />

          <button type="submit">Login</button>
        </form>

        <button className="link-button" onClick={goToRegister}>Create new account</button>
      </div>
    </section>
  );
}

export default LoginPage;
