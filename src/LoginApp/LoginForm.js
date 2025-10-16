import "./login-styles.css"
import "./images/logo-login.png"
import "./images/logo_.png"
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginFunction } from "./LoginFormActions";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginForm({ anotherLoginDetected }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  let navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

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
    navigate("/appinsurance/main-app/dashboard");
  } else {
    navigate("/appinsurance/main-app/dashboard");;
  }
};

return (
  <div className="login-page">
    <div  className="login-box">
      <div className="login-header">
        <div className="header-left">
          <h2>LOGIN</h2>
          <p>Welcome back to Silverstar Insurance Inc.</p>
        </div>
         <img className="header-logo" src={require("./images/logo_.png")} alt="silverstar_insurance_inc_Logo" />
      </div>
            
      <form className="login-form" onSubmit={handleLogin}>
        <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

        <label>Password</label>
        <div className="password-wrapper">
          <input
            type={passwordVisible ? "text" : "password"} 
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
            <span onClick={togglePassword} className="eye-icon">
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
        </div>

          <a href="#" className="forgot-password">
            Forgot password?
          </a>

      <button type="submit" className="login-button">Login</button>
     </form>
    </div>
  </div>    
  );
}