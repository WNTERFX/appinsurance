import { db } from "../../dbServer";

/* =============================
   CALCULATION TABLE ACTIONS
   ============================= */

/**
 * Fetch all calculations
 */
export const fetchAllCalculations = async () => {
  try {
    const { data, error } = await db
      .from("calculation_Table")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error in fetchAllCalculations:", error);
    throw error;
  }
};

/**
 * Create a new calculation
 */
export const createCalculation = async (calculationData) => {
  try {
    const { data, error } = await db
      .from("calculation_Table")
      .insert([calculationData])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error in createCalculation:", error);
    throw error;
  }
};

/**
 * Update a calculation
 */
export const updateCalculation = async (id, calculationData) => {
  try {
    const { data, error } = await db
      .from("calculation_Table")
      .update(calculationData)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error in updateCalculation:", error);
    throw error;
  }
};

/**
 * Delete a calculation
 */
export const deleteCalculation = async (id) => {
  try {
    const { error } = await db
      .from("calculation_Table")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error in deleteCalculation:", error);
    throw error;
  }
};

/**
 * Fetch calculation by vehicle type
 */
export const fetchCalculationByVehicleType = async (vehicleType) => {
  try {
    const { data, error } = await db
      .from("calculation_Table")
      .select("*")
      .eq("vehicle_type", vehicleType)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error in fetchCalculationByVehicleType:", error);
    throw error;
  }
};

/**
 * Fetch calculation by ID
 */
export const fetchCalculationById = async (id) => {
  try {
    const { data, error } = await db
      .from("calculation_Table")
      .select("*")
      .eq("id", id)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error in fetchCalculationById:", error);
    throw error;
  }
};

/* =============================
   MESSAGE TABLE ACTIONS
   ============================= */

/**
 * Fetch all messages
 */
export const fetchAllMessages = async () => {
  try {
    const { data, error } = await db
      .from("message_table")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

/**
 * Create a new message
 */
export const createMessage = async (messageData) => {
  try {
    const { data, error } = await db
      .from("message_table")
      .insert([messageData])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
};

/**
 * Update an existing message
 */
export const updateMessage = async (id, messageData) => {
  try {
    const { data, error } = await db
      .from("message_table")
      .update(messageData)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error updating message:", error);
    throw error;
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (id) => {
  try {
    const { error } = await db
      .from("message_table")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

/**
 * Fetch message by ID
 */
export const fetchMessageById = async (id) => {
  try {
    const { data, error } = await db
      .from("message_table")
      .select("*")
      .eq("id", id)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error in fetchMessageById:", error);
    throw error;
  }
};

export const fetchAllInsurancePartners = async () => {
  try {
    const { data, error } = await db
      .from("insurance_Partners")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching insurance partners:", error);
    throw error;
  }
};

/**
 * Create a new insurance partner
 */
export const createInsurancePartner = async (partnerData) => {
  try {
    const { data, error } = await db
      .from("insurance_Partners")
      .insert([partnerData])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error creating insurance partners:", error);
    throw error;
  }
};

export const updateInsurancePartner = async (id, partnerData) => {
  try {
    const { data, error } = await db
      .from("insurance_Partners")
      .update(partnerData)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error updating insurance partner:", error);
    throw error;
  }
};

/**
 * Delete an insurance partner
 */
export const deleteInsurancePartner = async (id) => {
  try {
    const { error } = await db
      .from("insurance_Partners")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting insurance partner:", error);
    throw error;
  }
};