import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaPlus, FaArchive, FaUserCircle } from "react-icons/fa";
import DropdownAccountsModerator from "./DropDownAccountsModerator";
import { useModeratorProfile } from "./useModeratorProfile";
import ModeratorDeliveryTable from './ModeratorTables/ModeratorDeliveryTable';
import ModeratorDeliveryCreationController from './ControllerModerator/ModeratorDeliveryCreationController';
import ModeratorEditDeliveryController from './ControllerModerator/ModeratorEditDeliveryController';
import ModeratorDeliveryArchiveTable from './ModeratorTables/ModeratorDeliveryArchiveTable';
import { fetchModeratorDeliveries } from './ModeratorActions/ModeratorDeliveryActions';
// ⭐ Using the Admin's fetchPolicies directly
import { fetchPolicies } from "../AdminApp/AdminActions/PolicyActions";
import ClientInfo from '../AdminApp/ClientInfo';

import './moderator-styles/delivery-styles-moderator.css';

export default function DeliveryModerator() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const profile = useModeratorProfile();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editDelivery, setEditDelivery] = useState(null);
  const [showArchive, setShowArchive] = useState(false);

  const [deliveries, setDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);

  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  const [selectedPolicyForClientInfo, setSelectedPolicyForClientInfo] = useState(null);

  // Memoized load deliveries function
  const loadDeliveries = useCallback(async () => {
    if (!profile?.id) {
      setDeliveries([]);
      setLoadingDeliveries(false);
      return;
    }
    setLoadingDeliveries(true);
    try {
      const data = await fetchModeratorDeliveries(profile.id);
      setDeliveries(data || []);
    } catch (error) {
      console.error("Error fetching moderator deliveries:", error);
      setDeliveries([]);
    } finally {
      setLoadingDeliveries(false);
    }
  }, [profile]); // Depends on profile to ensure we have the ID

  // Memoized load policies function - now directly using Admin's fetchPolicies
  const loadPolicies = useCallback(async () => {
    setLoadingPolicies(true);
    try {
      const data = await fetchPolicies(); // ⭐ Using the imported Admin action
      setPolicies(data || []);
    } catch (error) {
      console.error("Error fetching policies:", error); // Adjusted error message
      setPolicies([]);
    } finally {
      setLoadingPolicies(false);
    }
  }, []); // Empty dependency array as fetchPolicies likely doesn't depend on local state/props

  // Initial data load for deliveries and policies
  useEffect(() => {
    loadDeliveries();
    loadPolicies();
  }, [loadDeliveries, loadPolicies]); // Dependencies on memoized functions

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

  // Callback to refresh both deliveries and policies after actions (Create/Edit)
  const handleDataRefresh = useCallback(async () => {
    await loadDeliveries();
    await loadPolicies();
  }, [loadDeliveries, loadPolicies]);


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
            <FaArchive className="btn-icon-moderator" />
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
          <ModeratorDeliveryArchiveTable />
        ) : (
          <ModeratorDeliveryTable
            currentUser={profile}
            deliveries={deliveries}
            loading={loadingDeliveries || loadingPolicies}
            policies={policies} // Pass fetched policies
            onEditDelivery={(delivery) => setEditDelivery(delivery)}
            onSelectPolicyForClientInfo={setSelectedPolicyForClientInfo}
            onRefreshData={handleDataRefresh}
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
                await handleDataRefresh();
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
                await handleDataRefresh();
                setEditDelivery(null);
              }}
            />
          </div>
        </div>
      )}

      {/* === CLIENT INFO MODAL === */}
      <ClientInfo
        selectedPolicy={selectedPolicyForClientInfo}
        onClose={() => setSelectedPolicyForClientInfo(null)}
      />
    </div>
  );
}