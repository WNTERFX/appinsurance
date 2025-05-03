import { useNavigate } from "react-router-dom";
import './styles/EditClientForm.css';

export default function EditClientForm() {
    const navigate = useNavigate();
    
    return (
      <div className="EditClientForm-container">
        <h2>Edit Client Form</h2>
  
        <div className="form-card">
          <form className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" />
            </div>
  
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" />
            </div>
  
            <div className="form-group">
              <label>Home Address</label>
              <input type="text" />
            </div>
  
            <div className="form-group">
              <label>Email</label>
              <input type="email" />
            </div>
  
            <div className="form-group">
              <label>Vehicle Model</label>
              <input type="text" />
            </div>
  
            <div className="form-group">
              <label>Vehicle Type</label>
              <input type="text" />
            </div>
  
            <div className="form-group">
              <label>Original Value of Vehicle</label>
              <input type="text" />
            </div>
  
            <div className="form-group">
              <label>Insurance Partner</label>
              <input type="text" />
            </div>
          </form>
        </div>
  
        <div className="button-container">
          <button className="confirm-btn" onClick={() => navigate("/appinsurance/MainArea/Policy/ListClient/EditClientForm/EditVehicleDetailsForm")}>Confirm</button>
        </div>
      </div>
    );
  }