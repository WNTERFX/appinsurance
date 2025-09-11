import { useEffect, useState } from "react";
import { fetchClients } from "../AdminActions/ClientActions";
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
              <th>Action</th>
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
                    {[client.prefix, client.first_Name, client.middle_Name ? client.middle_Name.charAt(0) + "." : "", client.family_Name]
                      .filter(Boolean)
                      .join(" ")}
                  </td>
                  <td>{client.employee?.personnel_Name || "Unknown"}</td>
                  <td>{client.address}</td>
                  <td>{client.phone_Number}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={(e) => { 
                        e.stopPropagation(); // prevent row click
                        handleEditClick(client); //open ClientEditForm
                      }}
                    >
                      <FaEdit />
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

      {/* ClientInfo table */}
      <ClientInfo
        clientID={selectedClientID}
        onClose={() => setSelectedClientID(null)}
      />
    </>
  );
}
