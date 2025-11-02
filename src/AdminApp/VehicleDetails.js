import { Navigate, useNavigate } from "react-router-dom";
import './styles/VehicleDetails.css';

export default function VehicleDetails() {
    const navigate = useNavigate();

    var tax, vat, docStamp, premiumTotal, totalPayment;
 
    return (
      <div className="VehicleDetails-container">
        <h2>New Client Form</h2>
  
        <div className="form-card">
          <div className="calculation-card">
                <h3>Calculation Summary</h3>
                <p>Tax: <span>—</span></p>
                <p>VAT: <span>—</span></p>
                <p>Documentary Stamp: <span>—</span></p>
                <p>Premium: <span>—</span></p>
                <hr />
                <p><strong>Total: <span>—</span></strong></p>
              </div>
        </div>
  
        <div className="button-containers">
        <button className="back-btn"  onClick={() => navigate("/appinsurance/MainArea/Policy/NewClient")}>Back </button>
        <button className="submit-btn"  onClick={() => navigate("/appinsurance/MainArea/Policy")}>Submit </button>
        </div>
      </div>
    );
  }




