import { useEffect, useState } from "react";
import { db } from "../../dbServer";
import {
  fetchModeratorPoliciesWithPayments,
  fetchPaymentSchedule
} from "../ModeratorActions/ModeratorPaymentDueActions";
import "../moderator-styles/payment-table-styles-moderator.css";

export default function PaymentDueTableModerator() {
  const [policies, setPolicies] = useState([]);
  const [paymentsMap, setPaymentsMap] = useState({});
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    async function loadData() {
      try {

        //  get logged in moderator
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        //  policies for this moderator only
        const moderatorPolicies = await fetchModeratorPoliciesWithPayments(user.id);
        setPolicies(moderatorPolicies);

        //  fetch all payment schedules for these policies
        const paymentsByPolicy = {};
        for (const policy of moderatorPolicies) {
          const paymentData = await fetchPaymentSchedule(policy.id);
          paymentsByPolicy[policy.id] = paymentData;
        }
        setPaymentsMap(paymentsByPolicy);
      } catch (error) {
        console.error("Error loading moderator payments:", error);
      }
    }
    loadData();
  }, []);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!policies.length) return <p>Loading policies...</p>;

  return (
    <div className="payment-table-list-moderator">
      {policies.map((policy) => {
        const client = policy.clients_Table;
        const clientName = client
          ? [
              client.prefix,
              client.first_Name,
              client.middle_Name ? client.middle_Name.charAt(0) + "." : "",
              client.family_Name,
              client.suffix,
            ]
              .filter(Boolean)
              .join(" ")
          : "Unknown Client";

        const payments = paymentsMap[policy.id] || [];
        const isOpen = expanded[policy.id];

        return (
          <div key={policy.id} className="payment-table-card-moderator">
            {/* Header */}
            <div
              className="payment-table-header-moderator"
              onClick={() => toggleExpand(policy.id)}
            >
              <p>
                <strong>Policy ID:</strong> {policy.id}
              </p>
              <p>
                <strong>Holder:</strong> {clientName}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    policy.policy_is_active
                      ? "payment-status-active-moderator"
                      : "payment-status-inactive-moderator"
                  }
                >
                  {policy.policy_is_active ? "Active" : "Inactive"}
                </span>
              </p>
              <span className="drawer-toggle-moderator">
                {isOpen ? "▲ Hide" : "▼ Show"}
              </span>
            </div> 

            {/* Collapsible Drawer */}
           <div className={`payment-table-schedule-moderator ${isOpen ? "open" : ""}`}>
              <h3>Payments</h3>
              {payments.length > 0 ? (
                <table className="payment-table-moderator">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount to be Paid</th>
                      <th>Paid Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className={`payment-moderator-${getPaymentStatus(p)}`}>
                        <td>
                          {new Date(p.payment_date).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td>
                          {p.amount_to_be_paid?.toLocaleString(undefined, {
                            style: "currency",
                            currency: "PHP",
                          })}
                        </td>
                        <td>
                          {p.paid_amount
                            ? p.paid_amount.toLocaleString(undefined, {
                                style: "currency",
                                currency: "PHP",
                              })
                            : "₱0.00"}
                        </td>
                        <td className="status-cell-moderator">{getPaymentStatus(p)}</td>

                        <td className="payment-actions-moderator">
                          <button>Enter Payment</button>
                          
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No payments scheduled</p>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}

function getPaymentStatus(payment) {
  const { amount_to_be_paid, paid_amount } = payment;

  if (!paid_amount || paid_amount <= 0) return "not-paid"; // Red
  if (paid_amount < amount_to_be_paid) return "partially-paid"; // Yellow
  if (paid_amount >= amount_to_be_paid) return "fully-paid"; // Green

  return "not-paid"; // fallback
}
