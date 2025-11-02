import { useState, useEffect } from "react";
import { db } from "../dbServer";

function PaymentGenerationModal({ policy, onClose, onGenerate }) {
  // --- Existing State ---
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState("");
  const [totalPremium, setTotalPremium] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // --- ✅ NEW STATE for Manual Mode ---
  const [mode, setMode] = useState("schedule"); // 'schedule' or 'manual'
  const [manualPayments, setManualPayments] = useState([]);
  const [manualDate, setManualDate] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualPaymentTypeId, setManualPaymentTypeId] = useState("");

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

      if (ptError)
        throw new Error("Failed to load payment types: " + ptError.message);

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
      const today = new Date().toISOString().split("T")[0];
      setStartDate(today);

      // ✅ --- Set defaults for new Manual Mode ---
      setManualDate(today);
      // Try to default manual type to 'Downpayment' or the first one
      if (paymentTypesData && paymentTypesData.length > 0) {
        const dpType = paymentTypesData.find(
          (pt) =>
            pt.payment_type_name.toLowerCase() === "downpayment" ||
            pt.payment_type_name.toLowerCase() === "one-time payment"
        );
        setManualPaymentTypeId(dpType ? dpType.id : paymentTypesData[0].id);
      }
      // --- End Manual Mode defaults ---
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const getSelectedPaymentType = () => {
    return paymentTypes.find((pt) => pt.id === parseInt(selectedPaymentTypeId));
  };

  // ✅ --- NEW HANDLERS for Manual Mode ---
  const handleAddManualPayment = () => {
    const amount = parseFloat(manualAmount);
    if (
      !manualDate ||
      isNaN(amount) ||
      amount <= 0 ||
      !manualPaymentTypeId
    ) {
      alert(
        "Please fill in a valid date, a positive amount, and a payment type."
      );
      return;
    }

    const selectedType = paymentTypes.find(
      (pt) => pt.id === parseInt(manualPaymentTypeId)
    );
    if (!selectedType) {
      alert("Invalid payment type selected.");
      return;
    }

    const newPayment = {
      temp_id: Date.now(), // For React list key and removal
      payment_date: manualDate,
      amount_to_be_paid: amount,
      payment_type_id: selectedType.id,
      payment_type_name: selectedType.payment_type_name, // For display in list
    };

    setManualPayments([...manualPayments, newPayment]);
    // Reset form for next entry
    setManualAmount("");
  };

  const handleRemoveManualPayment = (temp_id) => {
    setManualPayments(manualPayments.filter((p) => p.temp_id !== temp_id));
  };
  // --- End new handlers ---

  // ✅ --- MODIFIED Generate Handler ---
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const payments = [];

      if (mode === "schedule") {
        // --- Existing Schedule Logic ---
        if (!totalPremium || totalPremium <= 0) {
          throw new Error("Invalid total premium amount");
        }
        if (!selectedPaymentTypeId) {
          throw new Error("Please select a payment type");
        }
        if (!startDate) {
          throw new Error("Please select a start date");
        }

        const selectedType = getSelectedPaymentType();
        const monthsCount = selectedType.months_payment;

        if (monthsCount === 1) {
          payments.push({
            payment_date: startDate,
            amount_to_be_paid: totalPremium,
            paid_amount: 0,
            is_paid: false,
            payment_type_id: selectedType.id,
            policy_id: policy.id,
          });
        } else {
          const monthlyAmount = Math.round((totalPremium / monthsCount) * 100) / 100;
          const start = new Date(startDate);
          
          for (let i = 0; i < monthsCount; i++) {
            const paymentDate = new Date(start);
            paymentDate.setMonth(start.getMonth() + i);
            
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
        // --- End Existing Schedule Logic ---

      } else {
        // --- ✅ NEW Manual Mode Logic ---
        if (manualPayments.length === 0) {
          throw new Error("No manual payments have been added.");
        }
        
        // Convert manualPayments to the final format
        manualPayments.forEach(p => {
          payments.push({
            payment_date: p.payment_date,
            amount_to_be_paid: p.amount_to_be_paid,
            payment_type_id: p.payment_type_id,
            paid_amount: 0,
            is_paid: false,
            policy_id: policy.id,
          });
        });
        // --- End NEW Manual Mode Logic ---
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

  // --- Loading and Error states (unchanged) ---
  if (loadingData) {
    /* ... (your existing loading modal) ... */
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px", minWidth: "400px" }}>
          <p>Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    /* ... (your existing error modal) ... */
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px", minWidth: "400px" }}>
          <h3 style={{ color: "#ef4444", marginTop: 0 }}>Error</h3>
          <p>{error}</p>
          <button onClick={onClose} style={{ marginTop: "16px", padding: "8px 16px", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  // --- Helper variables for render (unchanged) ---
  const selectedType = getSelectedPaymentType();
  const monthsCount = selectedType?.months_payment || 1;
  const monthlyAmount =
    totalPremium && selectedType
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
        zIndex: 1000,
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
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: "8px" }}>
          Generate Payment Schedule
        </h3>
        <p
          style={{
            backgroundColor: "#f3f4f6",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "14px",
            marginBottom: "20px",
          }}
        >
          <strong>Policy ID:</strong> {policy.internal_id}
        </p>

        {/* ✅ --- NEW Mode Toggler --- */}
        <div style={{ display: "flex", marginBottom: "20px" }}>
          <button
            onClick={() => setMode("schedule")}
            style={{
              flex: 1,
              padding: "10px",
              fontSize: "14px",
              fontWeight: "500",
              border: "1px solid #2563eb",
              borderRight: "none",
              borderTopLeftRadius: "6px",
              borderBottomLeftRadius: "6px",
              backgroundColor: mode === "schedule" ? "#2563eb" : "white",
              color: mode === "schedule" ? "white" : "#2563eb",
              cursor: "pointer",
            }}
          >
            Generate Schedule
          </button>
          <button
            onClick={() => setMode("manual")}
            style={{
              flex: 1,
              padding: "10px",
              fontSize: "14px",
              fontWeight: "500",
              border: "1px solid #2563eb",
              borderTopRightRadius: "6px",
              borderBottomRightRadius: "6px",
              backgroundColor: mode === "manual" ? "#2563eb" : "white",
              color: mode === "manual" ? "white" : "#2563eb",
              cursor: "pointer",
            }}
          >
            Manual Entry
          </button>
        </div>

        {/* ✅ --- SCHEDULE MODE UI (Existing UI) --- */}
        {mode === "schedule" && (
          <>
            {/* Total Premium Display (Read-only) */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Total Premium (from Policy Computation)
              </label>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "6px",
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#059669",
                }}
              >
                ₱
                {totalPremium?.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            {/* Payment Type Selection */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
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
                  boxSizing: "border-box",
                }}
              >
                {paymentTypes.length === 0 && (
                  <option value="">No payment types available</option>
                )}
                {paymentTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.payment_type_name}
                    {pt.months_payment > 1 && ` (${pt.months_payment} months)`}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                {monthsCount === 1
                  ? "Payment Date"
                  : "Start Date (First Payment)"}
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
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Payment Preview */}
            {startDate && selectedType && (
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "20px",
                }}
              >
                {monthsCount === 1 ? (
                  <p style={{ margin: 0, fontSize: "14px" }}>
                    <strong>Single payment:</strong> ₱
                    {parseFloat(totalPremium).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                ) : (
                  <>
                    <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
                      <strong>
                        {monthsCount === 2
                          ? "Semi-annual"
                          : "Monthly"} payment:
                      </strong>{" "}
                      ₱
                      {parseFloat(monthlyAmount).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p style={{ margin: 0, fontSize: "14px", color: "#1e40af" }}>
                      {monthsCount} payments from{" "}
                      {new Date(startDate).toLocaleDateString("en-PH")}
                      {" to "}
                      {new Date(
                        new Date(startDate).setMonth(
                          new Date(startDate).getMonth() + monthsCount - 1
                        )
                      ).toLocaleDateString("en-PH")}
                    </p>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* ✅ --- NEW MANUAL MODE UI --- */}
        {mode === "manual" && (
          <div>
            {/* Manual Payment List */}
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                maxHeight: "150px",
                overflowY: "auto",
                marginBottom: "16px",
              }}
            >
              {manualPayments.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    padding: "16px",
                    margin: 0,
                    fontSize: "14px"
                  }}
                >
                  No payments added yet.
                </p>
              ) : (
                manualPayments.map((p) => (
                  <div
                    key={p.temp_id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderBottom: "1px solid #e5e7eb",
                      fontSize: "14px"
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: "500" }}>
                        {new Date(p.payment_date + "T00:00:00").toLocaleDateString("en-PH", {month: "short", day: "2-digit", year: "numeric"})}
                      </span>
                      {" - "}
                      <span>
                        ₱{p.amount_to_be_paid.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </span>
                      <br/>
                      <span style={{ fontSize: "12px", color: "#4b5563" }}>
                        ({p.payment_type_name})
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveManualPayment(p.temp_id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        fontSize: "18px",
                        cursor: "pointer",
                        padding: "4px"
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Manual Entry Form */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>Date</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>Amount (₱)</label>
                <input
                  type="number"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500", fontSize: "14px" }}>Payment Type</label>
              <select
                value={manualPaymentTypeId}
                onChange={(e) => setManualPaymentTypeId(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
              >
                {paymentTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.payment_type_name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleAddManualPayment}
              style={{
                width: "100%",
                padding: "10px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#10b981",
                color: "white",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              + Add Payment to List
            </button>
          </div>
        )}

        {/* --- ✅ MODIFIED Action Buttons --- */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            marginTop: "24px",
          }}
        >
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
              opacity: loading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={
              loading ||
              (mode === "schedule" && !selectedPaymentTypeId) ||
              (mode === "manual" && manualPayments.length === 0)
            }
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              backgroundColor:
                loading ||
                (mode === "schedule" && !selectedPaymentTypeId) ||
                (mode === "manual" && manualPayments.length === 0)
                  ? "#9ca3af"
                  : "#2563eb",
              color: "white",
              cursor:
                loading ||
                (mode === "schedule" && !selectedPaymentTypeId) ||
                (mode === "manual" && manualPayments.length === 0)
                  ? "not-allowed"
                  : "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {loading
              ? "Generating..."
              : mode === "schedule"
              ? "Generate Schedule"
              : `Generate ${manualPayments.length} Manual Payment(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentGenerationModal;