import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateDelivery, fetchPolicies } from "../AdminActions/EditDeliveryActions";
import DeliveryEditForm from "../AdminForms/DeliveryEditForm";

export default function EditDeliveryController({ delivery, onClose, onUpdateSuccess }) {
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
      const policyData = await fetchPolicies();
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
      await updateDelivery(delivery.uid || delivery.id, formData);
      alert("✅ Delivery updated successfully!");
      if (onUpdateSuccess) await onUpdateSuccess();
      else navigate("/appinsurance/MainArea/Delivery");
    } catch (err) {
      alert("❌ Failed to update delivery: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeliveryEditForm
      formData={formData}
      originalData={originalData}
      policies={policies}
      loading={loading}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={onClose || (() => navigate("/appinsurance/MainArea/Delivery"))}
    />
  );
}
