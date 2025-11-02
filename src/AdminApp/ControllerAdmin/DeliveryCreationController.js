import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createDelivery,
  fetchPolicies,
  getCurrentUser,
} from "../AdminActions/NewDeliveryActions";
import DeliveryCreationForm from "../AdminForms/DeliveryCreationForm"; 

export default function DeliveryCreationController({onCancel}){

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
      if (onCancel){
        onCancel();
      }else{
       navigate("/appinsurance/MainArea/Delivery");
      }
    } catch (err) {
      alert("❌ Failed to create delivery: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <DeliveryCreationForm
      formData={formData}
      policies={policies}
      loading={loading}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={onCancel || (() => navigate("/appinsurance/MainArea/Delivery"))}
    />
  );
}




