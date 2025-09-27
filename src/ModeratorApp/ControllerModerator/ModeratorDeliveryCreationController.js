import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createModeratorDelivery,
  fetchModeratorPolicies,
  getCurrentModerator,
} from "../ModeratorActions/ModeratorNewDeliveryActions";
import ModeratorDeliveryCreationForm from "../ModeratorForms/ModeratorDeliveryCreationForm";

export default function ModeratorDeliveryCreationController({ onCancel }) {
  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [formData, setFormData] = useState({
    policyId: "",
    deliveryDate: new Date().toISOString().split("T")[0],
    estDeliveryDate: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Fetch moderator’s policies
  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentModerator();
        if (!currentUser) {
          console.error("No moderator logged in");
          return;
        }
        const policyData = await fetchModeratorPolicies(currentUser.id);
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
      const currentUser = await getCurrentModerator();
      if (!currentUser) {
        alert("❌ Please log in to create a delivery");
        return;
      }

      await createModeratorDelivery({
        agentId: currentUser.id,
        policyId: formData.policyId,
        deliveryDate: formData.deliveryDate,
        estDeliveryDate: formData.estDeliveryDate,
        remarks: formData.remarks,
      });

      alert("✅ Delivery created successfully!");
      if (onCancel) {
        onCancel();
      } else {
        navigate("/appinsurance/ModeratorArea/Delivery");
      }
    } catch (err) {
      alert("❌ Failed to create delivery: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModeratorDeliveryCreationForm
      formData={formData}
      policies={policies}
      loading={loading}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={onCancel || (() => navigate("/appinsurance/ModeratorArea/Delivery"))}
    />
  );
}
