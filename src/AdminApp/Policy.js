import { useNavigate } from "react-router-dom";
import { useEffect, useState , useRef } from "react";
import PolicyTable from "./AdminTables/PolicyTable";
import  DropdownAccounts  from './DropDownAccounts'
import {fetchClients} from "./AdminActions/ClientActions";
import ClientModal from "./ClientInfo";
import { FaPlus, FaArchive, FaUser } from "react-icons/fa";
import { FaUserCircle , FaMoon, FaSignOutAlt } from "react-icons/fa";

export default function Policy() {
const navigate = useNavigate();

 const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);




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
        <p className="policy-title">Policy</p>
        <input
          type="text"
          className="policy-search"
          placeholder="Search clients..."
        />

        
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
             <div className="profile-menu">
                    <button
                      ref={buttonRef}
                      className="profile-button"
                      onClick={() => setOpen((s) => !s)}
                      aria-haspopup="true"
                      aria-expanded={open}
                    >
                        <span className="profile-name">Admin</span>
                      <FaUserCircle className="profile-icon" />
                      
                    </button>
            
                    <div>
                     <DropdownAccounts 
                       open={open}
                       onClose={() => setOpen(false)}
                       onDarkMode={() => console.log("Dark Mode toggled")}
                       />
                    </div>          
                    </div>
                </div>
              </div>
                  
      <div className="policy-data-field">
        <div className="control-options">
          <button className="approve-btn-policy">Approve</button>
          <button className="print-btn-policy">Print</button>
        </div>

      
        <PolicyTable clients={clients} onSelectClient={setSelectedClient} />
        <ClientModal client={selectedClient} onClose={() => setSelectedClient(null)} />
      </div>

      
    </div>
  );
}