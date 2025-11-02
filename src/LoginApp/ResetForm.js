import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./reset-login-styles.css";
import { db } from "../dbServer"; // Import your Supabase client

export default function PasswordResetForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send password reset email using Supabase Auth
      const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/appinsurance/reset-password/confirm`,
      });

      if (error) throw error;

      alert(`Password reset link has been sent to ${email}. Please check your email.`);
      // Supabase sends email with link, so we can go back to login
      navigate("/");
    } catch (error) {
      console.error("Password reset request error:", error);
      alert("Failed to send reset email: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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

      alert("Password reset successful! You can now log in with your new password.");
      navigate("/");
    } catch (error) {
      console.error("Password update error:", error);
      alert("Failed to reset password: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleNewPassword = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPassword = () => setConfirmVisible(!confirmVisible);

  return (
    <div className="reset-page">
      <div className="reset-box">
        {/* Step 1: Request Reset */}
        {step === 1 && (
          <>
            <div className="reset-header">
              <div className="header-left">
                <h2>RESET PASSWORD</h2>
                <p>Enter your email to receive a password reset link</p>
              </div>
              <img 
                className="header-logo" 
                src={require("./images/logo_.png")} 
                alt="silverstar_insurance_inc_Logo" 
              />
            </div>
            
            <form className="reset-form" onSubmit={handleRequestReset}>
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              
              <button 
                type="submit"
                className="reset-button"
                disabled={!email || loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              
              <a 
                href="#" 
                className="back-link"
                onClick={(e) => { 
                  e.preventDefault(); 
                  navigate("/");
                }}
              >
                Back to Login
              </a>
            </form>
          </>
        )}

        {/* Step 2: New Password (shown after clicking email link) */}
        {step === 3 && (
          <>
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
            </form>
          </>
        )}
      </div>
    </div>
  );
}