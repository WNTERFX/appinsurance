import "./login-styles.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginFunction } from "./LoginFormActions";
import { FaEye, FaEyeSlash } from "react-icons/fa";
// Make sure this path is correct and the file exists!
import { CustomAlert } from "../ReusableComponents/CustomAlert"; 

export default function LoginForm({ setSession, setCurrentUser }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  const navigate = useNavigate();

  const togglePassword = () => setPasswordVisible(!passwordVisible);

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
    setAlertMessage("");

    if (!email.trim() || !password.trim()) {
      showAlert("Login failed: Invalid login credentials", "error");
      return;
    }

    const result = await loginFunction(email, password);

    if (!result.success) {
      showAlert("Login failed: " + result.error, "error");
      return;
    }

    // Save user data
    const userData = {
      id: result.id,
      email: result.email,
      first_name: result.first_name,
      last_name: result.last_name,
      is_Admin: result.is_Admin,
      access_token: result.access_token,
    };

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("currentUser", JSON.stringify(userData));

    if (setSession) setSession(result);
    if (setCurrentUser) setCurrentUser(userData);

    showAlert("Login successful!", "success");

    setTimeout(() => {
      navigate("/appinsurance/main-app/dashboard");
    }, 800);
  };

  return (
    <div className="login-page">
      {alertMessage && (
        <CustomAlert message={alertMessage} type={alertType} onClose={closeAlert} />
      )}

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

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
