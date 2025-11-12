import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import PolicyTable from "./AdminTables/PolicyTable";
import PolicyArchiveTable from "./AdminTables/PolicyArchiveTable";
import DropdownAccounts from "./DropDownAccounts";
import { fetchClients } from "./AdminActions/ClientActions";
import ClientModal from "./ClientInfo";
import { FaPlus, FaArchive, FaUser, FaUserCircle } from "react-icons/fa";
import ProfileMenu from "../ReusableComponents/ProfileMenu";
import {
  getAllAgentsWithAssignedColors,
  getPolicyCountByAgent
} from "./AdminActions/AgentActions";
import { fetchAllEmployeeRoles } from "./AdminActions/EmployeeRoleActions";
import "./styles/policy-styles.css";

export default function Policy() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [showArchive, setShowArchive] = useState(false);
  const [agentsWithPolicyCounts, setAgentsWithPolicyCounts] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [allPoliciesCount, setAllPoliciesCount] = useState(0);
  const [roles, setRoles] = useState([]);

  // Dropdown close
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

  useEffect(() => {
    loadClients();
    loadAgentsWithPolicyCounts();
    loadAllPoliciesCount();
    loadRoles();
  }, []);

  const loadClients = async () => {
    const data = await fetchClients();
    setClients(data);
  };

  const loadAllPoliciesCount = async () => {
    try {
      const count = await getPolicyCountByAgent(null);
      setAllPoliciesCount(count);
    } catch (error) {
      console.error("Error loading all policies count:", error);
      setAllPoliciesCount(0);
    }
  };

  const loadRoles = async () => {
    try {
      const rolesData = await fetchAllEmployeeRoles();
      setRoles(rolesData || []);
    } catch (error) {
      console.error("Error loading roles:", error);
      setRoles([]);
    }
  };

  const loadAgentsWithPolicyCounts = async () => {
    try {
      const agents = await getAllAgentsWithAssignedColors();
      const agentsWithCounts = await Promise.all(
        agents.map(async (agent) => {
          const policyCount = await getPolicyCountByAgent(agent.id);
          return { ...agent, policyCount };
        })
      );
      setAgentsWithPolicyCounts(agentsWithCounts);
    } catch (error) {
      console.error("Error loading agents with policy counts:", error);
      setAgentsWithPolicyCounts([]);
    }
  };

  const handleAgentCardClick = (agentId) => {
    setSelectedAgentId(agentId);
  };

  const handleViewAllPolicies = () => {
    setSelectedAgentId(null);
  };

  // Helper function to get role name or fallback to privilege
  const getAgentRoleDisplay = (agent) => {
    if (agent.role_id) {
      const role = roles.find(r => r.id === agent.role_id);
      if (role) return role.role_name;
    }
    // Fallback to privilege if no role assigned
    return agent.is_Admin ? "Admin" : "Moderator";
  };

  return (
    <div className="Policy-container">
      <div className="Policy-header">
        <div className="policy-right-actions">
          <p className="policy-title">
            {showArchive ? "Policy Archive" : "Policy"}
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
            <FaArchive className="policy-btn-icon" />{" "}
            {showArchive ? "Back to Policies" : "View Archive"}
          </button>
          <div className="policy-profile-menu">
            <ProfileMenu onDarkMode={() => console.log("Dark Mode toggled")} />
          </div>
        </div>
      </div>

      {!showArchive && (
        <div className="policy-agent-cards-container">
          {agentsWithPolicyCounts.map((agent) => (
            <div
              className={`policy-agent-card ${selectedAgentId === agent.id ? 'policy-agent-selected' : ''}`}
              key={agent.id}
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

      <div className="policy-data-field">
        {showArchive ? (
          <PolicyArchiveTable clients={clients} />
        ) : (
          <PolicyTable
            clients={clients}
            onSelectClient={setSelectedClient}
            agentId={selectedAgentId}
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