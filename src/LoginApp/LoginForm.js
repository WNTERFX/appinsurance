import "./login-styles.css"
import "./images/logo-login.png"
import { useNavigate } from "react-router-dom";

export default function LoginForm(){

    let navigate = useNavigate();
    const routeAdmin = () =>
      {
        let path = "/appinsurance/MainArea/Dashboard";
        navigate(path);
      }

    const routeModerator = () => 
      {
        let path = "/appinsurance/MainAreaModerator/DashboardModerator";
        navigate(path);
      }

    return(
    <div class="login-container">
    <div class="container">
        <div class="login-card">
          <div class="logo-panel">
            <img src={require('./images/logo-login.png')} alt="silverstar_insurance_inc_Logo" />
          </div>
          <div class="right-panel">
            <h2>Log In to your account</h2>
            <form>
              <label>Email</label>
              <input type="email" placeholder="Enter your email" required />
              <label>Password</label>
              <input type="password" placeholder="Enter your password" required />
              <div class="password-button"></div>

              {/* The buttons for Admin and Moderator login, this should be replaced with actual authentication logic in deployment. */}
              
              <button type="submit" onClick={() => routeAdmin("/appinsurance/MainArea/Dashboard")}>Admin</button>
              <button type="submit" onClick={() => routeModerator("/appinsurance/MainAreaModerator/DashboardModerator")}>Moderator</button>
              
              <button type="submit" class="login-button">Login</button>
            
            </form>
            
          </div>
        </div>
    </div>
    </div>
    );
}