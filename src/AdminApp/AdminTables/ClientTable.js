// src/AdminApp/AdminTables/ClientTable.js
import { useEffect, useState } from "react";
import { fetchClients, archiveClient, updateClientNotifications } from "../AdminActions/ClientActions";
import ClientInfo from "../ClientInfo";
import { FaEdit, FaBell } from "react-icons/fa";
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
  
  // Notification modal state
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const filteredClients = clients.filter((client) =>
    (client.internal_id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadClientsData = async () => {
    const data = await fetchClients(agentId, false);
    setClients(data);
    setCurrentPage(1);
  };

  useEffect(() => {
    loadClientsData();
  }, [agentId]);

  const handleRowClick = (id) => setSelectedClientID(id);

  const handleArchiveClick = async (clientId) => {
    const confirmArchive = window.confirm("Proceed to archive this client?");
    if (!confirmArchive) return;

    try {
      await archiveClient(clientId);
      await loadClientsData();
    } catch (error) {
      console.error("Error archiving client:", error);
    }
  };

  const handleNotificationClick = (client) => {
    setSelectedClient(client);
    setSmsEnabled(client.notification_allowed_sms ?? true);
    setEmailEnabled(client.notification_allowed_email ?? true);
    setShowNotificationModal(true);
  };

  const handleSaveNotifications = async () => {
    if (!selectedClient) return;

    setSaving(true);
    try {
      await updateClientNotifications(selectedClient.uid, {
        notification_allowed_sms: smsEnabled,
        notification_allowed_email: emailEnabled,
      });
      
      alert("Notification preferences updated successfully!");
      await loadClientsData();
      setShowNotificationModal(false);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      alert("Failed to update notification preferences.");
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshOrViewAll = () => {
    setSearchTerm("");       
    setCurrentPage(1);       
    if (agentId) {
      onViewAllClients();    
    } else {
      loadClientsData();       
    }
  };

  const getHeaderCount = () => {
    if (agentId) {
      const selectedAgent = agentsWithClientCounts.find(agent => agent.id === agentId);
      return selectedAgent ? `(${selectedAgent.clientCount})` : `(${filteredClients.length})`;
    }
    return `(${allClientsCount})`;
  };

  // MODIFIED: Helper function to format address with Region and Zip Code
  const formatAddress = (client) => {
    const parts = [];
    
    // Part 1: Street Address
    if (client.address) {
      parts.push(client.address);
    }
    
    // Part 2: Barangay, City
    const line2Parts = [];
    if (client.barangay_address) line2Parts.push(client.barangay_address);
    if (client.city_address) line2Parts.push(client.city_address);
    if (line2Parts.length > 0) {
      parts.push(line2Parts.join(", "));
    }
    
    // Part 3: Province, Region, Zip Code
    const line3Parts = [];
    if (client.province_address) {
      line3Parts.push(client.province_address);
    }
    if (client.region_address) { // ADDED
      line3Parts.push(client.region_address);
    }
    if (client.zip_code) { // ADDED
      line3Parts.push(client.zip_code);
    }
    if (line3Parts.length > 0) {
      parts.push(line3Parts.join(", "));
    }
    
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentClients = filteredClients.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const clientName = selectedClient ? [
    selectedClient.prefix,
    selectedClient.first_Name,
    selectedClient.middle_Name ? selectedClient.middle_Name.charAt(0) + "." : "",
    selectedClient.family_Name,
    selectedClient.suffix,
  ].filter(Boolean).join(" ") : "";

  return (
    <>
      <div className="client-table-container">
        <div className="client-table-header">
          <h2>Active Clients {getHeaderCount()}</h2>

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
                  <th className="address-col">Address</th>
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
                      {/* MODIFIED: This now uses the updated function */}
                      <td>{formatAddress(client)}</td>
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
                          className={`notification-btn-client ${
                            !client.notification_allowed_sms && !client.notification_allowed_email
                              ? "notification-disabled"
                              : (client.notification_allowed_sms === false || client.notification_allowed_email === false)
                              ? "notification-partial"
                              : ""
                          }`}
                          title={
                            !client.notification_allowed_sms && !client.notification_allowed_email
                              ? "All notifications disabled"
                              : (client.notification_allowed_sms === false || client.notification_allowed_email === false)
                              ? "Some notifications disabled"
                              : "Notification preferences"
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(client);
                          }}
                        >
                          <FaBell /> Notifications
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

      {/* Notification Modal */}
      {showNotificationModal && selectedClient && (
        <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
          <div className="modal-content notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Notification Preferences</h2>
              <button className="modal-close-btn" onClick={() => setShowNotificationModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="client-info-box">
                <p><strong>Client:</strong> {clientName}</p>
                <p><strong>Client ID:</strong> {selectedClient.internal_id || "N/A"}</p>
                <p><strong>Phone:</strong> {selectedClient.phone_Number}</p>
                <p><strong>Email:</strong> {selectedClient.email}</p>
              </div>

              <div className="notification-settings">
                <div className="notification-item">
                  <div className="notification-info">
                    <span className="notif-icon"></span>
                    <div>
                      <h3>SMS Notifications</h3>
                      <p>Send policy updates and reminders via SMS</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={smsEnabled}
                      onChange={(e) => setSmsEnabled(e.target.checked)}
                      disabled={saving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <span className="notif-icon"></span>
                    <div>
                      <h3>Email Notifications</h3>
                      <p>Send policy updates and reminders via email</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={emailEnabled}
                      onChange={(e) => setEmailEnabled(e.target.checked)}
                      disabled={saving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              {!smsEnabled && !emailEnabled && (
                <div className="notification-warning">
                  Warning: Client will not receive any policy updates if both notifications are disabled.
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="modal-btn-secondary"
                onClick={() => setShowNotificationModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="modal-btn-primary"
                onClick={handleSaveNotifications}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ScrollToTopButton/>
    </>
  );
}