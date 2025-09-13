import { useEffect, useState } from "react";
import { fetchArchivedClients, unarchiveClient} from "../AdminActions/ClientArchiveActions"; 
import ClientInfo from "../ClientInfo";
import "../styles/client-archive-table.css";

export default function ClientArchiveTable() {
  const [clients, setClients] = useState([]);
  const [selectedClientID, setSelectedClientID] = useState(null);

  useEffect(() => {
    async function loadClients() {
      try {
        const data = await fetchArchivedClients(); // custom function for archived
        setClients(data);
      } catch (error) {
        console.error("Error loading archived clients:", error);
        setClients([]);
      }
    }
    loadClients();
  }, []);

  const handleRowClick = (client) => {
    console.log("Clicked client:", client.uid);
    setSelectedClientID(client.uid);
  };

  const handleUnarchiveClick = async (clientId) => {
  const confirmUnarchive = window.confirm(
    "Proceed to unarchive this client?"
  );
  if (!confirmUnarchive) return;

  try {
    await unarchiveClient(clientId);
    setClients((prev) => prev.filter((c) => c.uid !== clientId)); 
  } catch (error) {
    console.error("Error unarchiving client:", error);
  }
};

  return (
    <div className="client-archive-table-container">
      <h2>Archived Clients</h2>
      <div className="client-archive-table-wrapper">
        <div className="client-archive-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Client ID</th>
                <th>Client Name</th>
                <th>Agent</th>
                <th>Address</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Archival Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <tr
                    key={client.uid}
                    className="client-archive-table-clickable-row"
                    onClick={() => handleRowClick(client)}
                  >
                    <td>{client.uid}</td>
                    <td>
                      {[client.prefix, client.first_Name, client.middle_Name ? client.middle_Name.charAt(0) + "." : "", client.family_Name, client.suffix]
                        .filter(Boolean)
                        .join(" ")}
                    </td>
                    <td>{client.employee?.personnel_Name || "Unknown"}</td>
                    <td>{client.address}</td>
                    <td>{client.phone_Number}</td>
                    <td>{client.email}</td>
                    <td>{client.archival_date || "N/A"}</td>
                    <td className="client-archive-table-actions">
                        <button>Edit</button>
                        <button
                            onClick={(e) => {
                            e.stopPropagation(); // prevent row click event
                            handleUnarchiveClick(client.uid);
                            }}
                        >
                            Unarchive
                        </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No archived clients found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ClientInfo
        clientID={selectedClientID}
        onClose={() => setSelectedClientID(null)}
      />
    </div>
  );
}
