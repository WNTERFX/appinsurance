import "./styles/Profile-styles.css"
import "./images/user-icon.png"
import { useNavigate } from "react-router-dom";

export default function Profile() {
     const navigate = useNavigate();
  return (
     
    <p>Manage Account</p>
   
   
    /*<div className="profile-page">
      <p>Profile</p>
      <div className="profile-header">
        <div className="header-left">
         <img src={require('./images/user-icon.png')} className="avatar" alt = "user-icon"/>
          <div>
            <h2>ADMINISTRATOR</h2>
            <p>Silverstar Insurance Agency Inc.</p>
          </div>
        </div>
        <button className="edit-btn">Edit</button>
      </div>

      <div className="info-display">
        <div className="account-info">
          <h3>Account Information</h3>
        </div>

        <div className="settings">
          <div className="display-mode">
            <h3>Display</h3>
            <p className="mode-label">
              <span className="moon">🌙</span>
              <strong>Dark mode</strong><br />
              <span className="subtext">
                Adjust the appearance of the application to reduce glare and give your eyes a break
              </span>
            </p>
            <div className="toggle-options">
              <label><input type="radio" name="mode" defaultChecked /> Off</label>
              <label><input type="radio" name="mode" /> On</label>
            </div>
          </div>

          <div className="accounts">
            <h3>Accounts</h3>
            {[1, 2, 3].map((id) => (
              <div className="account-entry" key={id}>
                <div className="account-left">
                   <img src={require('./images/user-icon.png')} className="small-avatar" alt="user-icon" />
                  <span>Lily Bon (Sales Agent)</span>
                </div>
                <button className="edit-btn small">Edit</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="logout-btn" onClick={() => navigate("/appinsurance")}>Log out</button>
    </div>
   */
  );
}
