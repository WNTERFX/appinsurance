import { db } from "../../dbServer";

// Fetch all employee roles
export const fetchAllEmployeeRoles = async () => {
  const { data, error } = await db
    .from("employee_roles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching employee roles:", error);
    throw new Error(error.message);
  }

  return data;
};

// Create a new employee role
export const createEmployeeRole = async (roleData) => {
  const { data, error } = await db
    .from("employee_roles")
    .insert([roleData])
    .select();

  if (error) {
    console.error("Error creating employee role:", error);
    throw new Error(error.message);
  }

  return data;
};

// Update an existing employee role
export const updateEmployeeRole = async (id, roleData) => {
  const { data, error } = await db
    .from("employee_roles")
    .update(roleData)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating employee role:", error);
    throw new Error(error.message);
  }

  return data;
};

// Delete an employee role
export const deleteEmployeeRole = async (id) => {
  const { data, error } = await db
    .from("employee_roles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting employee role:", error);
    throw new Error(error.message);
  }

  return data;
};