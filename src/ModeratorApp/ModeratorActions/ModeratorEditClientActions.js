import { db } from "../../dbServer";

export async function editClientModerator (clientId, updatePrefix, updateFirst, updateMiddle, updateFamily,updateSuffix, updateAddress, updatePhoneNum, updateEmail) {

    const {data, error} = await db 
    .from("clients_Table")
    .update({ 
      prefix : updatePrefix,
      first_Name: updateFirst,
      middle_Name: updateMiddle,
      family_Name: updateFamily,
      suffix: updateSuffix,
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
