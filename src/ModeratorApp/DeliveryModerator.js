import './moderator-styles/delivery-styles-moderator.css';
import FilterModerator from './FilterModerator';
import DropdownAccountsModerator from "./DropDownAccountsModerator";
import { FaPlus, FaArchive, FaUserCircle } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { useModeratorProfile } from "./useModeratorProfile";
import ModeratorDeliveryTable from './ModeratorTables/ModeratorDeliveryTable';
import ModeratorDeliveryCreationController from './ControllerModerator/ModeratorDeliveryCreationController';
import ModeratorEditDeliveryController from './ControllerModerator/ModeratorEditDeliveryController';
import ModeratorClientArchiveTable  from './ModeratorTables/ModeratorClientArchiveTable';
import { fetchModeratorDeliveries } from './ModeratorActions/ModeratorDeliveryActions';

export default function DeliveryModerator() {

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const profile = useModeratorProfile();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editDelivery, setEditDelivery] = useState(null);
  const [showArchive, setShowArchive] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch deliveries like in Admin
  useEffect(() => {
    if (profile) loadDeliveries();
  }, [profile]);

  const loadDeliveries = async () => {
    setLoading(true);
    const data = await fetchModeratorDeliveries(profile);
    setDeliveries(data || []);
    setLoading(false);
  };

  // close dropdown on outside click
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
            {showArchive ? "Delivery Archive" : "Deliveries"}
          </p>
        </div>

        {/* Right side */}
        <div className="left-actions-moderator">
          {!showArchive && (
            <button
              className="btn btn-create-moderator"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus className="btn-icon-moderator" />
              Create
            </button>
          )}

          <button
            className="btn btn-archive-moderator"
            onClick={() => setShowArchive((prev) => !prev)}
          >
            <FaArchive className="btn-icon" />{" "}
            {showArchive ? "Back to Deliveries" : "View Archive"}
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

      {/* Table Section */}
      <div className="delivery-table-container-moderator">
        {showArchive ? (
          <ModeratorClientArchiveTable />
        ) : (
          <ModeratorDeliveryTable
            currentUser={profile}
            deliveries={deliveries}
            loading={loading}
            onEditDelivery={(delivery) => setEditDelivery(delivery)}
          />
        )}
      </div>

      {/* === CREATE MODAL === */}
      {showCreateModal && (
        <div className="delivery-creation-modal-overlay-moderator">
          <div className="delivery-creation-modal-content-moderator">
            <ModeratorDeliveryCreationController
              onCancel={() => setShowCreateModal(false)}
              onCreateSuccess={async () => {
                await loadDeliveries();
                setShowCreateModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* === EDIT MODAL === */}
      {editDelivery && (
        <div className="delivery-update-modal-overlay-moderator">
          <div className="delivery-update-modal-content-moderator">
            <ModeratorEditDeliveryController
              delivery={editDelivery}
              onClose={() => setEditDelivery(null)}
              onUpdateSuccess={async () => {
                await loadDeliveries();
                setEditDelivery(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
