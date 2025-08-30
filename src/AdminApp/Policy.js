import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ClientTable from "./AdminTables/ClientTable";
import Filter from "./Filter";
import {fetchClients} from "./AdminActions/ClientActions";


export default function Policy() {
const navigate = useNavigate();
  
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

      <div className="policy-data-field">
        <div className="control-options">
          <button className="approve-btn-policy">Approve</button>
          <button className="print-btn-policy">Print</button>
        </div>

      
        <ClientTable clients={clients} />
      </div>

      <div className="Policy-content">
        <div className="button-grid">
          <button
            className="policy-btn"
            onClick={() =>
              navigate("/appinsurance/MainArea/Policy/PolicyNewClient")
            }
          >
            Create new
          </button>
          <button
            className="policy-btn"
            onClick={() =>
              navigate("/appinsurance/MainArea/Policy/ListClient")
            }
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}