import { useState, useEffect } from "react";
import { db } from "../dbServer"; // Adjust path as needed
import "./styles/payment-generation-styles.css";

export default function PaymentGenerationModal({ policy, onClose, onGenerate }) {
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);

  // Fetch payment types from database
  useEffect(() => {
    fetchPaymentTypes();
  }, []);

  const fetchPaymentTypes = async () => {
    try {
      setLoadingTypes(true);
      const { data, error } = await db
        .from("payment_type")
        .select("id, payment_type_name, months_payment")
        .order("months_payment", { ascending: true });

      if (error) throw error;
      
      setPaymentTypes(data || []);
      
      // Set default to first payment type if available
      if (data && data.length > 0) {
        setSelectedPaymentTypeId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching payment types:", error);
      alert("Failed to load payment types. Please try again.");
    } finally {
      setLoadingTypes(false);
    }
  };

  const getSelectedPaymentType = () => {
    return paymentTypes.find(pt => pt.id === parseInt(selectedPaymentTypeId));
  };

  const handleGenerate = async () => {
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      alert("Please enter a valid total amount");
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
      const amount = parseFloat(totalAmount);
      const selectedType = getSelectedPaymentType();
      const monthsCount = selectedType.months_payment;
      const payments = [];

      if (monthsCount === 1) {
        // Single payment
        payments.push({
          payment_date: startDate,
          amount_to_be_paid: amount,
          paid_amount: 0,
          is_paid: false,
          payment_type_id: selectedType.id
        });
      } else {
        // Multiple monthly payments
        const monthlyAmount = Math.round((amount / monthsCount) * 100) / 100;
        const start = new Date(startDate);
        
        for (let i = 0; i < monthsCount; i++) {
          const paymentDate = new Date(start);
          paymentDate.setMonth(start.getMonth() + i);
          
          // Handle last payment to account for rounding
          const isLast = i === monthsCount - 1;
          const paymentAmount = isLast 
            ? parseFloat((amount - (monthlyAmount * (monthsCount - 1))).toFixed(2))
            : monthlyAmount;
          
          payments.push({
            payment_date: paymentDate.toISOString().split('T')[0],
            amount_to_be_paid: paymentAmount,
            paid_amount: 0,
            is_paid: false,
            payment_type_id: selectedType.id
          });
        }
      }

      await onGenerate(policy.id, payments);
      onClose();
    } catch (error) {
      console.error("Error generating payments:", error);
      alert("Failed to generate payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedType = getSelectedPaymentType();
  const monthsCount = selectedType?.months_payment || 1;
  const monthlyAmount = totalAmount && selectedType 
    ? (parseFloat(totalAmount) / monthsCount).toFixed(2)
    : "0.00";

  if (loadingTypes) {
    return (
      <div className="payment-modal-backdrop">
        <div className="payment-modal payment-generation-modal">
          <p>Loading payment types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-modal-backdrop">
      <div className="payment-modal payment-generation-modal">
        <h3>Generate Payment Schedule</h3>
        <p className="modal-policy-info">
          Policy ID: {policy.internal_id}
        </p>

        <div className="modal-form-group">
          <label className="modal-label">Payment Type</label>
          <select
            value={selectedPaymentTypeId}
            onChange={(e) => setSelectedPaymentTypeId(e.target.value)}
            className="modal-select"
            disabled={paymentTypes.length === 0}
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

        <div className="modal-form-group">
          <label className="modal-label">Total Amount</label>
          <input
            type="number"
            step="0.01"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="Enter total amount"
            className="modal-input"
          />
        </div>

        <div className="modal-form-group">
          <label className="modal-label">
            {monthsCount === 1 ? "Payment Date" : "Start Date (First Payment)"}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="modal-input"
          />
          {totalAmount && startDate && selectedType && monthsCount > 1 && (
            <div className="payment-preview">
              <p className="monthly-preview">
                {monthsCount === 2 ? "Semi-annual" : "Monthly"} payment: ₱{parseFloat(monthlyAmount).toLocaleString()}
              </p>
              <p className="payment-schedule-preview">
                {monthsCount} payments from {new Date(startDate).toLocaleDateString()} 
                {" to "}
                {new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + monthsCount - 1)).toLocaleDateString()}
              </p>
            </div>
          )}
          {totalAmount && startDate && selectedType && monthsCount === 1 && (
            <p className="monthly-preview">
              Single payment of ₱{parseFloat(totalAmount).toLocaleString()}
            </p>
          )}
        </div>

        <div className="payment-generation-actions">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading || !selectedPaymentTypeId}
          >
            {loading ? 'Generating...' : 'Generate Payments'}
          </button>
        </div>
      </div>
    </div>
  );
}