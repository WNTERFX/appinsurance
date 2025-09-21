import { useNavigate } from "react-router-dom";
import ClientTableModerator from "./ClientTableModerator";
import './moderator-styles/policy-styles-moderator.css';
import DropdownAccountsModerator from "./DropDownAccountsModerator";
import { FaPlus, FaArchive, FaUserCircle } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import PolicyTableModerator from "./ModeratorTables/PolicyTableModerator";
import ClientModal from "../AdminApp/ClientInfo";
import PolicyArchiveTable from "../AdminApp/AdminTables/PolicyArchiveTable";
export default function PolicyModerator() {

    const navigate = useNavigate();
     const [selectedClient, setSelectedClient] = useState(null);
      const [showArchive, setShowArchive] = useState(false); // toggle state
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
     const [clients, setClients] = useState([]);

    // dropdown close
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

    return(
     <div className="Policy-container-moderator">
       <div className="Policy-header-moderator">
         <div className="right-actions-moderator">
           <p className="policy-title-moderator">
             {showArchive ? "Policy Archive" : "Policy"}
           </p>
         </div>
         <div className="left-actions-moderator">
           <button
             className="btn btn-create-moderator"
             onClick={() =>
               navigate("/appinsurance/MainAreaModerator/PolicyModerator/ModeratorPolicyNewClienForm")
             }
           >
             <FaPlus className="btn-icon-moderator" /> Create
           </button>
 
           <button
             className="btn btn-archive-moderator"
             onClick={() => setShowArchive((prev) => !prev)} // toggle
           >
             <FaArchive className="btn-icon-moderator" />{" "}
             {showArchive ? "Back to Policies" : "View Archive"}
           </button>
 
           <div className="profile-menu-moderator">
             <button
               ref={buttonRef}
               className="profile-button-moderator"
               onClick={() => setOpen((s) => !s)}
               aria-haspopup="true"
               aria-expanded={open}
             >
               <span className="profile-name-moderator">Agent:?</span>
               <FaUserCircle className="profile-icon-moderator" />
             </button>
 
             <div>
               <DropdownAccountsModerator
                 open={open}
                 onClose={() => setOpen(false)}
                 onDarkMode={() => console.log("Dark Mode toggled")}
               />
             </div>
           </div>
         </div>
       </div>
 
      <div className="policy-data-field-moderator">
 
 
         {/* Show one table at a time */}
         {showArchive ? (
           <PolicyArchiveTable clients={clients} />
         ) : (
           <PolicyTableModerator clients={clients} onSelectClient={setSelectedClient} />
         )}
 
         <ClientModal
           client={selectedClient}
           onClose={() => setSelectedClient(null)}
         />
       </div>
     </div>
    );
}
