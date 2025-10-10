// src/AdminApp/Client.js
// ... (imports remain the same)
import React, { useState, useRef, useEffect } from "react";
import ClientTable from "./AdminTables/ClientTable";
import ClientArchiveTable from "./AdminTables/ClientArchiveTable";
import { FaPlus, FaArchive, FaUser, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DropdownAccounts from "./DropDownAccounts";
import { fetchClients } from "./AdminActions/ClientActions";
import {
  getAllAgentsWithAssignedColors,
  getClientCountByAgent
} from "./AdminActions/AgentActions";

import NewClientController from "./ControllerAdmin/NewClientController";
import EditClientController from "./ControllerAdmin/EditClientController";

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

  useEffect(() => {
    loadClients();
    loadAgentsWithClientCounts();
    loadAllClientsCount();
  }, []);

  const loadClients = async (agentId = null) => {
    setLoading(true);
    const data = await fetchClients(agentId, false);
    setClients(data || []);
    setLoading(false);
  };

  const loadAllClientsCount = async () => {
    setAllClientsCount(await getClientCountByAgent(null));
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
    <div className="Client-container">
      {/* ... Client Header ... */}
      <div className="Client-header">
        <div className="right-actions">
          <p className="client-title">
            {showArchive ? "Client Archive" : "Client"}
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
            {showArchive ? "Back to Clients" : "View Archive"}
          </button>

          <div className="profile-menu">
            <button
              ref={buttonRef}
              className="profile-button"
              onClick={() => setOpen((s) => !s)}
              aria-haspopup="true"
              aria-expanded={open}
            >
              <span className="profile-name">Admin</span>
              <FaUserCircle className="profile-icon" />
            </button>

            <div>
              <DropdownAccounts
                open={open}
                onClose={() => setOpen(false)}
                onDarkMode={() => console.log("Dark Mode toggled")}
              />
            </div>
          </div>
        </div>
      </div>

      {!showArchive && (
        <div className="agent-cards-container">
          {agentsWithClientCounts.map((agent) => (
            <div
              className={`agent-content ${selectedAgentId === agent.id ? 'agent-selected' : ''}`}
              key={agent.id}
              style={{ borderLeftColor: agent.borderColor }}
              onClick={() => handleAgentCardClick(agent.id)}
            >
              <div className="agent-data">
                <h2>
                  <FaUser className="agent-icon" />
                  {agent.personnel_Name}
                </h2>
                <p>{agent.clientCount}</p> {/* This already shows the count per agent */}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="client-data-field">
        {showArchive ? (
          <ClientArchiveTable />
        ) : (
          <ClientTable
            agentId={selectedAgentId}
            allClientsCount={allClientsCount}
            agentsWithClientCounts={agentsWithClientCounts} /* NEW PROP: Pass all agents with counts */
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
                loadClients();
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
                await loadClients();
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