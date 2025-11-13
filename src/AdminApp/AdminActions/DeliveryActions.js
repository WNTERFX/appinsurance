// src/AdminActions/DeliveryActions.js
import { db } from "../../dbServer";

// ✅ Get current user's role and employee ID (using is_Admin boolean)
async function getCurrentUserRole() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    console.log("❌ No session found");
    return null;
  }

  const { data: { user } } = await db.auth.getUser();
  if (!user) {
    console.log("❌ No user found");
    return null;
  }

  console.log("✅ Auth User ID:", user.id);

  // Get employee record to check role - using id as foreign key to auth.users
  const { data: employee, error } = await db
    .from("employee_Accounts")
    .select("id, personnel_Name, is_Admin")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("❌ Error fetching employee role:", error.message);
    return null;
  }

  console.log("✅ Employee found:", {
    id: employee.id,
    name: employee.personnel_Name,
    isAdmin: employee.is_Admin
  });

  return {
    employeeId: employee.id,
    isAdmin: employee.is_Admin, // true = admin, false = moderator
    authId: user.id
  };
}

// ✅ Fetch deliveries with role-based filtering
export async function fetchDeliveries() {
  try {
    const userInfo = await getCurrentUserRole();
    if (!userInfo) {
      console.error("❌ User not authenticated");
      return [];
    }

    console.log("🔍 Fetching deliveries for:", {
      employeeId: userInfo.employeeId,
      isAdmin: userInfo.isAdmin
    });

    let query = db
      .from("delivery_Table")
      .select(`
        *,
        employee:employee_Accounts!delivery_Table_agent_id_fkey(personnel_Name),
        policy:policy_Table(
          id,
          policy_type,
          policy_inception,
          policy_expiry,
          client:clients_Table(
            uid,
            first_Name,
            middle_Name,
            family_Name,
            address,
            phone_Number
          )
        )
      `)
      .or("is_archived.is.null,is_archived.eq.false")
      .order('created_at', { ascending: false });

    // ✅ Filter deliveries by agent_id for moderators
    if (!userInfo.isAdmin) {
      console.log("🔒 Moderator filter applied - filtering by agent_id:", userInfo.employeeId);
      query = query.eq("agent_id", userInfo.employeeId);
    } else {
      console.log("🔓 Admin access - no agent filter applied");
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("❌ Error fetching deliveries:", error.message);
      return [];
    }

    console.log(`✅ Found ${data?.length || 0} deliveries`);
    
    // Transform the data to match what the UI expects
    return data.map(delivery => {
      const delivered = delivery.delivered_at
        ? new Date(delivery.delivered_at).toLocaleDateString()
        : null;

      const estimated = delivery.estimated_delivery_date
        ? new Date(delivery.estimated_delivery_date).toLocaleDateString()
        : "Not set";

      return {
        ...delivery,
        uid: delivery.id,
        policy_Id: delivery.policy_id,
        delivered_at: delivery.delivered_at,
        remarks: delivery.remarks || "",
        status: delivery.status || "Pending",
        policy_Holder: delivery.policy?.client 
          ? `${delivery.policy.client.first_Name || ''} ${delivery.policy.client.middle_Name || ''} ${delivery.policy.client.family_Name || ''}`.trim()
          : "Unknown",
        address: delivery.policy?.client?.address || "No address",
        phone_number: delivery.policy?.client?.phone_Number || "N/A",
        created_At: new Date(delivery.created_at).toLocaleDateString(),
        displayDate: delivered || estimated,
        proof_of_delivery: delivery.proof_of_delivery,
      };
    });
  } catch (err) {
    console.error("❌ Error in fetchDeliveries:", err);
    return [];
  }
}

// ✅ Cancel Delivery (only in Pending status)
export async function cancelDelivery(deliveryId) {
  const { data, error } = await db
    .from("delivery_Table")
    .update({
      is_archived: true,
      archival_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", deliveryId)
    .eq("status", "Pending")
    .select()
    .single();
  
  if (error) {
    console.error("Error canceling delivery:", error.message);
    throw error;
  }
  return data;
}

// ✅ Update Delivery (Edit button in Pending tab)
export async function updateDelivery(deliveryId, updateData) {
  const { data, error } = await db
    .from("delivery_Table")
    .update(updateData)
    .eq("id", deliveryId)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating delivery:", error.message);
    throw error;
  }
  return data;
}

// ✅ Mark as Scheduled (Move from Pending to Scheduled)
export async function markAsScheduled(deliveryId) {
  const { data, error } = await db
    .from("delivery_Table")
    .update({
      status: "Scheduled",
      scheduled_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", deliveryId)
    .select()
    .single();
  
  if (error) {
    console.error("Error marking as scheduled:", error.message);
    throw error;
  }
  return data;
}

// ✅ Mark as Out for Delivery (Move from Scheduled to Out for Delivery)
export async function markAsOutForDelivery(deliveryId) {
  const { data, error } = await db
    .from("delivery_Table")
    .update({
      status: "Out for Delivery",
      out_for_delivery_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", deliveryId)
    .select()
    .single();
  
  if (error) {
    console.error("Error marking as out for delivery:", error.message);
    throw error;
  }
  return data;
}

// ✅ Mark as Delivered with Multiple Proof Images
export async function markAsDelivered(deliveryId, proofImageFiles) {
  try {
    let proofPaths = [];

    // Upload all proof of delivery images if provided
    if (proofImageFiles && Array.isArray(proofImageFiles) && proofImageFiles.length > 0) {
      for (const file of proofImageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${deliveryId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await db.storage
          .from('delivery-proof')
          .upload(filePath, file);

        if (uploadError) {
          console.error("Error uploading proof:", uploadError.message);
          throw uploadError;
        }

        proofPaths.push(filePath);
      }
    }

    // Update delivery status with all image paths as JSON array
    const { data, error } = await db
      .from("delivery_Table")
      .update({
        status: "Delivered",
        delivered_at: new Date().toISOString().split("T")[0],
        proof_of_delivery: JSON.stringify(proofPaths), // Store as JSON array
      })
      .eq("id", deliveryId)
      .select()
      .single();
    
    if (error) {
      console.error("Error marking as delivered:", error.message);
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error in markAsDelivered:", error);
    throw error;
  }
}

// ✅ Mark as Rescheduled (Move from Out for Delivery to Rescheduled)
export async function markAsRescheduled(deliveryId) {
  const { data, error } = await db
    .from("delivery_Table")
    .update({
      status: "Rescheduled",
      rescheduled_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", deliveryId)
    .select()
    .single();
  
  if (error) {
    console.error("Error marking as rescheduled:", error.message);
    throw error;
  }
  return data;
}

// ✅ Reschedule Delivery (Edit in Rescheduled tab, then move back to Scheduled)
export async function rescheduleDelivery(deliveryId, newEstimatedDate, newAddress) {
  const updateData = {
    estimated_delivery_date: newEstimatedDate,
    status: "Scheduled",
    scheduled_date: new Date().toISOString().split("T")[0],
  };

  // Update address in policy's client table if provided
  if (newAddress) {
    updateData.address = newAddress;
  }

  const { data, error } = await db
    .from("delivery_Table")
    .update(updateData)
    .eq("id", deliveryId)
    .select()
    .single();
  
  if (error) {
    console.error("Error rescheduling delivery:", error.message);
    throw error;
  }
  return data;
}

// ✅ Archive Delivery (only for Delivered status)
export async function archiveDelivery(deliveryId) {
  const { data, error } = await db
    .from("delivery_Table")
    .update({
      is_archived: true,
      archival_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", deliveryId)
    .eq("status", "Delivered")
    .select()
    .single();
  
  if (error) {
    console.error("Error archiving delivery:", error.message);
    throw error;
  }
  return data;
}

// ✅ Get Proof of Delivery URLs (handle multiple images)
export async function getProofOfDeliveryURL(proofData) {
  if (!proofData) return null;

  try {
    // Parse if it's a JSON string
    let filePaths = [];
    if (typeof proofData === 'string') {
      try {
        filePaths = JSON.parse(proofData);
      } catch {
        // If it's not JSON, treat it as a single file path
        filePaths = [proofData];
      }
    } else if (Array.isArray(proofData)) {
      filePaths = proofData;
    } else {
      filePaths = [proofData];
    }

    // Get signed URLs for all images
    const urls = [];
    for (const filePath of filePaths) {
      const { data, error } = await db.storage
        .from('delivery-proof')
        .createSignedUrl(filePath, 3600); // URL valid for 1 hour

      if (error) {
        console.error("Error getting proof URL:", error.message);
        continue;
      }

      urls.push(data.signedUrl);
    }

    return urls.length > 0 ? urls : null;
  } catch (error) {
    console.error("Error in getProofOfDeliveryURL:", error);
    return null;
  }
}

// ✅ Delete Proof of Delivery (if needed)
export async function deleteProofOfDelivery(filePath) {
  if (!filePath) return;

  const { error } = await db.storage
    .from('delivery-proof')
    .remove([filePath]);

  if (error) {
    console.error("Error deleting proof:", error.message);
    throw error;
  }
}