import { useState } from "react";

export default function InceptionDateModal({ isOpen, onClose, onSave, policyInfo }) {
  const [inceptionDate, setInceptionDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const calculateExpiryDate = (inception) => {
    if (!inception) return null;
    const expiry = new Date(inception);
    expiry.setFullYear(expiry.getFullYear() + 1);
    return expiry;
  };

  const expiryDate = inceptionDate ? calculateExpiryDate(inceptionDate) : null;

  const handleSubmit = async () => {
    if (!inceptionDate) {
      alert("Please select an inception date");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create inception timestamp at 12:00 noon
      const inception = new Date(inceptionDate);
      inception.setHours(12, 0, 0, 0);
      const inceptionTimestamp = inception.toISOString();

      // Create expiry timestamp at 12:00 noon (1 year later)
      const expiry = new Date(inception);
      expiry.setFullYear(expiry.getFullYear() + 1);
      expiry.setHours(12, 0, 0, 0);
      const expiryTimestamp = expiry.toISOString();

      await onSave(inceptionTimestamp, expiryTimestamp);
      handleClose();
    } catch (error) {
      console.error("Error setting inception date:", error);
      alert("Error setting inception date: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setInceptionDate("");
    onClose();
  };

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: "20px", fontSize: "20px", fontWeight: "600" }}>
          Set Policy Inception Date
        </h2>

        {policyInfo && (
          <div style={{ 
            backgroundColor: "#f3f4f6", 
            padding: "12px", 
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "14px"
          }}>
            <div><strong>Policy ID:</strong> {policyInfo.internal_id}</div>
            <div><strong>Policy Type:</strong> {policyInfo.policy_type}</div>
            <div><strong>Client:</strong> {policyInfo.clientName}</div>
          </div>
        )}

        <div>
          <div style={{ marginBottom: "20px" }}>
            <label 
              htmlFor="inceptionDate" 
              style={{ 
                display: "block", 
                marginBottom: "8px",
                fontWeight: "500",
                fontSize: "14px"
              }}
            >
              Inception Date
            </label>
            <input
              type="date"
              id="inceptionDate"
              value={inceptionDate}
              onChange={(e) => setInceptionDate(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
            <p style={{ 
              fontSize: "12px", 
              color: "#6b7280", 
              marginTop: "6px",
              marginBottom: 0
            }}>
              Time will be set to 12:00 noon automatically
            </p>
          </div>

          {expiryDate && (
            <div style={{ 
              backgroundColor: "#ecfdf5", 
              border: "1px solid #a7f3d0",
              padding: "12px", 
              borderRadius: "6px",
              marginBottom: "20px"
            }}>
              <div style={{ fontSize: "14px", marginBottom: "4px" }}>
                <strong>Calculated Expiry Date:</strong>
              </div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#059669" }}>
                {expiryDate.toLocaleString("en-PH", {
                  timeZone: "Asia/Manila",
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </div>
              <p style={{ 
                fontSize: "12px", 
                color: "#047857", 
                marginTop: "6px",
                marginBottom: 0
              }}>
                Policy will expire exactly 1 year from inception at 12:00 noon
              </p>
            </div>
          )}

          <div style={{ 
            display: "flex", 
            gap: "12px", 
            justifyContent: "flex-end",
            marginTop: "24px"
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              style={{
                padding: "10px 20px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                backgroundColor: "white",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                opacity: isSubmitting ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: isSubmitting ? "#9ca3af" : "#2563eb",
                color: "white",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              {isSubmitting ? "Saving..." : "Set Inception Date"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}