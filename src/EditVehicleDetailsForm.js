import './styles/EditVehicleDetailsForm.css';
import { useNavigate } from "react-router-dom";

export default function EditVehicleDetailsForm() {

  const navigate = useNavigate();
 
    return (
      <div className="EditVehicleDetailsForm-container">
        <h2>Edit Client Form</h2>
  
        <div className="form-card">
          <form className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" />
            </div>
  
            <div className="form-group">
              <label>Vehicle Model</label>
              <input type="text" />
            </div>
  
            <div className="form-group">
              <label>Orig. Vehicle Value</label>
              <input type="text" />
            </div>
  
            <div className="form-group">
              <label>Tax</label>
              <input type="email" />
            </div>
  
            <div className="form-group">
              <label>VAT</label>
              <input type="text" />
            </div>
  
            <div className="form-group">
              <label>Documentary Stamp</label>
              <input type="text" />
            </div>
  
            <div className="form-group">
              <label>AoN (Act of Nature) Checkbox</label>
              <input type="text" />
            </div>
  
            <div className="form-group">
              <label>Premium </label>
              <input type="text" />
            </div>

            <div className="form-group">
              <label>Vehicle Type </label>
              <input type="text" />
            </div>

            <div className="form-group">
              <label>Current Vehicle Value </label>
              <input type="text" />
            </div>

          </form>
        </div>
  
        <div className="button-containers">
        <button className="Submit-btn" onClick={() => navigate("/appinsurance/MainArea/Policy")} >Submit </button>
        </div>
      </div>
    );
  }