import "../styles/delivery-creation-styles.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  createDelivery,
  fetchPolicies,
  getCurrentUser,
} from "../AdminActions/NewDeliveryActions";

export default function DeliveryCreationForm() {
  const navigate = useNavigate();

  // State
  const [policies, setPolicies] = useState([]);
  const [formData, setFormData] = useState({
    policyId: "",
    deliveryDate: new Date().toISOString().split("T")[0],
    estDeliveryDate: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Fetch dropdown data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const policyData = await fetchPolicies();
        setPolicies(policyData);
      } catch (err) {
        console.error("Error loading data:", err.message);
      }
    }
    loadData();
  }, []);

  // ✅ Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user ID
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        alert("❌ Please log in to create a delivery");
        return;
      }
      
      await createDelivery({
        agentId: currentUser.id,
        policyId: formData.policyId,
        deliveryDate: formData.deliveryDate,
        estDeliveryDate: formData.estDeliveryDate,
        remarks: formData.remarks,
      });

      alert("✅ Delivery created successfully!");
      navigate("/appinsurance/MainArea/Delivery");
    } catch (err) {
      alert("❌ Failed to create delivery: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-creation-container">
      <h2>Delivery Creation Form</h2>
      <form className="form-card-client-creation" onSubmit={handleSubmit}>
        <div className="form-grid-client-creation">
          {/* Policy ID Dropdown */}
          <div className="form-group-client-creation">
            <label>Policy *</label>
            <select
              name="policyId"
              value={formData.policyId}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Policy --</option>
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  Policy #{p.id} - {p.policy_type} ({p.policy_inception} to {p.policy_expiry})
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Date (today, readonly) */}
          <div className="form-group-client-creation">
            <label>Delivery Date</label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              readOnly
            />
          </div>

          {/* Estimated Delivery Date */}
          <div className="form-group-client-creation">
            <label>Est. Delivery Date</label>
            <input
              type="date"
              name="estDeliveryDate"
              value={formData.estDeliveryDate}
              onChange={handleChange}
            />
          </div>

          {/* Remarks */}
          <div className="form-group-client-creation">
            <label>Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Optional notes..."
            />
          </div>
        </div>

        <div className="client-creation-controls">
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Submit"}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/appinsurance/MainArea/Delivery")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}