import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getComputationValue, fetchVehicleDetails } from "./AdminActions/VehicleTypeActions";
import './styles/Policy-new-client.css';

export default function NewClient() {
  const navigate = useNavigate();

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [selected, setSelected] = useState(""); 
  const [vehicleDetails, setVehicleDetails] = useState(null);

  useEffect(() => {
    async function loadVehicleTypes() {
      const types = await getComputationValue();
      setVehicleTypes(types);
    }
    loadVehicleTypes();
  }, []);

  useEffect(() => {
    if (!selected) return;
    async function loadDetails() {
      const details = await fetchVehicleDetails(selected);
      setVehicleDetails(details);
    }
    loadDetails();
  }, [selected]);

  return (
    <div className="new-client-container">
      <h2>New Client Form</h2>

      <div className="form-card">
        <form className="form-grid">
          {/* LEFT SIDE */}
          <div className="form-left-column">
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
              <label>Vehicle Name</label>
              <input type="text" value={vehicleDetails?.vehicle_Model || ""} readOnly />
              
            </div>

              <div className="form-group">
              <label>Vehicle Year</label>
              <input type="text" value={vehicleDetails?.vehicle_Model || ""} readOnly />
              
            </div>

            <div className="form-group">
              <label>Vehicle Type</label>
              <select
                id="vehicle-type-select"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">-- Select Vehicle Type --</option>
                {vehicleTypes.map((v) => (
                  <option key={v.id} value={v.vehicle_Type}>
                    {v.vehicle_Type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Original Value of Vehicle</label>
              <input type="text" value={vehicleDetails?.original_Value || ""} readOnly />
            </div>

            <div className="form-group">
              <label>Insurance Partner</label>
              <input type="text" />
            </div>

            <div className="form-group">
                <label>VAT Tax</label>
                <input 
                  type="text" 
                  value={vehicleDetails?.vat_Tax ? `${vehicleDetails.vat_Tax}%` : "0%"} 
                  readOnly 
                />
            </div>

              <div className="form-group">
                <label>Documentary Stamp</label>
                <input 
                  type="text" 
                  value={vehicleDetails?.docu_Stamp ? `${vehicleDetails.docu_Stamp}%` : "0%"} 
                  readOnly 
                />
              </div>

              <div className="form-group">
                <label>Local Gov Tax</label>
                <input 
                  type="text" 
                  value={vehicleDetails?.local_Gov_Tax ? `${vehicleDetails.local_Gov_Tax}%` : "0%"} 
                  readOnly 
                />
              </div>


            <div className="form-group">
              <label>AoN (Act of Nature)</label>
              <input type="checkbox"></input>
            </div>

            <div className="form-group">
              <label>Premium</label>
              <input type="text" value={vehicleDetails?.vehicle_Rate || ""} readOnly />
            </div>

            <div className="form-group">
              <label>Current Vehicle Value</label>
              <input type="text" value={vehicleDetails?.current_Value || ""} readOnly />
            </div>
          </div>

         
          <div className="form-right-column">
            <div className="calculation-card">
              <h3>Calculation Summary</h3>
              <p>Vehicle Value: <span>{vehicleDetails?.original_Value || "—"}</span></p>
              <p>Vehicle Depreciation: <span>{vehicleDetails?.depreciation || "—"}</span></p>
              <p>Tax: <span>{vehicleDetails?.tax || "—"}</span></p>
              <p>VAT: <span>{vehicleDetails?.vat || "—"}</span></p>
              <p>Documentary Stamp: <span>{vehicleDetails?.doc_Stamp || "—"}</span></p>
              <p>Premium: <span>{vehicleDetails?.premium || "—"}</span></p>
              <hr />
              <p><strong>Total: <span>{vehicleDetails?.total || "—"}</span></strong></p>
            </div>
          </div>
        </form>
      </div>

      <div className="button-container">
        <button
          className="cancel-btn"
          onClick={() => navigate("/appinsurance/MainArea/Policy")}
        >
          Cancel
        </button>
        <button
          className="confirm-btn"
          onClick={() => navigate("/appinsurance/MainArea/Policy/NewClient/VehicleDetails")}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
