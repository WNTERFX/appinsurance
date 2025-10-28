import { db } from "../../dbServer";

// Export all functions for use in other components

export async function ActivatePolicyAndPayment(policyId, paymentTypeId, totalPremium, months) {
  try {
    // 1️⃣ Get today's date at 12:00 noon (local time)
    const now = new Date();
    now.setHours(12, 0, 0, 0); // Set to 12:00:00.000 noon
    const inceptionTimestamp = now.toISOString();

    // 2️⃣ Calculate expiry (1 year from inception, also at 12:00 noon)
    const expiryDate = new Date(now);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    expiryDate.setHours(12, 0, 0, 0); // Ensure 12:00 noon
    const expiryTimestamp = expiryDate.toISOString();

    console.log("=== ACTIVATION DETAILS ===");
    console.log("Policy ID:", policyId);
    console.log("Inception (12:00 noon):", inceptionTimestamp);
    console.log("Expiry (12:00 noon, +1 year):", expiryTimestamp);
    console.log("Payment Type ID:", paymentTypeId);
    console.log("Total Premium:", totalPremium);
    console.log("Months:", months);

    // 3️⃣ Activate policy with noon timestamps
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
      paymentDate.setMonth(paymentDate.getMonth() + i);

      return {
        payment_date: paymentDate.toISOString().split("T")[0], // only YYYY-MM-DD
        amount_to_be_paid: monthlyAmount,
        is_paid: false,
        policy_id: policyId,
        paid_amount: 0,
        payment_type_id: paymentTypeId,
        payment_status: "pending", // ensure consistent status on create
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
                paymentDate.setMonth(paymentDate.getMonth() + i); 

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

export async function VoidPolicyAndPayments(policyId, voidReason) {
  try {
    console.log(`=== START VOID POLICY for ID: ${policyId} ===`);

    // 1️⃣ Check for existing payments
    const { data: payments, error: paymentFetchError } = await db
      .from("payment_Table")
      .select("id, payment_status, is_paid")
      .eq("policy_id", policyId)
      .order("payment_date", { ascending: true });

    if (paymentFetchError) throw paymentFetchError;

    // 2️⃣ Cancel all payments if they exist
    if (payments && payments.length > 0) {
      const paymentIds = payments.map(p => p.id);
      
      const { error: cancelPaymentsError } = await db
        .from("payment_Table")
        .update({
          payment_status: "cancelled",
          is_archive: false,
          // Don't modify is_paid or paid_amount - keep payment history intact
        })
        .in("id", paymentIds);

      if (cancelPaymentsError) throw cancelPaymentsError;
      console.log(`✅ Cancelled ${payments.length} payments`);
    }

    // 3️⃣ Void the policy
    const { error: policyUpdateError } = await db
      .from("policy_Table")
      .update({
        policy_status: "voided",
        policy_is_active: false,
        void_reason: voidReason,
        voided_date: new Date().toISOString(),
      })
      .eq("id", policyId);

    if (policyUpdateError) throw policyUpdateError;

    console.log("=== POLICY VOIDED SUCCESSFULLY ===");

    return {
      success: true,
      message: `Policy voided successfully. ${payments?.length || 0} payments cancelled.`,
      paymentsCancelled: payments?.length || 0,
    };
  } catch (err) {
    console.error("❌ VoidPolicyAndPayments error:", err);
    return { success: false, error: err.message };
  }
}

// ========================================
// 90-DAY OVERDUE VOID FUNCTIONS
// ========================================

// Utility function to check if payment is 90+ days overdue
export const isPayment90DaysOverdue = (paymentDate, isPaid) => {
  if (isPaid) return false;
  
  if (!paymentDate) return false;
  // parse as UTC date to avoid timezone shifting
  const payment = new Date(`${paymentDate}T00:00:00Z`);
  const now = new Date();
  const diffTime = now.getTime() - payment.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 90;
};

// Calculate days overdue for a payment
export const getDaysOverdue = (paymentDate) => {
  if (!paymentDate) return 0;
  const payment = new Date(`${paymentDate}T00:00:00Z`);
  const now = new Date();
  const diffTime = now.getTime() - payment.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Debug log
  console.log(`📅 Date calc: Today=${now.toISOString().split('T')[0]}, Payment=${payment.toISOString().split('T')[0]}, Diff=${diffDays} days`);
  
  return diffDays;
};

// Void a single policy if it has payments overdue by 90+ days
export async function VoidOverduePaymentsAndPolicy(policyId) {
  try {
    console.log(`\n📋 Checking policy ${policyId} for overdue payments...`);

    // 1️⃣ Fetch policy
    const { data: policy, error: policyError } = await db
      .from("policy_Table")
      .select("id, internal_id, policy_status, policy_type, clients_Table(first_Name, family_Name)")
      .eq("id", policyId)
      .single();

    if (policyError) throw policyError;

    if (["voided", "cancelled"].includes(policy.policy_status)) {
      console.log(`⏭️ Policy ${policy.internal_id} already ${policy.policy_status}, skipping`);
      return { success: true, skipped: true, reason: `Already ${policy.policy_status}` };
    }

    // 2️⃣ Determine 90-day cutoff
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - 90);

    // 3️⃣ Get all unpaid payments
    const { data: payments, error: paymentsError } = await db
      .from("payment_Table")
      .select("*")
      .eq("policy_id", policyId)
      .eq("is_paid", false)
      .in("payment_status", ["pending", "unpaid", null])
      .order("payment_date", { ascending: true });

    if (paymentsError) throw paymentsError;
    if (!payments || payments.length === 0) {
      console.log("✓ No unpaid payments found");
      return { success: true, overdueCount: 0, voidedCount: 0 };
    }

    // 4️⃣ Check if ANY unpaid payment is 90+ days overdue
    const overduePayments = payments.filter(p => getDaysOverdue(p.payment_date) >= 90);
    if (overduePayments.length === 0) {
      console.log("✓ No 90+ day overdue payments found");
      return { success: true, overdueCount: 0, voidedCount: 0 };
    }

    console.log(`🚨 Found ${overduePayments.length} overdue payment(s)`);
    const allUnpaidIds = payments.map(p => p.id);

    // 5️⃣ Void ALL unpaid payments (since one is 90+ overdue)
    const { error: voidError } = await db
      .from("payment_Table")
      .update({
        payment_status: "voided",
        is_archive: false,
      })
      .in("id", allUnpaidIds);

    if (voidError) throw voidError;

    // 6️⃣ Void policy itself
    const maxDaysOverdue = Math.max(...overduePayments.map(p => getDaysOverdue(p.payment_date)));
    const voidReason = `Auto-voided: payment overdue by 90+ days (${maxDaysOverdue} days late)`;

    const { error: policyVoidError } = await db
      .from("policy_Table")
      .update({
        policy_status: "voided",
        void_reason: voidReason,
        voided_date: new Date().toISOString(),
        policy_is_active: false,
      })
      .eq("id", policyId);

    if (policyVoidError) throw policyVoidError;

    console.log(`✅ Policy ${policy.internal_id} voided — ${payments.length} unpaid payment(s) voided`);

    return {
      success: true,
      policyVoided: true,
      overdueCount: overduePayments.length,
      totalVoided: payments.length,
      maxDaysOverdue,
    };
  } catch (error) {
    console.error("❌ Error voiding overdue payments:", error);
    return { success: false, error: error.message };
  }
}

// DEBUG FUNCTION - Test overdue detection for a specific policy
export async function DebugCheckPolicy(policyId) {
  try {
    console.log("\n🐛 === DEBUG MODE ===");
    console.log("Policy ID:", policyId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("Today's date:", today.toISOString().split('T')[0]);
    console.log("Today (epoch):", today.getTime());
    
    // Get policy
    const { data: policy, error: policyError } = await db
      .from("policy_Table")
      .select("*")
      .eq("id", policyId)
      .single();
    
    if (policyError) throw policyError;
    console.log("\n📋 Policy:", {
      id: policy.id,
      internal_id: policy.internal_id,
      status: policy.policy_status,
      is_active: policy.policy_is_active,
      is_archived: policy.is_archived
    });
    
    // Get ALL payments for this policy (no filters)
    const { data: allPayments, error: payError } = await db
      .from("payment_Table")
      .select("*")
      .eq("policy_id", policyId)
      .order("payment_date", { ascending: true });
    
    if (payError) throw payError;
    
    console.log(`\n💰 Total payments found: ${allPayments?.length || 0}`);
    
    if (allPayments && allPayments.length > 0) {
      console.log("\n📊 ANALYZING ALL PAYMENTS:");
      allPayments.forEach(payment => {
        const paymentDate = new Date(`${payment.payment_date}T00:00:00Z`);
        const diffTime = today.getTime() - paymentDate.getTime();
        const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        const isPaid = payment.is_paid;
        const status = payment.payment_status || 'null';
        
        // Determine if this would be voided
        const wouldVoid = !isPaid && 
                         daysOverdue >= 90 && 
                         status !== 'voided' && 
                         status !== 'cancelled' && 
                         status !== 'refunded';
        
        console.log(`\n  💳 Payment ${payment.id}:`);
        console.log(`     Date: ${payment.payment_date} (${daysOverdue} days ${daysOverdue >= 0 ? 'overdue' : 'future'})`);
        console.log(`     Amount: ₱${payment.amount_to_be_paid}`);
        console.log(`     Is Paid: ${isPaid}`);
        console.log(`     Status: ${status}`);
        console.log(`     Archive: ${payment.is_archive}`);
        console.log(`     🎯 Would Void: ${wouldVoid ? '🚨 YES' : 'no'}`);
      });
    }
    
    // Now test the actual filter used by the function
    console.log("\n🔍 TESTING ACTUAL QUERY FILTER:");
    const { data: filteredPayments, error: filterError } = await db
      .from("payment_Table")
      .select("*")
      .eq("policy_id", policyId)
      .eq("is_paid", false)
      .in("payment_status", ["pending", "unpaid", null]);
    
    if (filterError) throw filterError;
    
    console.log(`   Unpaid payments after filter: ${filteredPayments?.length || 0}`);
    
    if (filteredPayments && filteredPayments.length > 0) {
      filteredPayments.forEach(p => {
        const paymentDate = new Date(`${p.payment_date}T00:00:00Z`);
        const diffTime = today.getTime() - paymentDate.getTime();
        const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        console.log(`   - Payment ${p.id}: ${p.payment_date} → ${daysOverdue} days overdue`);
      });
    }
    
    const overduePayments = filteredPayments?.filter(p => {
      const paymentDate = new Date(`${p.payment_date}T00:00:00Z`);
      const diffTime = today.getTime() - paymentDate.getTime();
      const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return daysOverdue >= 90;
    }) || [];
    
    console.log(`\n🚨 FINAL RESULT: ${overduePayments.length} payment(s) overdue by 90+ days`);
    
    if (overduePayments.length > 0) {
      console.log("\n⚠️ THESE PAYMENTS WOULD BE VOIDED:");
      overduePayments.forEach(p => {
        const paymentDate = new Date(`${p.payment_date}T00:00:00Z`);
        const diffTime = today.getTime() - paymentDate.getTime();
        const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        console.log(`   🔴 Payment ${p.id}: ${daysOverdue} days overdue (Due: ${p.payment_date})`);
      });
    } else {
      console.log("\n✅ No payments would be voided (none are 90+ days overdue)");
    }
    
    return {
      total_payments: allPayments?.length || 0,
      unpaid_payments: filteredPayments?.length || 0,
      overdue_90plus: overduePayments.length,
      overdue_details: overduePayments.map(p => {
        const paymentDate = new Date(`${p.payment_date}T00:00:00Z`);
        const diffTime = today.getTime() - paymentDate.getTime();
        const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return {
          id: p.id,
          date: p.payment_date,
          days_overdue: daysOverdue,
          amount: p.amount_to_be_paid
        };
      })
    };
    
  } catch (error) {
    console.error("❌ Debug error:", error);
    return { error: error.message };
  }
}

// SIMPLE TEST - Check ALL payments in database
export async function DebugCheckAllPayments() {
  try {
    console.log("\n🔍 === CHECKING ALL PAYMENTS IN DATABASE ===");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("Today:", today.toISOString().split('T')[0]);
    
    const { data: allPayments, error } = await db
      .from("payment_Table")
      .select("id, policy_id, payment_date, is_paid, payment_status, amount_to_be_paid")
      .order("payment_date", { ascending: true });
    
    if (error) throw error;
    
    console.log(`\n📊 Total payments in database: ${allPayments?.length || 0}`);
    
    if (!allPayments || allPayments.length === 0) {
      console.log("❌ No payments found in database!");
      return { total: 0, overdue: 0 };
    }
    
    let overdueCount = 0;
    const overdueList = [];
    
    allPayments.forEach(p => {
      const paymentDate = new Date(`${p.payment_date}T00:00:00Z`);
      const diffTime = today.getTime() - paymentDate.getTime();
      const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (!p.is_paid && daysOverdue >= 90 && p.payment_status !== 'voided' && p.payment_status !== 'cancelled' && p.payment_status !== 'refunded') {
        overdueCount++;
        overdueList.push({
          payment_id: p.id,
          policy_id: p.policy_id,
          date: p.payment_date,
          days_overdue: daysOverdue,
          amount: p.amount_to_be_paid,
          status: p.payment_status || 'null'
        });
      }
    });
    
    console.log(`\n🚨 Found ${overdueCount} payment(s) that are 90+ days overdue and unpaid:`);
    
    if (overdueList.length > 0) {
      overdueList.forEach(p => {
        console.log(`   🔴 Payment ${p.payment_id} (Policy ${p.policy_id}): ${p.days_overdue} days overdue, Due: ${p.date}, Amount: ₱${p.amount}, Status: ${p.status}`);
      });
    } else {
      console.log("   ✅ None found - all payments are either paid, cancelled, or less than 90 days overdue");
    }
    
    return {
      total: allPayments.length,
      overdue: overdueCount,
      overdue_list: overdueList
    };
    
  } catch (error) {
    console.error("❌ Error:", error);
    return { error: error.message };
  }
}

// Batch check all active policies for overdue payments
export async function CheckAllPoliciesForOverduePayments() {
  try {
    console.log("\n🔍 === STARTING OVERDUE PAYMENT CHECK ===");
    console.log("Current date:", new Date().toISOString().split('T')[0]);
    const checkStartTime = Date.now();
    
    // 1️⃣ Get all policies that are not already voided or cancelled
    const { data: policies, error: policiesError } = await db
      .from("policy_Table")
      .select("id, internal_id, policy_type, policy_status, is_archived, clients_Table(first_Name, family_Name)")
      .or("policy_status.is.null,policy_status.eq.active,policy_status.eq.pending,policy_status.eq.issued")
      .or("is_archived.is.null,is_archived.eq.false");
    
    if (policiesError) throw policiesError;
    
    console.log("📋 Query results:", {
      total: policies?.length || 0,
      policies: policies?.map(p => ({
        id: p.id,
        internal_id: p.internal_id,
        status: p.policy_status || 'null',
        archived: p.is_archived
      }))
    });
    
    if (!policies || policies.length === 0) {
      console.log("❌ No active policies found");
      return {
        success: true,
        totalChecked: 0,
        totalVoided: 0,
        policiesAffected: []
      };
    }
    
    console.log(`✅ Found ${policies.length} active policies to check\n`);
    
    let totalVoided = 0;
    let policiesAffected = [];
    
    // 2️⃣ Check each policy for overdue payments
    for (const policy of policies) {
      const result = await VoidOverduePaymentsAndPolicy(policy.id);
      
      if (result.success && result.policyVoided) {
        totalVoided += result.voidedCount;
        policiesAffected.push({
          id: policy.id,
          internal_id: policy.internal_id,
          policy_type: policy.policy_type,
          client_name: policy.clients_Table 
            ? `${policy.clients_Table.first_Name} ${policy.clients_Table.family_Name}`
            : "Unknown",
          voidedCount: result.voidedCount,
          maxDaysOverdue: result.maxDaysOverdue
        });
      }
    }
    
    const checkDuration = ((Date.now() - checkStartTime) / 1000).toFixed(2);
    
    console.log("\n=== OVERDUE CHECK COMPLETE ===");
    console.log(`Total policies checked: ${policies.length}`);
    console.log(`Policies voided: ${policiesAffected.length}`);
    console.log(`Total payments voided: ${totalVoided}`);
    console.log(`Duration: ${checkDuration}s`);
    
    return {
      success: true,
      totalChecked: policies.length,
      totalVoided,
      policiesAffected,
      duration: checkDuration
    };
    
  } catch (error) {
    console.error("❌ Error checking policies for overdue payments:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
