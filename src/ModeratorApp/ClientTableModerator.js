// ClientTableModerator.js
import { useEffect, useState } from "react";
import "./moderator-styles/client-table-styles.css";
import ClientInfo from "../AdminApp/ClientInfo";
import { fetchModeratorClients, getCurrentUser } from "./ModeratorActions/ModeratorClientActions";

export default function ClientTableModerator({ agentId }) {
  const [clients, setClients] = useState([]);
  const [selectedClientID, setSelectedClientID] = useState(null);

  useEffect(() => {
    async function loadClients() {
      let id = agentId;
      if (!id) {
        const user = await getCurrentUser();
        if (!user) return;
        id = user.id;
      }
      const data = await fetchModeratorClients(id);
      setClients(data || []);
    }
    loadClients();
  }, [agentId]);

  const handleRowClick = (id) => setSelectedClientID(id);

  return (
    <>
      <div className="client-table-container-moderator">
        <h2>Active Clients</h2>
        <div className="client-table-wrapper-moderator">
          <div className="client-table-scroll-moderator">
            <table>
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Client Name</th>
                  <th>Agent</th>
                  <th>Address</th>
                  <th>Phone Number</th>
                  <th>Email Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.length > 0 ? (
                  clients.map((client) => (
                    <tr key={client.uid} className="client-table-clickable-row-moderator" onClick={() => handleRowClick(client.uid)}>
                      <td>{client.uid}</td>
                      <td>
                        {[
                          client.prefix,
                          client.first_Name,
                          client.middle_Name ? client.middle_Name.charAt(0) + "." : "",
                          client.family_Name,
                          client.suffix,
                        ].filter(Boolean).join(" ")}
                      </td>
                      <td>{client.employee?.personnel_Name || "Unknown"}</td>
                      <td>{client.address}</td>
                      <td>{client.phone_Number}</td>
                      <td>{client.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No clients found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedClientID && <ClientInfo 
      clientID={selectedClientID} 
      onClose={() => setSelectedClientID(null)} />}
    </>
  );
}
