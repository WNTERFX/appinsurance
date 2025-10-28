import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./reset-login-styles.css";
import { db } from "../dbServer";

export default function PasswordResetConfirm() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    // Check if user arrived via password reset link
    const checkSession = async () => {
      const { data: { session }, error } = await db.auth.getSession();
      
      if (error || !session) {
        alert("Invalid or expired reset link. Please request a new one.");
        navigate("/appinsurance/reset-password");
        return;
      }
      
      setValidToken(true);
    };

    checkSession();
  }, [navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      // Update password using Supabase Auth
      const { error } = await db.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      alert("✅ Password reset successful! You can now log in with your new password.");
      
      // Sign out to force fresh login
      await db.auth.signOut();
      
      navigate("/appinsurance");
    } catch (error) {
      console.error("Password update error:", error);
      alert("Failed to reset password: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleNewPassword = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPassword = () => setConfirmVisible(!confirmVisible);

  if (!validToken) {
    return (
      <div className="reset-page">
        <div className="reset-box">
          <div className="reset-header">
            <div className="header-left">
              <h2>VERIFYING...</h2>
              <p>Please wait while we verify your reset link</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-page">
      <div className="reset-box">
        <div className="reset-header">
          <div className="header-left">
            <h2>NEW PASSWORD</h2>
            <p>Create a strong password for your account</p>
          </div>
          <img 
            className="header-logo" 
            src={require("./images/logo_.png")} 
            alt="silverstar_insurance_inc_Logo" 
          />
        </div>
        
        <form className="reset-form" onSubmit={handleResetPassword}>
          <label>New Password</label>
          <div className="password-wrapper">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter new password (min. 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
            <span onClick={toggleNewPassword} className="eye-icon">
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input
              type={confirmVisible ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
            <span onClick={toggleConfirmPassword} className="eye-icon">
              {confirmVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          
          <button 
            type="submit"
            className="reset-button"
            disabled={!newPassword || !confirmPassword || loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <a 
            href="#" 
            className="back-link"
            onClick={(e) => { 
              e.preventDefault(); 
              navigate("/appinsurance/login");
            }}
          >
            Back to Login
          </a>
        </form>
      </div>
    </div>
  );
}