import "./login-styles.css"
import "./images/logo-login.png"
import "./images/logo_.png"
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginFunction } from "./LoginFormActions";
import { FaEye, FaEyeSlash } from "react-icons/fa";
// Make sure this path is correct and the file exists!
import { CustomAlert } from "../ReusableComponents/CustomAlert"; 

export default function LoginForm({ anotherLoginDetected, setSession }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Alert State
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  let navigate = useNavigate();

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    // Auto hide after 5 seconds
    setTimeout(() => {
      setAlertMessage("");
      setAlertType("");
    }, 5000);
  };

  const closeAlert = () => {
    setAlertMessage("");
    setAlertType("");
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setAlertMessage(""); // Clear previous alerts
    
    if (!email.trim() || !password.trim()) {
      showAlert("Login failed: Invalid login credentials", "error");
      return;
    }

    const result = await loginFunction(email, password);

    if (!result.success) {
      showAlert("Login failed: " + result.error, "error");
      return;
    }

    // Save session locally
    const sessionData = {
      userId: result.userId,
      accessToken: result.accessToken,
      isAdmin: result.isAdmin,
      first_name: result.first_name,
      last_name: result.last_name,
      personnel_Name: result.personnel_Name,
      email: result.email
    };

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("user_session", JSON.stringify(sessionData));

    if (setSession) {
      setSession(sessionData);
    }

    showAlert("Login successful!", "success");

    setTimeout(() => {
      navigate("/appinsurance/main-app/dashboard");
    }, 1000);
  };

  return (
    <div className="login-page">
      
      {/* --- FIX: PLACED ALERT HERE (Outside the login-box) --- */}
      {/* This ensures the overlay covers the whole screen and isn't cut off */}
      {alertMessage && (
        <CustomAlert 
          message={alertMessage} 
          type={alertType} 
          onClose={closeAlert}
        />
      )}
      {/* ----------------------------------------------------- */}

      <div className="login-box">
        <div className="login-header">
          <div className="header-left">
            <h2>LOGIN</h2>
            <p>Welcome back to Silverstar Insurance Inc.</p>
          </div>
          <img 
            className="header-logo" 
            src={require("./images/logo_.png")} 
            alt="silverstar_insurance_inc_Logo" 
          />
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={passwordVisible ? "text" : "password"} 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span onClick={togglePassword} className="eye-icon">
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="remember-me-wrapper">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
          </div>

          <a 
            href="#" 
            className="forgot-password"
            onClick={(e) => {
              e.preventDefault();
              navigate("/appinsurance/reset-password");
            }}
          >
            Forgot password?
          </a>

          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>    
  );
}