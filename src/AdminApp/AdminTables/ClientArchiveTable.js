import { useEffect, useState } from "react";
import { fetchArchivedClients, unarchiveClient, deleteClient } from "../AdminActions/ClientArchiveActions"; 
import ClientInfo from "../ClientInfo";
import "../styles/client-archive-table.css";

export default function ClientArchiveTable() {
  const [clients, setClients] = useState([]);
  const [selectedClientID, setSelectedClientID] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const loadClients = async () => {
    try {
      const data = await fetchArchivedClients();
      setClients(data);
    } catch (error) {
      console.error("Error loading archived clients:", error);
      setClients([]);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Filter clients by search query
  const filteredClients = clients.filter((client) => {
    const fullName = [
      client.prefix,
      client.first_Name,
      client.middle_Name ? client.middle_Name.charAt(0) + "." : "",
      client.family_Name,
      client.suffix
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      client.uid.toString().includes(searchQuery)
    );
  });

  // Pagination
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentClients = filteredClients.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

  const handleRowClick = (client) => {
    setSelectedClientID(client.uid);
  };

  const handleUnarchiveClick = async (clientId) => {
    const confirmUnarchive = window.confirm("Proceed to unarchive this client?");
    if (!confirmUnarchive) return;

    try {
      await unarchiveClient(clientId);
      setClients((prev) => prev.filter((c) => c.uid !== clientId));
    } catch (error) {
      console.error("Error unarchiving client:", error);
    }
  };

   const handleDelete = async (clientId) => {
      const confirmDelete = window.confirm(
        "This will permanently delete the client, this should only be done when needed. Continue?"
      );
      if (!confirmDelete) return;
  
      try {
        await deleteClient(clientId);
        setClients((prev) => prev.filter((c) => c.uid !== clientId));
      } catch (err) {
        console.error("Error deleting client:", err.message);
      }
    };
  

  return (
    <div className="client-archive-table-container">
      {/* Header */}
      <div className="client-archive-table-header">
        <h2>Archived Clients</h2>
        <div className="client-archive-header-controls">
          <input
            type="text"
            className="client-archive-search-input"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // reset to first page
            }}
          />
          <button className="reset-btn-archive" onClick={loadClients}>
            Refresh
          </button>
          <div className="rows-per-page-inline">
            <label>Rows per page:</label>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
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
              {currentClients.length > 0 ? (
                currentClients.map((client) => (
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnarchiveClick(client.uid);
                        }}
                      >
                        Unarchive
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(client.uid);
                        }}
                      >
                        Delete
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

      {/* Pagination */}
      <div className="pagination-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* Modal */}
      <ClientInfo
        clientID={selectedClientID}
        onClose={() => setSelectedClientID(null)}
      />
    </div>
  );
}
