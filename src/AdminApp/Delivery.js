import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaArchive, FaUserCircle } from "react-icons/fa";
import DropdownAccounts from "./DropDownAccounts";
import DeliveryTable from "./AdminTables/DeliveryTable";
import DeliveryArchiveTable from "./AdminTables/DeliveryArchiveTable";
import DeliveryCreationController from "./ControllerAdmin/DeliveryCreationController";
import EditDeliveryController from "./ControllerAdmin/EditDeliveryController";
import { fetchDeliveries } from "./AdminActions/DeliveryActions";
import "./styles/delivery-styles.css";

export default function Delivery() {
  const [open, setOpen] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editDelivery, setEditDelivery] = useState(null); // ✅ For edit modal
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load deliveries
  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    setLoading(true);
    const data = await fetchDeliveries();
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
    <div className="delivery-container">
      <div className="delivery-header">
        {/* Left side: title */}
        <div className="right-actions">
          <p className="delivery-title">
            {showArchive ? "Delivery Archive" : "Deliveries"}
          </p>
        </div>

        {/* Right side buttons */}
        <div className="left-actions">
          {!showArchive && (
            <button
              className="btn btn-create"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus className="btn-icon" />
              Create
            </button>
          )}

          <button
            className="btn btn-archive"
            onClick={() => setShowArchive((prev) => !prev)}
          >
            <FaArchive className="btn-icon" />{" "}
            {showArchive ? "Back to Deliveries" : "View Archive"}
          </button>

          {/* Profile menu */}
          <div className="profile-menu">
            <button
              ref={buttonRef}
              className="profile-button"
              onClick={() => setOpen((s) => !s)}
            >
              <span className="profile-name">Admin</span>
              <FaUserCircle className="profile-icon" />
            </button>
            <div ref={dropdownRef}>
              <DropdownAccounts
                open={open}
                onClose={() => setOpen(false)}
                onDarkMode={() => console.log("Dark Mode toggled")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="delivery-table-container">
        {showArchive ? (
          <DeliveryArchiveTable />
        ) : (
          <DeliveryTable
            deliveries={deliveries}
            loading={loading}
            onEditDelivery={(delivery) => setEditDelivery(delivery)} // ✅ handle edit click
          />
        )}
      </div>

      {/* === CREATE MODAL === */}
      {showCreateModal && (
        <div className="delivery-creation-modal-overlay">
          <div className="delivery-creation-modal-content">
            <DeliveryCreationController
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
        <div className="delivery-update-modal-overlay">
          <div className="delivery-update-modal-content">
            <EditDeliveryController
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
