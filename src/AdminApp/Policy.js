import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ClientTable from "./AdminTables/ClientTable";
import Filter from "./Filter";
import {fetchClients} from "./AdminActions/ClientActions";
import ClientModal from "./ClientInfo";
import { FaPlus, FaArchive, FaUser } from "react-icons/fa";


export default function Policy() {
const navigate = useNavigate();

  const [selectedClient, setSelectedClient] = useState(null);
  
  const [clients, setClients] = useState([]);

  
  useEffect(() => {
    async function loadClients() {
      const data = await fetchClients();
      setClients(data);
    }
    loadClients();
  }, []);

  return (
    <div className="Policy-container">
      <div className="Policy-header">
        <div className="right-actions">
        <p2>Policy</p2>
        <input
          type="text"
          className="policy-search"
          placeholder="Search clients..."
        />

        <div className="filter-client-policy">
          <Filter />
        </div>
      </div>
      <div className="left-actions">
        <button className="btn btn-create" onClick={() =>
              navigate("/appinsurance/MainArea/Policy/PolicyNewClient")
            }
>
        <FaPlus className="btn-icon" /> Create
         </button>
                      
          <button className="btn btn-archive">
          <FaArchive className="btn-icon" /> View Archive
          </button>
                      
      </div>
      </div>
                  
      <div className="policy-data-field">
        <div className="control-options">
          <button className="approve-btn-policy">Approve</button>
          <button className="print-btn-policy">Print</button>
        </div>

      
        <ClientTable clients={clients} onSelectClient={setSelectedClient} />
        <ClientModal client={selectedClient} onClose={() => setSelectedClient(null)} />
      </div>

      
    </div>
  );
}