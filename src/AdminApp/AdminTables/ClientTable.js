import { useEffect, useState } from "react";
import { fetchClients, archiveClient } from "../AdminActions/ClientActions";
import ClientInfo from "../ClientInfo"; 
import { FaEdit } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import "../styles/client-table-styles.css";

export default function ClientTable() {
  const navigate = useNavigate();

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
    setSelectedClientID(id); 
  };

  const handleEditClick = (client) => {
    navigate("/appinsurance/MainArea/Client/ClientEditForm", { state: { client } });
  };

  const handleArchiveClick = async (clientId) => {
    const confirmArchive = window.confirm(
      "Proceed to archive this client?"
    );
    if (!confirmArchive) return;

    try {
      await archiveClient(clientId); 
      setClients((prev) => prev.filter((c) => c.uid !== clientId)); // update list
    } catch (error) {
      console.error("Error archiving client:", error);
    }
  };

  return (
    <>
      <div className="client-table-container">
        <h2>Active Clients</h2>
        <div className="client-table-wrapper">
          <div className="client-table-scroll">
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
                    <tr
                      key={client.uid}
                      className="client-table-clickable-row"
                      onClick={() => handleRowClick(client.uid)}
                    >
                      <td>{client.uid}</td>
                      <td>
                        {[
                          client.prefix,
                          client.first_Name,
                          client.middle_Name ? client.middle_Name.charAt(0) + "." : "",
                          client.family_Name,
                          client.suffix,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </td>
                      <td>{client.employee?.personnel_Name || "Unknown"}</td>
                      <td>{client.address}</td>
                      <td>{client.phone_Number}</td>
                      <td>{client.email}</td>

                      <td className="client-table-actions">
                        <button
                          className="edit-btn-client"
                          title="Edit this client"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(client);
                          }}
                        >
                          <FaEdit /> Edit
                        </button>

                        <button
                          className="archive-btn-client"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveClick(client.uid);
                          }}
                        >
                          Archive
                        </button>
                      </td>
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
        </div>
      </div>

      {/* Client Info Modal */}
      <ClientInfo
        clientID={selectedClientID}
        onClose={() => setSelectedClientID(null)}
      />
    </>
  );

}
