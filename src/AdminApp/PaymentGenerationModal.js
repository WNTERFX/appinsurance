import { useState } from "react";
import "./styles/payment-generation-styles.css";

export default function PaymentGenerationModal({ policy, onClose, onGenerate }) {
  const [paymentType, setPaymentType] = useState("6-month");
  const [totalAmount, setTotalAmount] = useState("");
  const [singlePaymentDate, setSinglePaymentDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      alert("Please enter a valid total amount");
      return;
    }

    if (paymentType === "single" && !singlePaymentDate) {
      alert("Please select a payment date");
      return;
    }

    if (paymentType === "6-month" && !startDate) {
      alert("Please select a start date");
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(totalAmount);
      const payments = [];

      if (paymentType === "single") {
        payments.push({
          payment_date: singlePaymentDate,
          amount_to_be_paid: amount,
          paid_amount: 0,
          is_paid: false,
          payment_type_id: 1 // You may need to adjust this based on your payment_type table
        });
      } else {
        // Generate 6 monthly payments
        const monthlyAmount = Math.round((amount / 6) * 100) / 100;
        const start = new Date(startDate);
        
        for (let i = 0; i < 6; i++) {
          const paymentDate = new Date(start);
          paymentDate.setMonth(start.getMonth() + i);
          
          // Handle last payment to account for rounding
          const isLast = i === 5;
          const paymentAmount = isLast 
            ? parseFloat((amount - (monthlyAmount * 5)).toFixed(2))
            : monthlyAmount;
          
          payments.push({
            payment_date: paymentDate.toISOString().split('T')[0],
            amount_to_be_paid: paymentAmount,
            paid_amount: 0,
            is_paid: false,
            payment_type_id: 1 // You may need to adjust this based on your payment_type table
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
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="modal-select"
          >
            <option value="6-month">6-Month Payment Plan</option>
            <option value="single">Single Payment</option>
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

        {paymentType === "single" ? (
          <div className="modal-form-group">
            <label className="modal-label">Payment Date</label>
            <input
              type="date"
              value={singlePaymentDate}
              onChange={(e) => setSinglePaymentDate(e.target.value)}
              className="modal-input"
            />
          </div>
        ) : (
          <div className="modal-form-group">
            <label className="modal-label">Start Date (First Payment)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="modal-input"
            />
            {totalAmount && startDate && (
              <p className="monthly-preview">
                Monthly payment: ₱{(parseFloat(totalAmount) / 6).toFixed(2).toLocaleString()}
              </p>
            )}
          </div>
        )}

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
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Payments'}
          </button>
        </div>
      </div>
    </div>
  );
}