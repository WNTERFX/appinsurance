import './moderator-styles/delivery-styles-moderator.css';
import FilterModerator from './FilterModerator';
import DropdownAccountsModerator from "./DropDownAccountsModerator";
import { FaPlus, FaArchive, FaUserCircle } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { useModeratorProfile } from "./useModeratorProfile";
import ModeratorDeliveryTable from './ModeratorTables/ModeratorDeliveryTable';
import ModeratorDeliveryCreationController from './ControllerModerator/ModeratorDeliveryCreationController';
export default function DeliveryModerator() {

      const [open, setOpen] = useState(false);
        const dropdownRef = useRef(null);
        const buttonRef = useRef(null);
        const profile = useModeratorProfile();
        const [showCreateModal, setShowCreateModal] = useState(false);
    
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


  return (
    <div className="delivery-container-moderator">
      <div className="delivery-header-moderator">
        {/* Left side: title */}
        <div className="right-actions-moderator">
          <p className="delivery-title-moderator">
            <p>Deliveries</p>
           {/* {showArchive ? "Delivery Archive" : "Deliveries"}*/}
          </p>
        </div>

        {/* Right side */}
        <div className="left-actions-moderator">
         {/* {!showArchive && (*/}
            <button
              className="btn btn-create-moderator"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus className="btn-icon-moderator" />
              Create
            </button>
          {/**)} */}

          <button
            className="btn btn-archive-moderator"
    
          >
            <FaArchive className="btn-icon" />{" "}
           {/* {showArchive ? "Back to Deliveries" : "View Archive"}*/}
          </button>

          <div className="profile-menu-moderator">
            <button
              ref={buttonRef}
              className="profile-button-moderator"
              onClick={() => setOpen((s) => !s)}
            >
              <span className="profile-name-moderator">{profile?.fullName || "?"}</span>
              <FaUserCircle className="profile-icon-moderator" />
            </button>
            <div ref={dropdownRef}>
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
      <div className="delivery-table-container-moderator">
       {/* {showArchive ? <ModeratorDeliveryArchiveTable /> : <ModeratorDeliveryTable />}*/}
      <ModeratorDeliveryTable currentUser={profile}/>
      </div>

      {/* Outlet for nested routes (Creation Form) */}
      {/*<Outlet />*/}
      
             {/* === CREATE MODAL === */}
            {showCreateModal && (
              <div className="delivery-creation-modal-overlay-moderator">
                <div className="delivery-creation-modal-content-moderator">
                  <ModeratorDeliveryCreationController
                    onCancel={() => setShowCreateModal(false)}
                  />
                </div>
              </div>
            )}

    </div>
  );
}