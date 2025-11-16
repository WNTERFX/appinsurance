import React, { useState, useRef, useEffect, useCallback } from "react"; // Added useCallback
import { FaPlus, FaArchive, FaUserCircle } from "react-icons/fa";
import DropdownAccounts from "./DropDownAccounts";
import DeliveryTable from "./AdminTables/DeliveryTable";
import DeliveryArchiveTable from "./AdminTables/DeliveryArchiveTable";
import DeliveryCreationController from "./ControllerAdmin/DeliveryCreationController";
import EditDeliveryController from "./ControllerAdmin/EditDeliveryController";
import { fetchDeliveries } from "./AdminActions/DeliveryActions";
import { fetchPolicies } from "./AdminActions/PolicyActions";
import ProfileMenu from "../ReusableComponents/ProfileMenu";
import "./styles/delivery-styles.css";



export default function Delivery() {
  const [open, setOpen] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editDelivery, setEditDelivery] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  const [selectedPolicyForClientInfo, setSelectedPolicyForClientInfo] = useState(null);

  // Memoized load functions to prevent unnecessary re-renders of children
  const loadDeliveries = useCallback(async () => {
    setLoadingDeliveries(true);
    const data = await fetchDeliveries();
    setDeliveries(data || []);
    setLoadingDeliveries(false);
  }, []); // Empty dependency array means this function is created once

  const loadAllPolicies = useCallback(async () => {
    setLoadingPolicies(true);
    try {
      const data = await fetchPolicies();
      setPolicies(data || []);
    } catch (error) {
      console.error("Error loading all policies:", error);
      setPolicies([]);
    } finally {
      setLoadingPolicies(false);
    }
  }, []); // Empty dependency array means this function is created once

  // Initial data load
  useEffect(() => {
    loadDeliveries();
    loadAllPolicies();
  }, [loadDeliveries, loadAllPolicies]); // Dependencies on memoized functions

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

  // Callback to refresh both deliveries and policies after actions
  const handleDataRefresh = useCallback(async () => {
    await loadDeliveries();
    await loadAllPolicies();
  }, [loadDeliveries, loadAllPolicies]);


  return (
    <div className="delivery-container">
      <div className="delivery-header">
        <div className="right-actions">
          <p className="delivery-title">
            {showArchive ? "Delivery Archive" : "Deliveries"}
          </p>
        </div>

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

          <div className="profile-menu">
            <ProfileMenu onDarkMode={() => console.log("Dark Mode toggled")} />
          </div>
        </div>
      </div>

      <div className="delivery-table-container">
        {showArchive ? (
          <DeliveryArchiveTable />
        ) : (
          <DeliveryTable
            deliveries={deliveries}
            loading={loadingDeliveries || loadingPolicies}
            policies={policies}
            onEditDelivery={(delivery) => setEditDelivery(delivery)}
            onSelectPolicyForClientInfo={setSelectedPolicyForClientInfo}
            onRefreshData={handleDataRefresh} 
          />
        )}
      </div>

      {showCreateModal && (
        <div className="delivery-creation-modal-overlay">
          <div className="delivery-creation-modal-content">
            <DeliveryCreationController
              onCancel={() => setShowCreateModal(false)}
              onCreateSuccess={async () => {
                await handleDataRefresh(); // Use the unified refresh handler
                setShowCreateModal(false);
              }}
            />
          </div>
        </div>
      )}

      {editDelivery && (
        <div className="delivery-update-modal-overlay">
          <div className="delivery-update-modal-content">
            <EditDeliveryController
              delivery={editDelivery}
              onClose={() => setEditDelivery(null)}
              onUpdateSuccess={async () => {
                await handleDataRefresh(); // Use the unified refresh handler
                setEditDelivery(null);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}