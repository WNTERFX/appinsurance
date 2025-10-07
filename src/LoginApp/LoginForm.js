import "./login-styles.css"
import "./images/logo-login.png"
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginFunction } from "./LoginFormActions";

export default function LoginForm({ anotherLoginDetected }) {
  let navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();
  const result = await loginFunction(email, password);

  if (!result.success) {
    alert("Login failed: " + result.error);
    return;
  }

  // ✅ Save session locally
  localStorage.setItem("user_id", result.userId);
  localStorage.setItem("session_token", result.accessToken);
  localStorage.setItem("is_admin", result.isAdmin ? "true" : "false");

  // ✅ Navigate after saving session
  if (result.isAdmin) {
    navigate("/appinsurance/MainArea/Dashboard");
  } else {
    navigate("/appinsurance/MainAreaModerator/DashboardModerator");
  }
};

  return (
    
    <div className="login-container">

      <div className="container">
        <div className="login-card">
          <div className="logo-panel">
            <img
              src={require("./images/logo-login.png")}
              alt="silverstar_insurance_inc_Logo"
            />
          </div>
          <div className="right-panel">
            <h2>Log In to your account</h2>
            <form onSubmit={handleLogin}>
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="button-wrapper">
              <button type="submit" className="btn btn-button">Login</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}