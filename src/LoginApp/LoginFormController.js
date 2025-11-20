import { loginFunction } from "./LoginFormActions";
import { useNavigate } from "react-router-dom";

export default function useLoginFormController(setSession) {
  const navigate = useNavigate();
  
  const handleLogin = async (email, password, rememberMe = false) => {
    const result = await loginFunction(email, password);
    if (!result.success) {
      alert("Login failed: " + result.error);
      return;
    }
    
    // Save session locally
    const sessionData = {
      userId: result.userId,
      accessToken: result.accessToken,
      isAdmin: result.isAdmin,
    };
    
    // Use localStorage if "remember me" is checked, otherwise sessionStorage
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("user_session", JSON.stringify(sessionData));
    
    setSession(sessionData); // update App state

    navigate("/appinsurance/main-app/dashboard");
  };

  return { handleLogin };
}
