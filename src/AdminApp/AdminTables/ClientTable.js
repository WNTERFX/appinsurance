import { useEffect, useState } from "react";
import { fetchClients } from "../AdminActions/ClientActions";
import "../styles/client-table-styles.css";

export default function ClientTable() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    async function loadClients() {
      const data = await fetchClients();
      setClients(data);
    }
    loadClients();
  }, []);

  const handleClick = (client) => {
    alert(`Row clicked! Client: ${client.client_Name}`);
    // here you can later open an overlay with client details
  };

  return (
    <div className="client-table">
      <table>
        <thead>
          <tr>
            <th>Client ID</th>
            <th>Client Name</th>
            <th>Agent</th>
            <th>Insurance Partner</th>
            <th>Address</th>
            <th>Phone Number</th>
            <th>Vehicle</th>
            <th>Client Status</th>
            <th>Client Registered</th>
            <th>Policy Exception</th>
            <th>Policy Expiration</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {clients.length > 0 ? (
            clients.map((client) => (
              <tr
                key={client.id}
                onClick={() => handleClick(client)}
                style={{ cursor: "pointer" }}
              >
                <td>{client.id}</td>
                <td>{client.client_Name}</td>
                <td>{client.agent_Id}</td>
                <td>{client.insurance_Id}</td>
                <td>{client.address}</td>
                <td>{client.phone_Number}</td>
                <td>{client.vehicle_Model}</td>
                <td>{client.client_Status || "Active"}</td>
                <td>{client.client_Registered}</td>
                <td>{client.policy_Exception || "-------"}</td>
                <td>{client.policy_Expiration || "-------"}</td>
                <td>{client.remarks}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12">No clients found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
