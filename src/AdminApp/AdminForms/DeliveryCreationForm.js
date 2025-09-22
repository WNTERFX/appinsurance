import "../styles/delivery-creation-styles.css";
import { useNavigate } from "react-router-dom";

export default function DeliveryCreationForm() {
  const navigate = useNavigate();

  return (
    <div className="client-creation-container">
      <h2>Delivery Creation Form</h2>
      <div className="form-card-client-creation">
        <div className="form-grid-client-creation">
          {/* Policy ID Dropdown */}
          <div className="form-group-client-creation">
            <label>Policy ID *</label>
            <select name="policyId">
              <option value="">-- Select Policy --</option>
              {/* Placeholder options */}
              <option value="1">Policy #1</option>
              <option value="2">Policy #2</option>
            </select>
          </div>

          {/* Policy Holder (Client) */}
          <div className="form-group-client-creation">
            <label>Policy Holder (Client)</label>
            <input
              type="text"
              name="policyHolder"
              placeholder="Client Name"
            />
          </div>

          {/* Delivery Date (today) */}
          <div className="form-group-client-creation">
            <label>Delivery Date</label>
            <input
              type="date"
              name="deliveryDate"
              value={new Date().toISOString().split("T")[0]} // default to today
              readOnly
            />
          </div>

          {/* Estimated Delivery Date */}
          <div className="form-group-client-creation">
            <label>Est. Delivery Date</label>
            <input type="date" name="estDeliveryDate" />
          </div>
        </div>
      </div>

      <div className="client-creation-controls">
        <button type="button">Submit</button>
        <button
          className="cancel-btn"
          onClick={() => navigate("/appinsurance/MainArea/Delivery")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
