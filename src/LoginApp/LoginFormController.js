import { loginFunction } from "./LoginFormActions";
import { useNavigate } from "react-router-dom";

export default function useLoginFormController(setSession) {
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
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
    localStorage.setItem("user_session", JSON.stringify(sessionData));
    setSession(sessionData); // update App state

    // Redirect based on role
    if (result.isAdmin) {
      navigate("/appinsurance/main-app/dashboard");
    } else {
      navigate("/appinsurance/main-app/dashboard");
    }
  };

  return { handleLogin };
}
