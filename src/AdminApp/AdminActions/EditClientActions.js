import { db } from "../../dbServer";

export async function editClient (clientId, updatePrefix, updateFirst, updateMiddle, updateFamily, updateAddress, updatePhoneNum, updateEmail) {

    const {data, error} = await db 
    .from("clients_Table")
    .update({ 
      prefix : updatePrefix,
      first_Name: updateFirst,
      middle_Name: updateMiddle,
      family_Name: updateFamily,
      address: updateAddress,
      phone_Number: updatePhoneNum,
      email: updateEmail
    })
    .eq("uid", clientId)


  if (error) {
    console.error("Error updating client:", error.message);
    return [];
  }
  return data;
}


export async function fetchClients() {
  const { data, error } = await db
    .from("clients_Table")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching clients:", error.message);
    return [];
  }
  return data;
}
