import { db } from "../../dbServer";

export async function ActivatePolicyAndPayment(policyId, paymentTypeId, totalPremium, months) {
  try {
    // 1️⃣ Get the exact UTC timestamp when activation happens
    const now = new Date();
    const inceptionTimestamp = now.toISOString();

    // 2️⃣ Calculate expiry (1 year from now, same UTC time)
    const expiryDate = new Date(now);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const expiryTimestamp = expiryDate.toISOString();

    console.log("=== ACTIVATION DETAILS ===");
    console.log("Policy ID:", policyId);
    console.log("Inception (UTC):", inceptionTimestamp);
    console.log("Expiry (UTC):", expiryTimestamp);
    console.log("Payment Type ID:", paymentTypeId);
    console.log("Total Premium:", totalPremium);
    console.log("Months:", months);

    // 3️⃣ Activate policy with UTC timestamps
    const { data: policyData, error: policyError } = await db
      .from("policy_Table")
      .update({
        policy_is_active: true,
        policy_inception: inceptionTimestamp,
        policy_expiry: expiryTimestamp,
      })
      .eq("id", policyId)
      .select();

    if (policyError) throw policyError;
    console.log("✅ Policy activated successfully:", policyData);

    // 4️⃣ Generate monthly payments
    const monthlyAmount = Number((totalPremium / months).toFixed(2));

    const paymentRows = Array.from({ length: months }, (_, i) => {
      const paymentDate = new Date(now);
      paymentDate.setMonth(paymentDate.getMonth() + (i + 1));

      return {
        payment_date: paymentDate.toISOString().split("T")[0], // only YYYY-MM-DD
        amount_to_be_paid: monthlyAmount,
        is_paid: false,
        policy_id: policyId,
        paid_amount: 0,
        payment_type_id: paymentTypeId,
      };
    });

    console.log("=== PAYMENT ROWS TO INSERT ===");
    console.log("Total rows:", paymentRows.length);
    console.log("First payment:", paymentRows[0]);
    console.log("Last payment:", paymentRows[paymentRows.length - 1]);

    // 5️⃣ Insert payments
    const { data: paymentData, error: paymentError } = await db
      .from("payment_Table")
      .insert(paymentRows)
      .select();

    if (paymentError) throw paymentError;

    console.log("✅ Payments inserted successfully!");
    console.log("Number of payments created:", paymentData.length);

    return {
      success: true,
      policy: policyData,
      payments: paymentData,
      inceptionTimestamp,
      expiryTimestamp,
    };
  } catch (error) {
    console.error("❌ Error activating policy with payments:", error);
    return { success: false, error: error.message };
  }
}

export async function CancelPolicyAndRefund(policyId) {
    try {
        console.log(`=== START CANCEL POLICY for ID: ${policyId} ===`);

        // 1️⃣ Fetch Policy and related Computation/Payment Data
        const { data: policyData, error: policyErr } = await db
            .from("policy_Table")
            .select(`
                policy_inception,
                policy_is_active,
                policy_Computation_Table (total_Premium, payment_type_id)
            `)
            .eq("id", policyId)
            .single();

        if (policyErr) throw policyErr;
        
        const computation = policyData?.policy_Computation_Table?.[0];
        if (!computation) throw new Error("Missing policy computation data.");
        
        const totalPremium = Number(computation.total_Premium);
        const paymentTypeId = Number(computation.payment_type_id);
        
        if (!paymentTypeId) {
             throw new Error("Invalid payment_type_id found in computation table.");
        }

        // 2️⃣ Fetch Payment Type details (specifically months)
        const { data: paymentType, error: ptError } = await db
            .from("payment_type")
            .select("months_payment")
            .eq("id", paymentTypeId)
            .single();

        if (ptError) throw ptError;
        const months = paymentType?.months_payment;
        
        if (!months) {
            throw new Error(`Payment type (ID: ${paymentTypeId}) is missing months_payment configuration.`);
        }
        
        // 3️⃣ Check for existing payments
        let { data: paymentsToUse, error: payError } = await db
            .from("payment_Table")
            .select("id, amount_to_be_paid")
            .eq("policy_id", policyId)
            .order("payment_date", { ascending: true });
        
        if (payError) throw payError;

        // 4️⃣ If no payments exist, GENERATE them using the policy's inception date
        if (!paymentsToUse || paymentsToUse.length === 0) {
            const policyInception = policyData.policy_inception;
            if (!policyInception) {
                throw new Error("Policy Inception date is missing. Cannot generate payment schedule for refund.");
            }
            
            console.log("No existing payments found. Generating schedule based on Policy Inception.");

            const monthlyAmount = Number((totalPremium / months).toFixed(2));
            const startDate = new Date(policyInception);

            const paymentRows = Array.from({ length: months }, (_, i) => {
                const paymentDate = new Date(startDate);
                paymentDate.setMonth(paymentDate.getMonth() + (i + 1)); 

                return {
                    payment_date: paymentDate.toISOString().split("T")[0],
                    amount_to_be_paid: monthlyAmount,
                    is_paid: false,
                    paid_amount: 0,
                    policy_id: policyId,
                    payment_type_id: paymentTypeId,
                    payment_status: "pending",
                };
            });

            const { data: insertedPayments, error: insertError } = await db
                .from("payment_Table")
                .insert(paymentRows)
                .select("id, amount_to_be_paid");

            if (insertError) throw insertError;
            paymentsToUse = insertedPayments;
            console.log(`✅ Successfully generated and inserted ${insertedPayments.length} payments.`);
        }

        if (!paymentsToUse || paymentsToUse.length === 0) {
            throw new Error("Failed to generate or retrieve payments necessary for cancellation.");
        }

        // 5️⃣ REFUND the first payment (mark as refunded, not just paid)
        const firstPayment = paymentsToUse[0];
        const cancellationReason = "Policy cancelled by user/admin. First payment refunded.";
        
        const { error: refundError } = await db
            .from("payment_Table")
            .update({
                is_paid: false,                              // NOT paid, it's refunded
                paid_amount: 0,                              // Reset paid amount since it's refunded
                is_refunded: true,                           // Mark as refunded
                refund_amount: firstPayment.amount_to_be_paid, // Full refund amount
                refund_date: new Date().toISOString(),
                refund_reason: cancellationReason,
                payment_status: "refunded",                  // Status: refunded
            })
            .eq("id", firstPayment.id);
            
        if (refundError) throw refundError;
        console.log(`✅ Refunded first payment (ID: ${firstPayment.id})`);

        // 6️⃣ CANCEL (not archive) the remaining payments
        const remainingIds = paymentsToUse.slice(1).map((p) => p.id);
        if (remainingIds.length > 0) {
            const { error: cancelError } = await db
                .from("payment_Table")
                .update({
                    payment_status: "cancelled",             // Status: cancelled
                    is_archive: false,                       // DO NOT archive
                    // archival_date is not set
                })
                .in("id", remainingIds);
                
            if (cancelError) throw cancelError;
            console.log(`✅ Cancelled ${remainingIds.length} remaining payments.`);
        }

        // 7️⃣ Cancel the policy (Final Step)
        const { error: policyUpdateError } = await db
            .from("policy_Table")
            .update({
                policy_status: "cancelled",
                policy_is_active: false,
                cancellation_date: new Date().toISOString(),
                cancellation_reason: "Cancelled by admin/user logic",
            })
            .eq("id", policyId);
            
        if (policyUpdateError) throw policyUpdateError;

        console.log("=== POLICY CANCELLED SUCCESSFULLY ===");
        
        return { 
            success: true,
            message: "Policy cancelled. First payment refunded, remaining payments cancelled."
        };
    } catch (err) {
        console.error("❌ CancelPolicyAndRefund error:", err);
        return { success: false, error: err.message };
    }
}