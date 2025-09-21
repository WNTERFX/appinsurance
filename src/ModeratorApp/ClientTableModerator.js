import { useEffect, useState } from "react";
import "./moderator-styles/client-table-styles.css";
import ClientInfo from "../AdminApp/ClientInfo";
import { fetchModeratorClients, getCurrentUser } from "./ModeratorActions/ModeratorClientActions";
import { FaEdit } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import ScrollToTopButton from "../ReusableComponents/ScrollToTop";

export default function ClientTableModerator({ agentId , onEditClient }) {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [selectedClientID, setSelectedClientID] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15); 
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Load clients (always respect agentId)
  const loadClients = async () => {
    let id = agentId;
    if (!id) {
      const user = await getCurrentUser();
      if (!user) return;
      id = user.id;
    }
    const data = await fetchModeratorClients(id);
    setClients(data || []);
  };

  // ✅ Run once on mount & when agentId changes
  useEffect(() => {
    loadClients();
  }, [agentId]);

  const handleRowClick = (id) => setSelectedClientID(id);

  const handleReset = async () => {
    setSearchTerm("");
    setCurrentPage(1);
    await loadClients(); // ✅ proper reload with agentId
  };

  // 🔹 Pagination logic
  const filteredClients = clients.filter((client) =>
    client.uid.toString().includes(searchTerm)
  );

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
      <div className="client-table-container-moderator">
        <div className="client-table-header-moderator">
          <h2>Active Clients</h2>

          <div className="client-header-controls-moderator">
            <input
              type="text"
              placeholder="Search by ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="client-search-input-moderator"
            />

            <div className="rows-per-page-inline-moderator">
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

            {/* 🔹 Reset Button */}
            <button onClick={handleReset} className="reset-btn-client-moderator">
              Refresh
            </button>
          </div>
        </div>

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
                {currentClients.length > 0 ? (
                  currentClients.map((client) => (
                    <tr
                      key={client.uid}
                      className="client-table-clickable-row-moderator"
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
                      <td className="client-table-actions-moderator">
                        <button
                          className="edit-btn-client-moderator"
                          title="Edit this client"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditClient(client);
                          }}
                        >
                          <FaEdit /> Edit
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

        {/* 🔹 Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-controls-moderator">
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

      {/* Client Info Modal */}
      <ClientInfo
        clientID={selectedClientID}
        onClose={() => setSelectedClientID(null)}
      />
      <ScrollToTopButton />
    </>
  );
}
