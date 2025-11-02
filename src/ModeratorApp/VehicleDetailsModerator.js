import { Navigate, useNavigate } from "react-router-dom";
import './moderator-styles/policy-vehicle-details-moderator.css';

export default function VehicleDetailsModerator() {
    const navigate = useNavigate();
 
    return (
      <div className="VehicleDetails-container-moderator ">
        <h2>New Client Form</h2>
  
        <div className="form-card-moderator ">
          <form className="form-grid-moderator ">
            <div className="form-group-moderator ">
              <label>Full Name</label>
              <input type="text" />
            </div>
  
            <div className="form-group-moderator ">
              <label>Vehicle Model</label>
              <input type="text" />
            </div>
  
            <div className="form-group-moderator ">
              <label>Orig. Vehicle Value</label>
              <input type="text" />
            </div>
  
            <div className="form-group-moderator">
              <label>Tax</label>
              <input type="email" />
            </div>
  
            <div className="form-group-moderator ">
              <label>VAT</label>
              <input type="text" />
            </div>
  
            <div className="form-group-moderator ">
              <label>Documentary Stamp</label>
              <input type="text" />
            </div>
  
            <div className="form-group-moderator ">
              <label>AoN (Act of Nature) Checkbox</label>
              <input type="text" />
            </div>
  
            <div className="form-group-moderator ">
              <label>Premium </label>
              <input type="text" />
            </div>

            <div className="form-group-moderator ">
              <label>Vehicle Type </label>
              <input type="text" />
            </div>

            <div className="form-group-moderator ">
              <label>Current Vehicle Value </label>
              <input type="text" />
            </div>

          </form>
        </div>
  
        <div className="button-containers-moderator ">
        <button className="Submit-btn"  onClick={() => navigate("/appinsurance/MainAreaModerator/PolicyModerator")}>Submit </button>
        </div>
      </div>
    );
  }




