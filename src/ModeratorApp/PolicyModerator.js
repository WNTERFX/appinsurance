import { useNavigate } from "react-router-dom";
import './moderator-styles/policy-styles-moderator.css';
import DropdownAccountsModerator from "./DropDownAccountsModerator";
import { FaPlus, FaArchive, FaUserCircle } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import PolicyTableModerator from "./ModeratorTables/PolicyTableModerator";
import ClientModal from "../AdminApp/ClientInfo";
import ModeratorPolicyArchiveTable from "./ModeratorTables/ModeratorPolicyArchiveTable";
import { useModeratorProfile } from "../ModeratorApp/useModeratorProfile";
import { db } from "../dbServer";

export default function PolicyModerator() {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState(null);
  const [showArchive, setShowArchive] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [user, setUser] = useState(null);
  const profile = useModeratorProfile();

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

  // load current moderator
  useEffect(() => {
    async function loadUser() {
      const { data: { user }, error } = await db.auth.getUser();
      if (!error) setUser(user);
    }
    loadUser();
  }, []);

  return (
    <div className="Policy-container-moderator">
      <div className="Policy-header-moderator">
        <div className="right-actions-policy-moderator">
          <p className="policy-title-moderator">
            {showArchive ? "Policy Archive" : "Policy"}
          </p>
        </div>
        <div className="left-actions-policy-moderator">
          <button
            className="btn btn-create-moderator"
            onClick={() =>
              navigate("/appinsurance/MainAreaModerator/PolicyModerator/ModeratorPolicyNewClientForm")
            }
          >
            <FaPlus className="btn-icon-moderator" /> Create
          </button>

          <button
            className="btn btn-archive-moderator"
            onClick={() => setShowArchive((prev) => !prev)}
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

      <div className="policy-data-field-moderator">
        {showArchive ? (
          <ModeratorPolicyArchiveTable agentId={user?.id} /> 
        ) : (
          <PolicyTableModerator />
        )}

        <ClientModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      </div>
    </div>
  );
}
