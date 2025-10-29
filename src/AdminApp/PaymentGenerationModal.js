import { useState, useEffect } from "react";
import { db } from "../dbServer";

function PaymentGenerationModal({ policy, onClose, onGenerate}) {
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState("");
  const [totalPremium, setTotalPremium] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [policy.id]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Fetch payment types
      const { data: paymentTypesData, error: ptError } = await db
        .from("payment_type")
        .select("id, payment_type_name, months_payment")
        .order("months_payment", { ascending: true });

      if (ptError) throw new Error("Failed to load payment types: " + ptError.message);
      
      setPaymentTypes(paymentTypesData || []);

      // Fetch total premium from policy computation
      const { data: computationData, error: compError } = await db
        .from("policy_Computation_Table")
        .select("total_Premium, payment_type_id")
        .eq("policy_id", policy.id)
        .single();

      if (compError) {
        throw new Error("No computation found for this policy");
      }

      if (!computationData?.total_Premium) {
        throw new Error("Total premium not found in policy computation");
      }

      setTotalPremium(computationData.total_Premium);

      // Set default payment type from computation or first available
      if (computationData.payment_type_id) {
        setSelectedPaymentTypeId(computationData.payment_type_id);
      } else if (paymentTypesData && paymentTypesData.length > 0) {
        setSelectedPaymentTypeId(paymentTypesData[0].id);
      }

      // Set default start date to today
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);

    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const getSelectedPaymentType = () => {
    return paymentTypes.find(pt => pt.id === parseInt(selectedPaymentTypeId));
  };

  const handleGenerate = async () => {
    if (!totalPremium || totalPremium <= 0) {
      alert("Invalid total premium amount");
      return;
    }

    if (!selectedPaymentTypeId) {
      alert("Please select a payment type");
      return;
    }

    if (!startDate) {
      alert("Please select a start date");
      return;
    }

    setLoading(true);
    try {
      const selectedType = getSelectedPaymentType();
      const monthsCount = selectedType.months_payment;
      const payments = [];

      if (monthsCount === 1) {
        // Single payment
        payments.push({
          payment_date: startDate,
          amount_to_be_paid: totalPremium,
          paid_amount: 0,
          is_paid: false,
          payment_type_id: selectedType.id,
          policy_id: policy.id
        });
      } else {
        // Multiple monthly payments
        const monthlyAmount = Math.round((totalPremium / monthsCount) * 100) / 100;
        const start = new Date(startDate);
        
        for (let i = 0; i < monthsCount; i++) {
          const paymentDate = new Date(start);
          paymentDate.setMonth(start.getMonth() + i);
          
          // Handle last payment to account for rounding
          const isLast = i === monthsCount - 1;
          const paymentAmount = isLast 
            ? parseFloat((totalPremium - (monthlyAmount * (monthsCount - 1))).toFixed(2))
            : monthlyAmount;
          
          payments.push({
            payment_date: paymentDate.toISOString().split('T')[0],
            amount_to_be_paid: paymentAmount,
            paid_amount: 0,
            is_paid: false,
            payment_type_id: selectedType.id,
            policy_id: policy.id
          });
        }
      }

      await onGenerate(policy.id, payments);
      onClose();
    } catch (error) {
      console.error("Error generating payments:", error);
      alert("Failed to generate payments: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          minWidth: "400px"
        }}>
          <p>Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          minWidth: "400px"
        }}>
          <h3 style={{ color: "#ef4444", marginTop: 0 }}>Error</h3>
          <p>{error}</p>
          <button
            onClick={onClose}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const selectedType = getSelectedPaymentType();
  const monthsCount = selectedType?.months_payment || 1;
  const monthlyAmount = totalPremium && selectedType 
    ? (totalPremium / monthsCount).toFixed(2)
    : "0.00";

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
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          minWidth: "500px",
          maxWidth: "90%",
          maxHeight: "90vh",
          overflow: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: "8px" }}>Generate Payment Schedule</h3>
        <p style={{ 
          backgroundColor: "#f3f4f6", 
          padding: "8px 12px", 
          borderRadius: "4px",
          fontSize: "14px",
          marginBottom: "20px"
        }}>
          <strong>Policy ID:</strong> {policy.internal_id}
        </p>

        {/* Total Premium Display (Read-only) */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px",
            fontWeight: "500",
            fontSize: "14px"
          }}>
            Total Premium (from Policy Computation)
          </label>
          <div style={{
            padding: "12px",
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: "6px",
            fontSize: "20px",
            fontWeight: "600",
            color: "#059669"
          }}>
            ₱{totalPremium?.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Payment Type Selection */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px",
            fontWeight: "500",
            fontSize: "14px"
          }}>
            Payment Type
          </label>
          <select
            value={selectedPaymentTypeId}
            onChange={(e) => setSelectedPaymentTypeId(e.target.value)}
            disabled={paymentTypes.length === 0}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
          >
            {paymentTypes.length === 0 && (
              <option value="">No payment types available</option>
            )}
            {paymentTypes.map(pt => (
              <option key={pt.id} value={pt.id}>
                {pt.payment_type_name} 
                {pt.months_payment > 1 && ` (${pt.months_payment} months)`}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px",
            fontWeight: "500",
            fontSize: "14px"
          }}>
            {monthsCount === 1 ? "Payment Date" : "Start Date (First Payment)"}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Payment Preview */}
        {startDate && selectedType && (
          <div style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "20px"
          }}>
            {monthsCount === 1 ? (
              <p style={{ margin: 0, fontSize: "14px" }}>
                <strong>Single payment:</strong> ₱{parseFloat(totalPremium).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
            ) : (
              <>
                <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
                  <strong>{monthsCount === 2 ? "Semi-annual" : "Monthly"} payment:</strong> ₱{parseFloat(monthlyAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
                <p style={{ margin: 0, fontSize: "14px", color: "#1e40af" }}>
                  {monthsCount} payments from {new Date(startDate).toLocaleDateString("en-PH")} 
                  {" to "}
                  {new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + monthsCount - 1)).toLocaleDateString("en-PH")}
                </p>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          justifyContent: "flex-end",
          marginTop: "24px"
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 20px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              backgroundColor: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500",
              opacity: loading ? 0.5 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedPaymentTypeId}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: loading || !selectedPaymentTypeId ? "#9ca3af" : "#2563eb",
              color: "white",
              cursor: loading || !selectedPaymentTypeId ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            {loading ? "Generating..." : "Generate Payments"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentGenerationModal;