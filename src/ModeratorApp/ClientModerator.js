import ClientTableModerator from "./ModeratorTables/ClientTableModerator";
import './moderator-styles/client-styles-moderator.css';
import React, { useState, useRef, useEffect } from "react";
import ModeratorClientArchiveTable from "./ModeratorTables/ModeratorClientArchiveTable";
import { FaUserCircle} from "react-icons/fa";
import  DropdownAccountsModerator  from './DropDownAccountsModerator';
import { FaPlus, FaArchive } from "react-icons/fa";
import { fetchModeratorClients, getCurrentUser } from "./ModeratorActions/ModeratorClientActions";
import ModeratorNewClientController from "./ControllerModerator/ModeratorNewClientController";
import ModeratorEditNewClientController from "./ControllerModerator/ModeratorEditNewClientController";
import { useModeratorProfile } from "../ModeratorApp/useModeratorProfile";

export default function ClientModerator() {
    const [open, setOpen] = useState(false);
    const [showArchive, setShowArchive] = useState(false); // toggle archive
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editClient, setEditClient] = useState(null);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const profile = useModeratorProfile();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const user = await getCurrentUser();
    if (!user) return;
    const data = await fetchModeratorClients(user.id);
    setClients(data || []);
    setLoading(false);
  };

         
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

    return(
        <div className="Client-container-moderator">          
            <div className="Client-header-moderator">
               {/* Left side: title + search */}
             <div className="right-actions-client-moderator">
             <p className="client-title-moderator">
                {showArchive ? "Client Archive" : "Client"}
             </p>

        </div>

  {/* Right side: create + archive + profile */}
    <div className="left-actions-client-moderator">
      {!showArchive && ( 
      <button
        className="btn btn-create-moderator" 
        onClick={() => setShowCreateModal(true)
              }
        >
        <FaPlus className="btn-icon-moderator" />
        Create
      </button>
      )}

      <button className="btn btn-archive-moderator"
      onClick={() => setShowArchive((prev) => !prev)} // toggle archive
      >
        <FaArchive className="btn-icon-moderator" /> {" "}
        {showArchive ? "Back to Clients" : "View Archive"}
      </button>
    
      <div className="profile-menu-moderator">
        <button
          ref={buttonRef}
          className="profile-button-moderator"
          onClick={() => setOpen((s) => !s)}
          aria-haspopup="true"
          aria-expanded={open}
        >
            <span className="profile-name-moderator">{profile?.fullName || "?"}</span>
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

            {/* Table toggle */}
           <div className="client-data-field-moderator">
        {showArchive ? (
          <ModeratorClientArchiveTable />
        ) : (
          <ClientTableModerator
            clients={clients}
            loading={loading}
            onEditClient={(client) => setEditClient(client)}
          />
        )}
      </div>

                  {/* === CREATE MODAL === */}
      {showCreateModal && (
        <div className="modal-overlay-moderator">
          <div className="modal-content-moderator">
            <ModeratorNewClientController
              onCancel={() => setShowCreateModal(false)}
              refreshClients={loadClients}
            />
          </div>
        </div>
      )}

      {/* === EDIT MODAL === */}
      {editClient && (
        <div className="modal-overlay-moderator">
          <div className="modal-content-moderator">
            <ModeratorEditNewClientController
              client={editClient}
              onClose={() => setEditClient(null)}
              onUpdateSuccess={async () => {
                await loadClients();
                setEditClient(null);
              }}
            />
          </div>
        </div>
      )}
        </div>
    );
}
