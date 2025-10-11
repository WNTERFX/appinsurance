import { db } from "../../dbServer";

// ================================
// 1. Update an existing policy
// ================================
export async function updatePolicy(policyId, updateData) {
  try {
    const { data, error } = await db
      .from("policy_Table")
      .update(updateData)
      .eq("id", policyId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error updating policy data:", error.message);
    return { success: false, error: error.message };
  }
}

// ================================
// 2. Update an existing computation linked to a policy
// ================================
export async function updateComputation(policyId, updateData) {
  try {
    // Map any lowercase keys to the correct casing
    const normalizedData = {};
    const keyMapping = {
      'original_value': 'original_Value',
      'current_value': 'current_Value',
      'total_premium': 'total_Premium',
      'aon_cost': 'aon_Cost',
      'vehicle_rate_value': 'vehicle_Rate_Value',
      'commission_fee': 'commission_fee'
    };

    Object.keys(updateData).forEach(key => {
      const normalizedKey = keyMapping[key.toLowerCase()] || key;
      normalizedData[normalizedKey] = updateData[key];
    });

    const { data, error } = await db
      .from("policy_Computation_Table")
      .update(normalizedData)
      .eq("policy_id", policyId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error updating computation data:", error.message);
    return { success: false, error: error.message };
  }
}

// ================================
// 3. Update an existing vehicle
// ================================
export async function updateVehicle(vehicleId, updateData) {
  try {
    // Validate that updateData only contains vehicle table columns
    const validVehicleColumns = [
      'vehicle_color',
      'vehicle_name',
      'plate_num',
      'vin_num',
      'policy_id',
      'vehicle_year',
      'vehicle_type_id',
      'vehicle_maker',
      'engine_serial_no'
    ];

    // Filter out any non-vehicle columns
    const cleanedData = {};
    Object.keys(updateData).forEach(key => {
      if (validVehicleColumns.includes(key)) {
        cleanedData[key] = updateData[key];
      } else {
        console.warn(`Skipping invalid vehicle column: ${key}`);
      }
    });

    if (Object.keys(cleanedData).length === 0) {
      return { 
        success: false, 
        error: "No valid vehicle columns to update" 
      };
    }

    const { data, error } = await db
      .from("vehicle_table")
      .update(cleanedData)
      .eq("id", vehicleId)
      .select();

    if (error) throw error;
    console.log("Vehicle updated:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error updating vehicle data:", error.message);
    return { success: false, error: error.message };
  }
}

// ================================
// 4. Fetch clients
// ================================
export async function fetchClients() {
  const { data, error } = await db
    .from("clients_Table")
    .select("uid, prefix, first_Name, middle_Name, family_Name, suffix");

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
  return data;
}

// ================================
// 5. Fetch insurance partners
// ================================
export async function fetchPartners() {
  const { data, error } = await db
    .from("insurance_Partners")
    .select("id, insurance_Name");

  if (error) {
    console.error("Error fetching partners:", error);
    return [];
  }
  return data;
}

// ================================
// 6. Fetch policy by ID
// ================================
export async function fetchPolicyById(policyId) {
  const { data, error } = await db
    .from("policy_Table")
    .select("*")
    .eq("id", policyId)
    .single();

  if (error) {
    console.error("Error fetching policy:", error);
    return null;
  }
  return data;
}

// ================================
// 7. Fetch vehicle by policy ID
// ================================
export async function fetchVehicleByPolicyId(policyId) {
  const { data, error } = await db
    .from("vehicle_table")
    .select("*")
    .eq("policy_id", policyId)
    .single();

  if (error) {
    console.error("Error fetching vehicle:", error);
    return null;
  }
  return data;
}

// ================================
// 8. Fetch computation by policy ID
// ================================
export async function fetchComputationByPolicyId(policyId) {
  try {
    // Get the computation data first
    const { data: computation, error: compError } = await db
      .from("policy_Computation_Table")
      .select("*")
      .eq("policy_id", policyId)
      .single();

    if (compError) {
      console.error("Error fetching computation:", compError);
      return null;
    }

    if (!computation) {
      console.log("No computation found for policy_id:", policyId);
      return null;
    }

    // Log the raw computation data to debug
    console.log("Raw computation data:", computation);

    // Try Method 1: If there's a direct calculation_id reference
    if (computation && computation.calculation_id) {
      const { data: calculation, error: calcError } = await db
        .from("calculation_Table")
        .select("*")
        .eq("id", computation.calculation_id)
        .single();

      if (!calcError && calculation) {
        console.log("Method 1: Found vehicle_type via calculation_id:", calculation.vehicle_type);
        return {
          ...computation,
          vehicle_type: calculation.vehicle_type,
          vat_Tax: calculation.vat_Tax,
          bodily_Injury: calculation.bodily_Injury,
          property_Damage: calculation.property_Damage,
          vehicle_Rate: calculation.vehicle_Rate,
          personal_Accident: calculation.personal_Accident,
          docu_Stamp: calculation.docu_Stamp,
          aon_Rate: calculation.aon,
          local_Gov_Tax: calculation.local_Gov_Tax
        };
      }
    }

    // Try Method 2: Get vehicle_type from vehicle_table
    const { data: vehicle, error: vehicleError } = await db
      .from("vehicle_table")
      .select("vehicle_type_id")
      .eq("policy_id", policyId)
      .single();

    if (!vehicleError && vehicle && vehicle.vehicle_type_id) {
      const { data: calculation, error: calcError } = await db
        .from("calculation_Table")
        .select("*")
        .eq("id", vehicle.vehicle_type_id)
        .single();

      if (!calcError && calculation) {
        console.log("Method 2: Found vehicle_type via vehicle_type_id:", calculation.vehicle_type);
        return {
          ...computation,
          vehicle_type: calculation.vehicle_type,
          vat_Tax: calculation.vat_Tax,
          bodily_Injury: calculation.bodily_Injury,
          property_Damage: calculation.property_Damage,
          vehicle_Rate: calculation.vehicle_Rate,
          personal_Accident: calculation.personal_Accident,
          docu_Stamp: calculation.docu_Stamp,
          aon_Rate: calculation.aon,
          local_Gov_Tax: calculation.local_Gov_Tax
        };
      }
    }

    // Try Method 3: Match by rates (as fallback)
    const { data: allCalculations, error: allCalcError } = await db
      .from("calculation_Table")
      .select("*");

    if (!allCalcError && allCalculations) {
      const matchingCalc = allCalculations.find(calc => 
        Math.abs(calc.vehicle_Rate - (computation.vehicle_Rate || 0)) < 0.001 &&
        Math.abs(calc.vat_Tax - (computation.vat_Tax || 0)) < 0.001 &&
        Math.abs(calc.bodily_Injury - (computation.bodily_Injury || 0)) < 0.001
      );

      if (matchingCalc) {
        console.log("Method 3: Found vehicle_type by matching rates:", matchingCalc.vehicle_type);
        return {
          ...computation,
          vehicle_type: matchingCalc.vehicle_type,
          vat_Tax: matchingCalc.vat_Tax,
          bodily_Injury: matchingCalc.bodily_Injury,
          property_Damage: matchingCalc.property_Damage,
          vehicle_Rate: matchingCalc.vehicle_Rate,
          personal_Accident: matchingCalc.personal_Accident,
          docu_Stamp: matchingCalc.docu_Stamp,
          aon_Rate: matchingCalc.aon,
          local_Gov_Tax: matchingCalc.local_Gov_Tax
        };
      }
    }

    console.log("All methods failed - returning computation without vehicle_type");
    return computation;

  } catch (err) {
    console.error("Error in fetchComputationByPolicyId:", err.message);
    return null;
  }
}

// ================================
// 9. Fetch calculation by vehicle type
// ================================
export async function fetchCalculationByVehicleType(vehicleType) {
  try {
    const { data, error } = await db
      .from("calculation_Table")
      .select("*")
      .eq("vehicle_type", vehicleType)
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error("Error fetching calculation:", err.message);
    return null;
  }
}

// ================================
// 10. Helper: Separate update data for vehicle and computation
// ================================
export function separateUpdateData(updateData) {
  const vehicleFields = [
    'vehicle_color',
    'vehicle_name', 
    'plate_num',
    'vin_num',
    'policy_id',
    'vehicle_year',
    'vehicle_type_id',
    'vehicle_maker',
    'engine_serial_no'
  ];
  
  const computationFields = [
    'original_Value',
    'current_Value',
    'total_Premium',
    'aon_Cost',
    'vehicle_Rate_Value',
    'commission_fee'
  ];
  
  const vehicleData = {};
  const computationData = {};
  const unknownData = {};
  
  Object.keys(updateData).forEach(key => {
    if (vehicleFields.includes(key)) {
      vehicleData[key] = updateData[key];
    } else if (computationFields.includes(key)) {
      computationData[key] = updateData[key];
    } else {
      // Check case-insensitive
      const lowerKey = key.toLowerCase();
      const computationMatch = computationFields.find(f => f.toLowerCase() === lowerKey);
      if (computationMatch) {
        computationData[computationMatch] = updateData[key];
      } else {
        unknownData[key] = updateData[key];
      }
    }
  });
  
  return { vehicleData, computationData, unknownData };
}