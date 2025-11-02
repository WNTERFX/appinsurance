import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  updateModeratorDelivery,
  fetchModeratorPolicies,
} from "../ModeratorActions/ModeratorEditDeliveryActions";
import ModeratorDeliveryEditForm from "../ModeratorForms/ModeratorDeliveryEditForm";

export default function ModeratorEditDeliveryController({ delivery, onClose, onUpdateSuccess }) {
  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [formData, setFormData] = useState({
    policyId: "",
    deliveryDate: "",
    estDeliveryDate: "",
    remarks: "",
  });
  const [originalData, setOriginalData] = useState({
    deliveryDate: "",
    estDeliveryDate: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);

  // Load policies + initial delivery data
  useEffect(() => {
    async function load() {
      const policyData = await fetchModeratorPolicies();
      setPolicies(policyData || []);

      if (delivery) {
        const initData = {
          policyId: delivery.policy_Id || delivery.policy_id || "",
          deliveryDate: delivery.delivery_date || new Date().toISOString().split("T")[0],
          estDeliveryDate: delivery.estimated_delivery_date || "",
          remarks: delivery.remarks || "",
        };
        setFormData(initData);
        setOriginalData(initData); // ✅ keep snapshot of originals
      }
    }
    load();
  }, [delivery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateModeratorDelivery(delivery.uid || delivery.id, formData);
      alert("✅ Delivery updated successfully!");
      if (onUpdateSuccess) await onUpdateSuccess();
      else navigate("/appinsurance/MainAreaModerator/DeliveryModerator");
    } catch (err) {
      alert("❌ Failed to update delivery: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModeratorDeliveryEditForm
      formData={formData}
      originalData={originalData}
      policies={policies}
      loading={loading}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={onClose || (() => navigate("/appinsurance/MainAreaModerator/DeliveryModerator"))}
    />
  );
}
