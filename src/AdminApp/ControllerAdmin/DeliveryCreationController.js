// src/AdminControllers/DeliveryCreationController.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createDelivery,
  fetchPolicies,
  fetchClients,
  getCurrentUser,
} from "../AdminActions/NewDeliveryActions";
import DeliveryCreationForm from "../AdminForms/DeliveryCreationForm";
import AddressPickerModal from "../AdminForms/AddressPickerModal";
import CustomAlertModal from "../AdminForms/CustomAlertModal";
import {
  fetchClientDefaultFromClientsTable,
  fetchClientAddresses,
  pickDeliveredAddress,
  formatAddressString,
} from "../AdminActions/ClientAddressActions";

function toYYYYMMDD(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function DeliveryCreationController({ onCancel }) {
  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const [defaultAddr, setDefaultAddr] = useState(null);
  const [clientAddrs, setClientAddrs] = useState([]);
  const [deliveredAddr, setDeliveredAddr] = useState(null);
  const [addrModalOpen, setAddrModalOpen] = useState(false);

  // Custom alert modal state
  const [alertModal, setAlertModal] = useState({ 
    isOpen: false, 
    message: "", 
    title: "Alert" 
  });

  const [formData, setFormData] = useState({
    policyId: "",
    deliveryDate: toYYYYMMDD(new Date()),
    estDeliveryDate: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [cl, pl] = await Promise.all([fetchClients(), fetchPolicies()]);
        setClients(Array.isArray(cl) ? cl : []);
        setPolicies(Array.isArray(pl) ? pl : []);
      } catch (err) {
        console.error("Error loading data:", err.message);
      }
    })();
  }, []);

  // ✅ Load addresses when client changes
  useEffect(() => {
    (async () => {
      if (!selectedClient?.uid) {
        setDefaultAddr(null);
        setClientAddrs([]);
        setDeliveredAddr(null);
        return;
      }
      const [def, list] = await Promise.all([
        fetchClientDefaultFromClientsTable(selectedClient.uid),
        fetchClientAddresses(selectedClient.uid),
      ]);
      setDefaultAddr(def);
      setClientAddrs(list);
      
      // ✅ Check if any custom address is delivered, else use default
      const customDelivered = pickDeliveredAddress(list);
      setDeliveredAddr(customDelivered || null);
    })();
  }, [selectedClient]);

  // ✅ Display address: prioritize custom delivered, else default
  const displayAddress = useMemo(() => {
    const chosen = deliveredAddr || defaultAddr || null;
    if (!chosen) return "";
    return formatAddressString(chosen);
  }, [deliveredAddr, defaultAddr]);

  const addressMeta = useMemo(() => {
    // If there's a custom delivered address, it's not default
    // If no custom delivered but we have default, it's default + delivered
    return {
      isDefault: !deliveredAddr && !!defaultAddr,
      isDelivered: !!deliveredAddr || !!defaultAddr, // Always has delivered if default exists
    };
  }, [deliveredAddr, defaultAddr]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showAlert = (message, title = "Alert") => {
    setAlertModal({ isOpen: true, message, title });
  };

  const closeAlert = () => {
    setAlertModal({ isOpen: false, message: "", title: "Alert" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClient?.uid) {
      showAlert("Please select a client", " Validation Error");
      return;
    }
    
    if (!formData.policyId) {
      showAlert("Please select a policy", " Validation Error");
      return;
    }

    // ✅ Always use delivered or default address
    const snap = deliveredAddr || defaultAddr || {};
    
    if (!snap.street_address && !snap.address) {
      showAlert("No address available for this client. Please add an address first.", "⚠ Address Required");
      return;
    }

    const addressPayload = {
      delivery_address_type: deliveredAddr ? "custom" : "client_default",
      custom_address_id: deliveredAddr ? deliveredAddr.id : null,
      delivery_street_address: snap.street_address || snap.address || "",
      delivery_region: snap.region || "",
      delivery_province: snap.province || "",
      delivery_city: snap.city || "",
      delivery_barangay: snap.barangay || "",
      delivery_zip_code: typeof snap.zip_code !== "undefined" ? snap.zip_code : null,
    };

    setLoading(true);
    try {
      // ✅ No need to get currentUser - createDelivery handles it
      await createDelivery({
        policyId: formData.policyId,
        deliveryDate: formData.deliveryDate,
        estDeliveryDate: formData.estDeliveryDate || null,
        remarks: formData.remarks || null,
        ...addressPayload,
      });

      showAlert("Delivery created successfully!", "✅ Success");
      
      // Close form after a short delay to let user see the success message
      setTimeout(() => {
        if (onCancel) onCancel();
        else navigate("/appinsurance/MainArea/Delivery");
      }, 1500);
      
    } catch (err) {
      showAlert("Failed to create delivery: " + err.message, "⚠ Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DeliveryCreationForm
        formData={formData}
        policies={policies}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={onCancel || (() => navigate("/appinsurance/MainArea/Delivery"))}
        clients={clients}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        displayAddressText={displayAddress}
        addressMeta={addressMeta}
        onOpenAddressPicker={() => setAddrModalOpen(true)}
      />

      <AddressPickerModal
        isOpen={addrModalOpen}
        clientUid={selectedClient?.uid || null}
        onClose={() => setAddrModalOpen(false)}
        onChanged={(addr) => {
          // Reload addresses after changes
          if (selectedClient?.uid) {
            fetchClientAddresses(selectedClient.uid).then((list) => {
              setClientAddrs(list);
              const customDelivered = pickDeliveredAddress(list);
              setDeliveredAddr(customDelivered || null);
            });
          }
        }}
      />

      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        message={alertModal.message}
        title={alertModal.title}
      />
    </>
  );
}