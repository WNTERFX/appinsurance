import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchPolicies,
  fetchDelivery,
  fetchPolicyById,
  fetchClientByUid,
  updateDelivery,
} from "../AdminActions/EditDeliveryActions";
import {
  fetchClientDefaultFromClientsTable,
  fetchClientAddresses,
  formatAddressString,
} from "../AdminActions/ClientAddressActions";
import { markAsScheduled } from "../AdminActions/DeliveryActions";
import DeliveryEditForm from "../AdminForms/DeliveryEditForm";
import AddressPickerModal from "../AdminForms/AddressPickerModal";
import CustomAlertModal from "../AdminForms/CustomAlertModal";
import CustomConfirmModal from "../AdminForms/CustomConfirmModal";

const toYMD = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

export default function EditDeliveryController({
  delivery,
  deliveryId,
  onClose,
  onUpdateSuccess,
  isRescheduledTab = false, // ✅ NEW: Flag to indicate if editing from Rescheduled tab
}) {
  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

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

  // Address state management
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [customAddresses, setCustomAddresses] = useState([]);

  // ✅ CustomAlertModal state
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", title: "Alert" });
  
  // ✅ CustomConfirmModal state
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    message: "", 
    title: "Confirm", 
    onConfirm: null 
  });

  const showAlert = (message, title = "Alert") => {
    setAlertModal({ isOpen: true, message, title });
  };

  const showConfirm = (message, onConfirm, title = "Confirm") => {
    setConfirmModal({ isOpen: true, message, title, onConfirm });
  };

  // Load addresses when client is selected
  useEffect(() => {
    if (!selectedClient?.uid) {
      setSelectedAddress(null);
      setDefaultAddress(null);
      setCustomAddresses([]);
      return;
    }

    (async () => {
      try {
        const [defAddr, customAddrs] = await Promise.all([
          fetchClientDefaultFromClientsTable(selectedClient.uid),
          fetchClientAddresses(selectedClient.uid),
        ]);
        setDefaultAddress(defAddr);
        setCustomAddresses(customAddrs);

        // Check if there's a delivered address
        const deliveredAddr = customAddrs.find((a) => a.is_delivered_address);
        if (deliveredAddr) {
          setSelectedAddress(deliveredAddr);
        } else if (defAddr) {
          setSelectedAddress(defAddr);
        }
      } catch (err) {
        console.error("Failed to load addresses:", err);
        showAlert(`Failed to load addresses: ${err.message}`, "Error");
      }
    })();
  }, [selectedClient]);

  // Display address text
  const displayAddressText = useMemo(() => {
    if (!selectedAddress) return "No address on file";
    return formatAddressString(selectedAddress);
  }, [selectedAddress]);

  // Address metadata (badges)
  const addressMeta = useMemo(() => {
    if (!selectedAddress) return { isDefault: false, isDelivered: false };
    const isDefault = !selectedAddress.id || selectedAddress.is_default;
    const isDelivered = selectedAddress.is_delivered_address || false;
    return { isDefault, isDelivered };
  }, [selectedAddress]);

  useEffect(() => {
    (async () => {
      try {
        const activePolicies = await fetchPolicies();

        // 1) Load delivery
        let d = delivery;
        const dId = delivery?.id || delivery?.uid || deliveryId;
        if (!d && dId) d = await fetchDelivery(dId);
        if (!d) throw new Error("No delivery to edit.");

        console.log("📦 Loaded delivery:", d);

        // 2) Load policy
        const currentPolicyId = d.policy_id || d.policy_Id;
        console.log("🔍 Looking for policy ID:", currentPolicyId);

        let combined = activePolicies || [];
        let policy = combined.find((p) => String(p.id) === String(currentPolicyId));
        
        if (!policy) {
          console.log("Policy not in active list, fetching individually...");
          policy = await fetchPolicyById(currentPolicyId);
          if (policy) combined = [policy, ...combined];
        }

        console.log("📋 Loaded policy:", policy);
        setPolicies(combined);

        // 3) Load client
        if (policy) {
          const clientUid = policy.client_id || policy.client_Id || policy.clientId || policy.Client_Id;
          console.log("👤 Attempting to load client with UID:", clientUid);

          if (clientUid) {
            try {
              const client = await fetchClientByUid(clientUid);
              console.log("✅ Client loaded successfully:", client);
              setSelectedClient(client);
            } catch (err) {
              console.error("❌ Failed to load client:", err);
              showAlert(`Failed to load client: ${err.message}`, "Error");
              setSelectedClient(null);
            }
          } else {
            console.warn("⚠️ No client_id found in policy");
            setSelectedClient(null);
          }
        } else {
          console.error("❌ No policy found");
          setSelectedClient(null);
        }

        // 4) Seed form/originals
        const init = {
          policyId: String(currentPolicyId || ""),
          deliveryDate: toYMD(d.delivery_date || d.delivery_Date) || toYMD(new Date()),
          estDeliveryDate: toYMD(d.estimated_delivery_date || d.estimated_Delivery_Date) || "",
          remarks: d.remarks || "",
        };
        setFormData(init);
        setOriginalData(init);
      } catch (e) {
        console.error("❌ Critical error loading delivery:", e);
        showAlert(`Failed to load delivery for editing: ${e.message}`, "Error");
        (onClose || (() => navigate("/appinsurance/MainArea/Delivery")))();
      }
    })();
  }, [delivery, deliveryId, navigate, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle address picker open
  const handleOpenAddressPicker = () => {
    if (!selectedClient?.uid) {
      showAlert("Please select a client first", "Warning");
      return;
    }
    setAddressPickerOpen(true);
  };

  // Handle address selection from picker
  const handleAddressChanged = (addr) => {
    setSelectedAddress(addr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Special handling for Rescheduled tab
    if (isRescheduledTab) {
      showConfirm(
        "Are you sure you want to submit? This will move the delivery to Scheduled status.",
        async () => {
          await performUpdate(true); // Pass true to indicate move to Scheduled
        },
        "Submit and Schedule"
      );
    } else {
      await performUpdate(false);
    }
  };

  const performUpdate = async (moveToScheduled) => {
    setLoading(true);
    try {
      const id = delivery?.id || delivery?.uid || deliveryId;
      if (!id) throw new Error("Missing delivery id.");

      // Include address snapshot in update
      const updatePayload = {
        ...formData,
        delivery_street_address: selectedAddress?.street_address || "",
        delivery_region: selectedAddress?.region || "",
        delivery_province: selectedAddress?.province || "",
        delivery_city: selectedAddress?.city || "",
        delivery_barangay: selectedAddress?.barangay || "",
        delivery_zip_code: selectedAddress?.zip_code || null,
      };

      await updateDelivery(id, updatePayload);

      // ✅ If from Rescheduled tab, also mark as Scheduled
      if (moveToScheduled) {
        await markAsScheduled(id);
        showAlert("✅ Delivery updated and moved to Scheduled!", "Success");
      } else {
        showAlert("✅ Delivery updated successfully!", "Success");
      }

      if (onUpdateSuccess) await onUpdateSuccess();
      else navigate("/appinsurance/MainArea/Delivery");
    } catch (err) {
      console.error(err);
      showAlert(`❌ Failed to update delivery: ${err.message}`, "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Alert Modal */}
      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        message={alertModal.message}
        title={alertModal.title}
      />

      {/* Confirm Modal */}
      <CustomConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => {
          confirmModal.onConfirm?.();
          setConfirmModal({ ...confirmModal, isOpen: false });
        }}
        message={confirmModal.message}
        title={confirmModal.title}
      />

      <DeliveryEditForm
        formData={formData}
        originalData={originalData}
        policies={policies}
        selectedClient={selectedClient}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={onClose || (() => navigate("/appinsurance/MainArea/Delivery"))}
        displayAddressText={displayAddressText}
        addressMeta={addressMeta}
        onOpenAddressPicker={handleOpenAddressPicker}
      />

      {/* Address Picker Modal */}
      {addressPickerOpen && (
        <AddressPickerModal
          isOpen={addressPickerOpen}
          clientUid={selectedClient?.uid}
          onClose={() => setAddressPickerOpen(false)}
          onChanged={handleAddressChanged}
        />
      )}
    </>
  );
}