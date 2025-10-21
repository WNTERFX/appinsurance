// AdminControl.jsx
import React from "react";
import { useAdminController } from "./ControllerAdmin/AdminController"
import CalculationsTab from "../AdminManagement/CalculationsTab";
import MessagesTab from "../AdminManagement/MessagesTab";
import PartnersTab from "../AdminManagement/PartnersTab";
import CronJobsTab from "../AdminManagement/CronJobsTab";
import PaymentTypesTab from "../AdminManagement/PaymentsTab"; 
import "./styles/admin-control-styles.css";

export default function AdminControl() {
  const controller = useAdminController();
  return (
    <div className="admin-controller-container">
      <div className="admin-controller-wrapper">
        <div className="admin-controller-header">
          <h2 className="admin-controller-title">Admin Control Panel</h2>
        </div>
        {/* Tab Navigation */}
        <div style={{ marginBottom: "20px", borderBottom: "2px solid #e0e0e0" }}>
          <button
            onClick={() => controller.setActiveTab("calculations")}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              border: "none",
              background: controller.activeTab === "calculations" ? "#007bff" : "#f8f9fa",
              color: controller.activeTab === "calculations" ? "white" : "#333",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "4px 4px 0 0"
            }}
          >
            Vehicle Calculations
          </button>
          <button
            onClick={() => controller.setActiveTab("messages")}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              border: "none",
              background: controller.activeTab === "messages" ? "#007bff" : "#f8f9fa",
              color: controller.activeTab === "messages" ? "white" : "#333",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "4px 4px 0 0"
            }}
          >
            Messages
          </button>
          <button
            onClick={() => controller.setActiveTab("partners")}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              border: "none",
              background: controller.activeTab === "partners" ? "#007bff" : "#f8f9fa",
              color: controller.activeTab === "partners" ? "white" : "#333",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "4px 4px 0 0"
            }}
          >
            Insurance Partners
          </button>
          <button
            onClick={() => controller.setActiveTab("paymenttypes")}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              border: "none",
              background: controller.activeTab === "paymenttypes" ? "#007bff" : "#f8f9fa",
              color: controller.activeTab === "paymenttypes" ? "white" : "#333",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "4px 4px 0 0"
            }}
          >
            Payment Types
          </button>
          <button
            onClick={() => controller.setActiveTab("cronjobs")}
            style={{
              padding: "10px 20px",
              border: "none",
              background: controller.activeTab === "cronjobs" ? "#007bff" : "#f8f9fa",
              color: controller.activeTab === "cronjobs" ? "white" : "#333",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "4px 4px 0 0"
            }}
          >
            Cron Jobs
          </button>
        </div>
        {controller.message.text && (
          <div className={`admin-controller-message ${controller.message.type}`}>
            {controller.message.text}
          </div>
        )}
        {/* Tab Content */}
        {controller.activeTab === "calculations" && <CalculationsTab controller={controller} />}
        {controller.activeTab === "messages" && <MessagesTab controller={controller} />}
        {controller.activeTab === "partners" && <PartnersTab controller={controller} />}
        {controller.activeTab === "paymenttypes" && <PaymentTypesTab />}
        {controller.activeTab === "cronjobs" && <CronJobsTab controller={controller} />}
      </div>
    </div>
  );
}