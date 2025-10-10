// src/AdminApp/AdminTables/ClientTable.js
import { useEffect, useState } from "react";
import { fetchClients, archiveClient } from "../AdminActions/ClientActions";
import ClientInfo from "../ClientInfo";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ScrollToTopButton from "../../ReusableComponents/ScrollToTop";
import "../styles/client-table-styles.css";


export default function ClientTable({ agentId, allClientsCount, agentsWithClientCounts, onViewAllClients, onEditClient }) {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [selectedClientID, setSelectedClientID] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");


  const filteredClients = clients.filter((client) =>
    (client.internal_id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadClientsData = async () => {
    const data = await fetchClients(agentId, false);
    setClients(data || []);
    setCurrentPage(1);
  };

  useEffect(() => {
    loadClientsData();
  }, [agentId]); // Reload clients when agentId changes


  const handleRowClick = (id) => setSelectedClientID(id);

  const handleArchiveClick = async (clientId) => {
    const confirmArchive = window.confirm("Proceed to archive this client?");
    if (!confirmArchive) return;

    try {
      await archiveClient(clientId);
      await loadClientsData(); // Reload data to reflect the change
    } catch (error) {
      console.error("Error archiving client:", error);
    }
  };

  const handleRefreshOrViewAll = () => {
    if (agentId) {
      onViewAllClients();
    } else {
      setSearchTerm("");
      loadClientsData();
    }
    setCurrentPage(1);
  };

  // Determine the count to show in the header
  const getHeaderCount = () => {
    if (agentId) {
      // Find the selected agent's client count
      const selectedAgent = agentsWithClientCounts.find(agent => agent.id === agentId);
      return selectedAgent ? `(${selectedAgent.clientCount})` : `(${filteredClients.length})`;
    }
    // If no agentId, show the total count of all active clients
    return `(${allClientsCount})`;
  };


  // 🔹 Pagination logic
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentClients = filteredClients.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <>
      <div className="client-table-container">
        <div className="client-table-header">
          <h2>
            Active Clients {getHeaderCount()} {/* Updated to use getHeaderCount() */}
          </h2>

          <div className="client-header-controls">
            <input
              type="text"
              placeholder="Search by ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="client-search-input"
            />

            <div className="rows-per-page-inline">
              <label htmlFor="rowsPerPage">Results:</label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <button onClick={handleRefreshOrViewAll} className="reset-btn-client">
              {agentId ? "View All" : "Refresh"}
            </button>
          </div>
        </div>

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
                {currentClients.length > 0 ? (
                  currentClients.map((client) => (
                    <tr
                      key={client.uid}
                      className="client-table-clickable-row"
                      onClick={() => handleRowClick(client.uid)}
                    >
                      <td>{client.internal_id || "N/A"}</td>
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
                            if(client){
                              onEditClient(client);
                            }
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

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>

      <ClientInfo
        clientID={selectedClientID}
        onClose={() => setSelectedClientID(null)}
      />
      <ScrollToTopButton/>
    </>
  );
}