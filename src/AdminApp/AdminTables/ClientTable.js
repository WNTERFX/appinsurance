import { useEffect, useState } from "react";
import { fetchClients } from "../AdminActions/ClientActions";
import ClientInfo from "../ClientInfo"; 
import "../styles/client-table-styles.css";

export default function ClientTable() {
  const [clients, setClients] = useState([]);
  const [selectedClientID, setSelectedClientID] = useState(null);

  useEffect(() => {
    async function loadClients() {
      const data = await fetchClients();
      setClients(data);
    }
    loadClients();
  }, []);

  const handleRowClick = (id) => {
    console.log("Clicked client uid:", id); 
    console.log("Full client object:", clients.find(c => c.uid === id)); 
    setSelectedClientID(id); 
  };

  return (
    <>
      <div className="client-table">
        <table>
          <thead>
            <tr>
              <th>Client ID</th>
              <th>Client Name</th>
              <th>Agent</th>
              <th>Address</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {clients.length > 0 ? (
              clients.map((client) => (
                <tr
                  key={client.id}
                  className="clickable-row"
                  onClick={() => handleRowClick(client.uid)}
                >
                  <td>{client.id}</td>
                  <td>
                    {[client.prefix_Name, client.first_Name, client.middle_Name ? client.middle_Name.charAt(0) + "." : "", client.family_Name, client.suffix_Name]
                      .filter(Boolean)
                      .join(" ")}
                  </td>
                  <td>{client.employee?.personnel_Name || "Unknown"}</td>
                  <td>{client.address}</td>
                  <td>{client.phone_Number}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No clients found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
      <ClientInfo
        clientID={selectedClientID}
        onClose={() => setSelectedClientID(null)}
      />
    </>
  );
}
