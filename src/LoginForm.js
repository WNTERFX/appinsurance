import "./styles/login-styles.css"
import "./images/logo.png"
import { useNavigate } from "react-router-dom";

export default function LoginForm(){

    let navigate = useNavigate();
    const route = () =>
      {
        let path = "/appinsurance/MainArea/Dashboard";
        navigate(path);
      }

    return(
    <div class="login-container">
    <div class="container">
        <div class="login-card">
          <div class="logo-panel">
            <img src={require('./images/logo.png')} alt="silverstar_insurance_inc_Logo" />
          </div>
          <div class="right-panel">
            <h2>Log In to your account</h2>
            <form>
              <label>Email</label>
              <input type="email" placeholder="Enter your email" required />
              <label>Password</label>
              <input type="password" placeholder="Enter your password" required />
              <div class="password-button"></div>
              <button type="submit" onClick={() => route("appinsurance/MainArea/Dashboard")}>Log In</button>
            </form>
          </div>
        </div>
    </div>
    </div>
    );
}