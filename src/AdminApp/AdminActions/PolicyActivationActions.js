import { db } from "../../dbServer";

export async function ActivatePolicyAndPayment(policyId, paymentTypeId, totalPremium, months) {
  try {
    // Calculate dates
    const today = new Date();
    const inceptionDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Calculate expiry date (1 year from today)
    const expiryDate = new Date(today);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const expiryDateString = expiryDate.toISOString().split('T')[0];

    console.log("=== ACTIVATION DETAILS ===");
    console.log("Policy ID:", policyId);
    console.log("Inception Date:", inceptionDate);
    console.log("Expiry Date:", expiryDateString);
    console.log("Payment Type ID:", paymentTypeId);
    console.log("Total Premium:", totalPremium);
    console.log("Months:", months);

    // 1. Activate the policy and set dates
    const { data: policyData, error: policyError } = await db
      .from("policy_Table")
      .update({ 
        policy_is_active: true,
        policy_inception: inceptionDate,
        policy_expiry: expiryDateString
      })
      .eq("id", policyId)
      .select();
    
    if (policyError) {
      console.error("Error updating policy:", policyError);
      throw policyError;
    }

    console.log("Policy updated successfully:", policyData);

    // 2. Generate monthly payments
    const monthlyAmount = Number((totalPremium / months).toFixed(2));
    
    const paymentRows = Array.from({ length: months }, (_, i) => {
      const paymentDate = new Date(today);
      paymentDate.setMonth(today.getMonth() + (i + 1));
      
      const row = {
        payment_date: paymentDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        amount_to_be_paid: monthlyAmount,
        is_paid: false,
        policy_id: policyId,
        paid_amount: 0,
        payment_type_id: paymentTypeId,
      };
      
      console.log(`Payment ${i + 1}:`, row);
      return row;
    });

    console.log("=== PAYMENT ROWS TO INSERT ===");
    console.log("Total rows:", paymentRows.length);
    console.log("First payment:", paymentRows[0]);
    console.log("Last payment:", paymentRows[paymentRows.length - 1]);

    // 3. Insert payments
    console.log("=== ATTEMPTING TO INSERT PAYMENTS ===");
    const { data: paymentData, error: paymentError } = await db
      .from("payment_Table")
      .insert(paymentRows)
      .select();
    
    if (paymentError) {
      console.error("❌ Error inserting payments:", paymentError);
      console.error("Error details:", JSON.stringify(paymentError, null, 2));
      throw paymentError;
    }

    if (!paymentData || paymentData.length === 0) {
      console.warn("⚠️ No payment data returned after insert");
    } else {
      console.log("✅ Payments inserted successfully!");
      console.log("Number of payments created:", paymentData.length);
      console.log("Payment data:", paymentData);
    }

    return { 
      success: true, 
      policy: policyData, 
      payments: paymentData,
      inceptionDate,
      expiryDate: expiryDateString
    };
  } catch (error) {
    console.error("Error activating policy with payments:", error.message);
    return { success: false, error: error.message };
  }
}