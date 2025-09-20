import { useEffect, useState } from "react";
import { fetchClients, archiveClient } from "../AdminActions/ClientActions";
import ClientInfo from "../ClientInfo"; 
import { FaEdit } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import ScrollToTopButton from "../../ReusableComponents/ScrollToTop";
import "../styles/client-table-styles.css";


export default function ClientTable() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [selectedClientID, setSelectedClientID] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15); 
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter((client) =>
  client.uid.toString().includes(searchTerm)
  );


  useEffect(() => {
    async function loadClients() {
      const data = await fetchClients();
      setClients(data);
    }
    loadClients();
  }, []);

  const handleRowClick = (id) => setSelectedClientID(id);

  const handleEditClick = (client) => {
    navigate("/appinsurance/MainArea/Client/ClientEditForm", { state: { client } });
  };

  const handleArchiveClick = async (clientId) => {
    const confirmArchive = window.confirm("Proceed to archive this client?");
    if (!confirmArchive) return;

    try {
      await archiveClient(clientId);
      setClients((prev) => prev.filter((c) => c.uid !== clientId));
    } catch (error) {
      console.error("Error archiving client:", error);
    }
  };

    const loadClients = async () => {
      const data = await fetchClients();
      setClients(data);
    };

    useEffect(() => {
      loadClients();
    }, []);

    const handleReset = async () => {
      setSearchTerm("");
      setCurrentPage(1);
      await loadClients(); // re-fetch from Supabase
    };

  // 🔹 Pagination logic
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentClients = filteredClients.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // reset to first page
  };

  return (
    <>
      <div className="client-table-container">
       <div className="client-table-header">
          <h2>Active Clients</h2>

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

            {/* 🔹 Reset Button */}
            <button onClick={handleReset} className="reset-btn-client">
              Refresh
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

          {/* 🔹 Pagination Controls */}
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
         
      {/* Client Info Modal */}
      <ClientInfo
        clientID={selectedClientID}
        onClose={() => setSelectedClientID(null)}
      />
      <ScrollToTopButton/>
    </>
  );
}
