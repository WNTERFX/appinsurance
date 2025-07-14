import { useNavigate } from "react-router-dom";
import './moderator-styles/policy-new-client-moderator.css';

export default function PolicyNewClientModerator() {
    const navigate = useNavigate();
    
    return (
      <div className="new-client-container-moderator">
        <h2>New Client Form</h2>
  
        <div className="form-card-moderator">
          <form className="form-grid-moderator">
            <div className="form-group-moderator">
              <label>Full Name</label>
              <input type="text" />
            </div>
  
            <div className="form-group-moderator">
              <label>Phone Number</label>
              <input type="text" />
            </div>
  
            <div className="form-group-moderator">
              <label>Home Address</label>
              <input type="text" />
            </div>
  
            <div className="form-group-moderator">
              <label>Email</label>
              <input type="email" />
            </div>
  
            <div className="form-group-moderator">
              <label>Vehicle Model</label>
              <input type="text" />
            </div>
  
            <div className="form-group-moderator">
              <label>Vehicle Type</label>
              <input type="text" />
            </div>
  
            <div className="form-group-moderator">
              <label>Original Value of Vehicle</label>
              <input type="text" />
            </div>
  
            <div className="form-group-moderator">
              <label>Insurance Partner</label>
              <input type="text" />
            </div>
          </form>
        </div>
  
        <div className="button-container-moderator">
          <button className="confirm-btn-moderator" onClick={() => navigate("/appinsurance/MainAreaModerator/PolicyModerator/NewClientModerator/VehicleDetailsModerator")}>Confirm</button>
        </div>
      </div>
    );
  }