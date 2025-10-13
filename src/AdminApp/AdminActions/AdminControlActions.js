// calculationActions.js
import { db } from "../../dbServer";

/**
 * Fetch all calculations from the database
 * @returns {Promise<Array>} Array of calculation records
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
 * Create a new calculation record
 * @param {Object} calculationData - The calculation data to insert
 * @returns {Promise<Object>} The created calculation record
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
 * Update an existing calculation record
 * @param {number} id - The ID of the calculation to update
 * @param {Object} calculationData - The updated calculation data
 * @returns {Promise<Object>} The updated calculation record
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
 * Delete a calculation record
 * @param {number} id - The ID of the calculation to delete
 * @returns {Promise<void>}
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
 * @param {string} vehicleType - The vehicle type to search for
 * @returns {Promise<Object|null>} The calculation record or null
 */
export const fetchCalculationByVehicleType = async (vehicleType) => {
  try {
    const { data, error } = await db
      .from("calculation_Table")
      .select("*")
      .eq("vehicle_type", vehicleType)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error in fetchCalculationByVehicleType:", error);
    throw error;
  }
};

/**
 * Fetch calculation by ID
 * @param {number} id - The ID of the calculation
 * @returns {Promise<Object|null>} The calculation record or null
 */
export const fetchCalculationById = async (id) => {
  try {
    const { data, error } = await db
      .from("calculation_Table")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error in fetchCalculationById:", error);
    throw error;
  }
};