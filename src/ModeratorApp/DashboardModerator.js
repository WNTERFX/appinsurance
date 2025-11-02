import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart } from '@mui/x-charts/BarChart';
import { FaUserCircle, FaUsers, FaFileAlt, FaTruck, FaCheckCircle, FaChartBar, FaHourglassHalf } from "react-icons/fa";
import DropdownAccountsModerator from './DropDownAccountsModerator';
import { useModeratorProfile } from './useModeratorProfile';
import "./moderator-styles/dashboard-styles-moderator.css";
import {
  getModeratorClientCount,
  getModeratorTotalPolicyCount,
  getModeratorTotalDeliveryCount
} from "./ModeratorActions/ModeratorDashboardActions"; 

export default function DashboardModerator() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const profile = useModeratorProfile();

  // State variables for counts
  const [clientCount, setClientCount] = useState(0);
  const [policyCount, setPolicyCount] = useState(0);
  const [deliveryCount, setDeliveryCount] = useState(0);
  const [paymentCount, setPaymentCount] = useState(0);

  // Close dropdown on outside click
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

  // Fetch all counts when the profile is available
useEffect(() => {
    async function fetchAllModeratorCounts() {
        if (profile?.id) { // Ensure profile and its ID are available
            try {
                const [clients, policies, deliveries, payments] = await Promise.all([
                    getModeratorClientCount(profile.id),
                    getModeratorTotalPolicyCount(profile.id),
                    getModeratorTotalDeliveryCount(profile.id),
                    
                ]);

                setClientCount(clients);
                setPolicyCount(policies);
                setDeliveryCount(deliveries);
            } catch (err) {
                console.error("Error fetching moderator dashboard counts:", err);
            }
        }
    }
    fetchAllModeratorCounts();
}, [profile]); // Re-run when profile changes

  return (
    <div className="dashboard-container-moderator">
      <div className="dashboard-header-moderator">
        {/* Left Side */}
        <div className="right-actions-moderator">
          <div className="dashboard-title-container-moderator">
            <h4 className="dashboard-title-moderator">Dashboard</h4>
            <p className="welcome-text-moderator">
              Welcome back, {profile?.fullName || "Moderator"}! Here's your Silverstar agency overview.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="left-actions-moderator">
          <div className="profile-menu-moderator">
            <button
              ref={buttonRef}
              className="profile-button-moderator"
              onClick={() => setOpen((s) => !s)}
              aria-haspopup="true"
              aria-expanded={open}
            >
              <span className="profile-name-moderator">
                {profile?.fullName || "?"}
              </span>
              <FaUserCircle className="profile-icon-moderator" />
            </button>

            <DropdownAccountsModerator
              open={open}
              onClose={() => setOpen(false)}
              onDarkMode={() => console.log("Dark Mode toggled")}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-content-moderator">
        <div className="active-clients-moderator">
          <div className="active-clients-data-moderator"
            onClick={() => navigate("/appinsurance/MainAreaModerator/ClientModerator")}>
            <h2><FaUsers className="card-icon-moderator" />Total Clients</h2> {/* Changed title */}
            <p>{clientCount}</p>
          </div>
        </div>

        <div className="active-policy-moderator">
          <div className="active-policy-data-moderator"
            onClick={() => navigate("/appinsurance/MainAreaModerator/PolicyModerator")}>
            <h2><FaFileAlt className="card-icon-moderator" />Total Policies</h2> {/* Changed title */}
            <p>{policyCount}</p>
          </div>
        </div>

        <div className="active-deliveries-moderator">
          <div className="active-deliveries-data-moderator"
            onClick={() => navigate("/appinsurance/MainAreaModerator/DeliveryModerator")}>
            <h2><FaTruck className="card-icon-moderator" />Total Deliveries</h2> {/* Changed title */}
            <p>{deliveryCount}</p>
          </div>
        </div>

        <div className="payment-moderator">
          <div className="payment-data-moderator"
            onClick={() => navigate("/appinsurance/MainAreaModerator/PaymentRecordsModerator")}>
            <h2><FaCheckCircle className="card-icon-moderator" />Total Payment Records</h2> {/* Changed title */}
            <p>{policyCount}</p>
          </div>
        </div>

        {/* Bar Chart Section */}
        <div className="monthly-data-moderator">
          <div className="monthly-data-header-moderator">
            <h2><FaChartBar className="card-icon-moderator" /> Monthly Client Data</h2>
            <div className="partner-container-moderator">
              <span className="partner-moderator merchantile">Merchantile</span>
              <span className="partner-moderator standard">Standard</span>
              <span className="partner-moderator stronghold">Stronghold</span>
              <span className="partner-moderator cocogen">Cocogen</span>
            </div>
          </div>
          <div className="monthly-data-chart-moderator">
            <BarChart
              xAxis={[{ scaleType: 'band', data: ['group A', 'group B', 'group C'] }]}
              series={[
                { data: [4, 3, 5] },
                { data: [1, 6, 3] },
                { data: [2, 5, 6] },
              ]}
              height={200}
              width={1000}
            />
          </div>
        </div>

        {/* Pending Claims Section */}
        <div className="pending-claims-moderator">
          <div className="pending-claims-header-moderator">
            <h2><FaHourglassHalf className="card-icon-moderator" /> Pending Claims</h2>
            <button className="view-claims-btn-moderator">View all claims</button>
          </div>
          {/* your pending claims content here */}
        </div>
      </div>
    </div>
  );
}