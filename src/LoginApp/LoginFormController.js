import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginFunction } from "./LoginFormActions";
import { CustomAlert } from "../ReusableComponents/CustomAlert";

export default function useLoginFormController(setSession) {
  const navigate = useNavigate();

  // 1. State to control your CustomAlert
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: "",
    type: "success", // can be 'success' or 'error'
  });

  // Helper to close the alert
  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleLogin = async (email, password, rememberMe = false) => {
    // Reset alert state before trying
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));

    const result = await loginFunction(email, password);

    // --- SCENARIO A: ILLEGAL LOGIN (ERROR) ---
    if (!result.success) {
      setAlertConfig({
        isOpen: true,
        message: "Login failed: " + result.error, // e.g. "Invalid password"
        type: "error",
      });
      return;
    }

    // --- SCENARIO B: LOGIN SUCCESS ---
    
    // 1. Save Session
    const sessionData = {
      userId: result.userId,
      accessToken: result.accessToken,
      isAdmin: result.isAdmin,
    };
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("user_session", JSON.stringify(sessionData));
    setSession(sessionData);

    // 2. Trigger Success Alert
    setAlertConfig({
      isOpen: true,
      message: "Login Successful!\nRedirecting to dashboard...",
      type: "success",
    });

    // 3. Delay navigation so user sees the alert (1.5 seconds)
    setTimeout(() => {
      navigate("/appinsurance/main-app/dashboard");
    }, 1500);
  };

  // --- THE COMPONENT TO RETURN ---
  // This wrapper automatically passes the props (message, type, onClose)
  // to your CustomAlert based on the state above.
  const LoginAlert = () => (
    alertConfig.isOpen ? (
      <CustomAlert 
        message={alertConfig.message} 
        type={alertConfig.type} 
        onClose={closeAlert} 
      />
    ) : null
  );

  return { handleLogin, LoginAlert };
}