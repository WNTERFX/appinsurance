import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import PolicyTable from "./AdminTables/PolicyTable";
import PolicyArchiveTable from "./AdminTables/PolicyArchiveTable";
import { fetchClients } from "./AdminActions/ClientActions";
import ClientModal from "./ClientInfo";
import { FaPlus, FaArchive, FaUser, FaSpinner } from "react-icons/fa";
import ProfileMenu from "../ReusableComponents/ProfileMenu";

import {
  getAllAgentsWithAssignedColors,
  getPolicyCountByAgent,
} from "./AdminActions/AgentActions";

import { fetchAllEmployeeRoles } from "./AdminActions/EmployeeRoleActions";

import "./styles/policy-styles.css";

export default function Policy() {
  const navigate = useNavigate();

  // UI State
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // App Data State
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showArchive, setShowArchive] = useState(false);
  const [agentsWithPolicyCounts, setAgentsWithPolicyCounts] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [allPoliciesCount, setAllPoliciesCount] = useState(0);
  const [roles, setRoles] = useState([]);

  // Loading State
  const [loading, setLoading] = useState(true);

  // =========================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // =========================
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

  // =========================
  // INITIAL DATA LOAD
  // =========================
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        loadClients(),
        loadAgentsWithPolicyCounts(),
        loadAllPoliciesCount(),
        loadRoles(),
      ]);
      setLoading(false);
    };

    loadInitialData();
  }, []);

  const loadClients = async () => {
    const data = await fetchClients();
    setClients(data || []);
  };

  const loadAllPoliciesCount = async () => {
    try {
      const total = await getPolicyCountByAgent(null);
      setAllPoliciesCount(total);
    } catch (error) {
      console.error("Error loading all policy counts:", error);
      setAllPoliciesCount(0);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await fetchAllEmployeeRoles();
      setRoles(data || []);
    } catch (err) {
      console.error("Failed loading roles:", err);
      setRoles([]);
    }
  };

  const loadAgentsWithPolicyCounts = async () => {
    try {
      const agents = await getAllAgentsWithAssignedColors();

      const agentsWithCounts = await Promise.all(
        agents.map(async (agent) => {
          const count = await getPolicyCountByAgent(agent.id);
          return { ...agent, policyCount: count };
        })
      );

      setAgentsWithPolicyCounts(agentsWithCounts);
    } catch (error) {
      console.error("Error loading policy counts:", error);
      setAgentsWithPolicyCounts([]);
    }
  };

  // =========================
  // HANDLERS
  // =========================
  const handleAgentCardClick = (agentId) => {
    setSelectedAgentId(agentId);
  };

  const handleViewAllPolicies = () => {
    setSelectedAgentId(null);
  };

  const getAgentRoleDisplay = (agent) => {
    if (agent.role_id) {
      const role = roles.find((r) => r.id === agent.role_id);
      if (role) return role.role_name;
    }
    return agent.is_Admin ? "Admin" : "Moderator";
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="Policy-container">

      {/* HEADER */}
      <div className="Policy-header">
        <div className="policy-right-actions">
          <p className="policy-title">
            {showArchive ? "Policy Archive" : "Policy List"}
          </p>
        </div>

        <div className="policy-left-actions">
          {!showArchive && (
            <button
              className="policy-btn policy-btn-create"
              onClick={() =>
                navigate("/appinsurance/main-app/policy/policy-new-client")
              }
            >
              <FaPlus className="policy-btn-icon" /> Create
            </button>
          )}

          <button
            className="policy-btn policy-btn-archive"
            onClick={() => setShowArchive((prev) => !prev)}
          >
            <FaArchive className="policy-btn-icon" />
            {showArchive ? "Back to Policies" : "View Archive"}
          </button>

          <div className="policy-profile-menu">
            <ProfileMenu onDarkMode={() => console.log("Dark Mode toggled")} />
          </div>
        </div>
      </div>

      {/* AGENT FILTER CARDS */}
      {!showArchive && (
        <div className="policy-agent-cards-container">
          {agentsWithPolicyCounts.map((agent) => (
            <div
              key={agent.id}
              className={`policy-agent-card ${
                selectedAgentId === agent.id ? "policy-agent-selected" : ""
              }`}
              style={{ borderLeftColor: agent.borderColor }}
              onClick={() => handleAgentCardClick(agent.id)}
            >
              <div className="policy-agent-data">
                <h2>
                  <FaUser className="policy-agent-icon" />
                  {agent.first_name} {agent.last_name}
                </h2>
                <p className="policy-agent-role">{getAgentRoleDisplay(agent)}</p>
                <p className="policy-agent-count">{agent.policyCount} Policies</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="policy-data-field">
        {loading ? (
          <div className="loading-overlay">
            <FaSpinner className="spinner" />
            <p>Loading policy data...</p>
          </div>
        ) : showArchive ? (
          <PolicyArchiveTable clients={clients} />
        ) : (
          <PolicyTable
            clients={clients}
            agentId={selectedAgentId}
            onSelectClient={setSelectedClient}
            allPoliciesCount={allPoliciesCount}
            agentsWithPolicyCounts={agentsWithPolicyCounts}
            onViewAllPolicies={handleViewAllPolicies}
          />
        )}

        <ClientModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      </div>
    </div>
  );
}
