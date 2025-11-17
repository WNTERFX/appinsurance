import React, { useState, useRef, useEffect } from "react";
import ClientTable from "./AdminTables/ClientTable";
import ClientArchiveTable from "./AdminTables/ClientArchiveTable";
import { FaPlus, FaArchive, FaUser, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DropdownAccounts from "./DropDownAccounts";
import { fetchClients } from "./AdminActions/ClientActions";
import {
  getAllAgentsWithAssignedColors,
  getClientCountByAgent,
} from "./AdminActions/AgentActions";
import { fetchAllEmployeeRoles } from "./AdminActions/EmployeeRoleActions";
import ProfileMenu from "../ReusableComponents/ProfileMenu";

import NewClientController from "./ControllerAdmin/NewClientController";
import EditClientController from "./ControllerAdmin/EditClientController";
import "./styles/client-styles.css";

export default function Client() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentsWithClientCounts, setAgentsWithClientCounts] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [allClientsCount, setAllClientsCount] = useState(0);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    loadClients(selectedAgentId, showArchive);
  }, [selectedAgentId, showArchive]);

  useEffect(() => {
    loadAgentsWithClientCounts();
    loadAllClientsCount();
    loadRoles();
  }, []);

  const loadClients = async (agentId = null, isArchive = false) => {
    setLoading(true);

    if (!isArchive) {
      const data = await fetchClients(agentId, false);
      setClients(data || []);
    }

    setLoading(false);
  };

  const loadAllClientsCount = async () => {
    setAllClientsCount(await getClientCountByAgent(null));
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

  const loadAgentsWithClientCounts = async () => {
    try {
      const agents = await getAllAgentsWithAssignedColors();
      const agentsWithCounts = await Promise.all(
        agents.map(async (agent) => {
          const clientCount = await getClientCountByAgent(agent.id);
          return { ...agent, clientCount };
        })
      );
      setAgentsWithClientCounts(agentsWithCounts);
    } catch (error) {
      console.error("Error loading agents with client counts:", error);
      setAgentsWithClientCounts([]);
    }
  };

  const handleAgentCardClick = (agentId) => {
    setSelectedAgentId(agentId);
  };

  const handleViewAllClients = () => {
    setSelectedAgentId(null);
  };

  const getAgentRoleDisplay = (agent) => {
    if (agent.role_id) {
      const role = roles.find((r) => r.id === agent.role_id);
      if (role) return role.role_name;
    }
    return agent.is_Admin ? "Admin" : "Moderator";
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="Client-container">
      <div className="Client-header">
        <div className="right-actions">
          <p className="client-title">
            {showArchive ? "Client Archive" : "Client List"}
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
            <FaArchive className="btn-icon" />
            {showArchive ? "Back to Clients" : "View Archive"}
          </button>

          <div className="profile-menu">
            <ProfileMenu
              onDarkMode={() => console.log("Dark Mode toggled")}
            />
          </div>
        </div>
      </div>

      {!showArchive && (
        <div className="agent-cards-container">
          {agentsWithClientCounts.map((agent) => (
            <div
              key={agent.id}
              className={`agent-content ${
                selectedAgentId === agent.id ? "agent-selected" : ""
              }`}
              style={{ borderLeftColor: agent.borderColor }}
              onClick={() => handleAgentCardClick(agent.id)}
            >
              <div className="agent-data">
                <h2>
                  <FaUser className="agent-icon" />
                  {agent.first_name} {agent.last_name}
                </h2>
                <p className="agent-role">{getAgentRoleDisplay(agent)}</p>
                <p className="agent-client-count">
                  {agent.clientCount} Clients
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="client-data-field">
        {loading ? (
          <div className="loading-overlay">
            <FaSpinner className="spinner" />
            <p>Loading client data...</p>
          </div>
        ) : showArchive ? (
          <ClientArchiveTable />
        ) : (
          <ClientTable
            agentId={selectedAgentId}
            clients={clients}
            allClientsCount={allClientsCount}
            agentsWithClientCounts={agentsWithClientCounts}
            onViewAllClients={handleViewAllClients}
            onEditClient={(client) => setEditClient(client)}
          />
        )}
      </div>

      {showCreateModal && (
        <div className="client-creation-modal-overlay-moderator">
          <div className="client-creation-modal-content-moderator">
            <NewClientController
              onCancel={() => {
                setShowCreateModal(false);
                loadClients(selectedAgentId, showArchive);
                loadAgentsWithClientCounts();
                loadAllClientsCount();
              }}
            />
          </div>
        </div>
      )}

      {editClient && (
        <div className="client-creation-modal-overlay-moderator">
          <div className="client-creation-modal-content-moderator">
            <EditClientController
              client={editClient}
              onClose={() => setEditClient(null)}
              onUpdateSuccess={async () => {
                await loadClients(selectedAgentId, showArchive);
                await loadAgentsWithClientCounts();
                await loadAllClientsCount();
                setEditClient(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
