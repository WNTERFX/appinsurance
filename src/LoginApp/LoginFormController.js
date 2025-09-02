

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

    if (result.isAdmin) {
      navigate("/appinsurance/MainArea/Dashboard");
    } else {
      navigate("/appinsurance/MainAreaModerator/DashboardModerator");
    }
  };