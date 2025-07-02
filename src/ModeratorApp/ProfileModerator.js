import './moderator-styles/profile-styles-moderator.css';
import "./images/user-icon.png"
import { useNavigate } from "react-router-dom";

export default function ProfileModerator() {
     const navigate = useNavigate();
  return (
    <div className="profile-page-moderator">
      <p>Profile</p>
      <div className="profile-header-moderator">
        <div className="header-left-moderator">
         <img src={require('./images/user-icon.png')} className="avatar-moderator" alt = "user-icon-moderator"/>
          <div>
            <h2>MODERATOR</h2>
            <p>Silverstar Insurance Agency Inc.</p>
          </div>
        </div>
        <button className="edit-btn-moderator">Edit</button>
      </div>

      <div className="info-display-moderator">
        <div className="account-info-moderator">
          <h3>Account Information</h3>
        </div>

        <div className="settings-moderator">
          <div className="display-mode-moderator">
            <h3>Display</h3>
            <p className="mode-label-moderator">
              <span className="moon-moderator">🌙</span>
              <strong>Dark mode</strong><br />
              <span className="subtext">
                Adjust the appearance of the application to reduce glare and give your eyes a break
              </span>
            </p>
            <div className="toggle-options-moderator">
              <label><input type="radio" name="mode" defaultChecked /> Off</label>
              <label><input type="radio" name="mode" /> On</label>
            </div>
          </div>

          <div className="accounts-moderator">
            <h3>Accounts</h3>
            {[1, 2, 3].map((id) => (
              <div className="account-entry-moderator" key={id}>
                <div className="account-left-moderator">
                   <img src={require('./images/user-icon.png')} className="small-avatar-moderator" alt="user-icon-moderator" />
                  <span>Lily Bon (Sales Agent)</span>
                </div>
                <button className="edit-btn smal-moderator">Edit</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="logout-btn-moderator" onClick={() => navigate("/appinsurance")}>Log out</button>
    </div>
  );
}
