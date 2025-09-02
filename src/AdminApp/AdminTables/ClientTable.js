import { useEffect, useState } from "react";
import { fetchClients } from "../AdminActions/ClientActions";
import InfoModal from "../InfoModal";
import "../styles/client-table-styles.css";

export default function ClientTable() {

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false); 
  const [clientToDelete, setClientToDelete] = useState(null); 

  const handleClick = (client) => {
    console.log("Row clicked, client:", client); // Debug log
    setSelectedClient(client); 
  };

  const handleClose = () => {
    console.log("Closing modal"); // Debug log
    setSelectedClient(null);
  };

  const handleDelete = async () => {
    if (clientToDelete) {
      try {
        setClients(clients.filter(client => client.id !== clientToDelete.id));
        setShowConfirm(false);
        setClientToDelete(null);
        console.log("Client deleted:", clientToDelete);
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  // Function to show delete confirmation
  const showDeleteConfirmation = (client, event) => {
    event.stopPropagation(); // Prevent row click
    setClientToDelete(client);
    setShowConfirm(true);
  };

  useEffect(() => {
    async function loadClients() {
      const clients = await fetchClients();
      setClients(clients);
    }
    loadClients();
  }, []);

  // Debug: Log when selectedClient changes
  useEffect(() => {
    console.log("Selected client changed:", selectedClient);
  }, [selectedClient]);

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
            <th>Vehicle Model</th>
            <th>Vehicle Type</th>
            <th>Client Status</th>
            <th>Client Registered</th>
            <th>Policy Exception</th>
            <th>Policy Expiration</th>
            <th>Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.length > 0 ? (
            clients.map((client) => (
              <tr
                key={client.id}
                onClick={() => handleClick(client)}
                className="clickable-row"
                style={{ cursor: 'pointer' }}
              >
                <td>{client.id}</td>
                <td>
                  {[client.prefix_Name, client.first_Name, client.middle_Name ? client.middle_Name.charAt(0) + "." : "", client.family_Name, client.suffix_Name]
                    .filter(Boolean)
                    .join(" ")}
                </td>
                <td>{client.employee?.personnel_Name || "Unknown"}</td>
                <td>{client.partner?.insurance_Name}</td>
                <td>{client.address}</td>
                <td>{client.phone_Number}</td>
                <td>{client.vehicle_Model}</td>
                <td>{client.vehicle?. vehicle_Type}</td>
                <td>{client.client_Status || "Active"}</td>
                <td>{client.client_Registered}</td>
                <td>{client.policy_Exception || "-------"}</td>
                <td>{client.policy_Expiration || "-------"}</td>
                <td>{client.remarks}</td>
                <td>
                  <button 
                    onClick={(e) => showDeleteConfirmation(client, e)}
                    className="delete-btn"
                    style={{ background: 'red', color: 'white', padding: '4px 8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="13">No clients found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Client Details Modal - Using InfoModal directly for now */}
      <InfoModal isOpen={!!selectedClient} onClose={handleClose} title="Client Details">
        {selectedClient && (
          <>
            <p><strong>ID:</strong> {selectedClient.id}</p>
            <p><strong>Name:</strong> {[
              selectedClient.prefix_Name, 
              selectedClient.first_Name, 
              selectedClient.middle_Name ? selectedClient.middle_Name.charAt(0) + "." : "", 
              selectedClient.family_Name, 
              selectedClient.suffix_Name
            ].filter(Boolean).join(" ")}</p>
            <p><strong>Address:</strong> {selectedClient.address}</p>
            <p><strong>Phone:</strong> {selectedClient.phone_Number}</p>
            <p><strong>Agent:</strong> {selectedClient.employee?.personnel_Name || "Unknown"}</p>
            <p><strong>Insurance Partner:</strong> {selectedClient.partner?.insurance_Name}</p>
            <p><strong>Vehicle Model:</strong> {selectedClient.vehicle_Model}</p>
            <p><strong>Client Status:</strong> {selectedClient.client_Status || "Active"}</p>
            <p><strong>Registered:</strong> {selectedClient.client_Registered}</p>
            <p><strong>Policy Exception:</strong> {selectedClient.policy_Exception || "-------"}</p>
            <p><strong>Policy Expiration:</strong> {selectedClient.policy_Expiration || "-------"}</p>
            <p><strong>Remarks:</strong> {selectedClient.remarks}</p>
          </>
        )}
      </InfoModal>

      {/* Modal for delete confirmation */}
      <InfoModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Delete">
        <p>Are you sure you want to delete this client?</p>
        {clientToDelete && (
          <p><strong>Client:</strong> {[
            clientToDelete.prefix_Name, 
            clientToDelete.first_Name, 
            clientToDelete.middle_Name ? clientToDelete.middle_Name.charAt(0) + "." : "", 
            clientToDelete.family_Name, 
            clientToDelete.suffix_Name
          ].filter(Boolean).join(" ")}</p>
        )}
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={handleDelete}
            style={{ background: 'red', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
          >
            Yes, Delete
          </button>
          <button 
            onClick={() => setShowConfirm(false)}
            style={{ background: 'gray', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </InfoModal>
    </div>
  );
}