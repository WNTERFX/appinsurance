import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { db } from "./dbServer";

import GlobalAlert, { showGlobalAlert } from "./ReusableComponents/GlobalAlert";
import AuthChecker from "./ReusableComponents/AuthChecker";
import SessionMonitor from "./ReusableComponents/SessionMonitor";

import LoginForm from "./LoginApp/LoginForm";
import PasswordResetForm from "./LoginApp/ResetForm";
import PasswordResetConfirm from "./LoginApp/PasswordResetConfirm";

// Admin Components
import MainArea from "./AdminApp/MainArea";
import Dashboard from "./AdminApp/Dashboard";
import Due from "./AdminApp/Due";
import Policy from "./AdminApp/Policy";
import Claims from "./AdminApp/Claims";
import Delivery from "./AdminApp/Delivery";
import Client from "./AdminApp/Client";
import MonthlyDataController from "./AdminApp/ControllerAdmin/MonthlyDataController";
import PaymentRecords from "./AdminApp/PaymentRecords";
import VehicleDetails from "./AdminApp/VehicleDetails";
import ListClient from "./AdminApp/ListClient";
import EditClientForm from "./AdminApp/EditClientForm";
import DeliveryCreationForm from "./AdminApp/AdminForms/DeliveryCreationForm";
import EditVehicleDetailsForm from "./AdminApp/EditVehicleDetailsForm";
import NewPolicyController from "./AdminApp/ControllerAdmin/NewPolicyController";
import NewClientController from "./AdminApp/ControllerAdmin/NewClientController";
import EditPolicyController from "./AdminApp/ControllerAdmin/EditPolicyController";
import About from "./AdminApp/About";
import AccountManagement from "./AdminApp/AdminAccountManagement/AccountManagement";
import AdminControl from "./AdminApp/AdminControl";

// Moderator Components
import MainAreaModerator from "./ModeratorApp/MainAreaModerator";
import DashboardModerator from "./ModeratorApp/DashboardModerator";
import ClientModerator from "./ModeratorApp/ClientModerator";
import DueModerator from "./ModeratorApp/DueModerator";
import PolicyModerator from "./ModeratorApp/PolicyModerator";
import ClaimTableModerator from "./ModeratorApp/ClaimTableModerator";
import DeliveryModerator from "./ModeratorApp/DeliveryModerator";
import MonthlyDataModerator from "./ModeratorApp/MonthlyDataModerator";
import PaymentRecordsModerator from "./ModeratorApp/PaymentRecordsModerator";
import ProfileModerator from "./ModeratorApp/ProfileModerator";
import PolicyNewClientModerator from "./ModeratorApp/PolicyNewClientModerator";
import VehicleDetailsModerator from "./ModeratorApp/VehicleDetailsModerator";
import ModeratorNewClientController from "./ModeratorApp/ControllerModerator/ModeratorNewClientController";
import ModeratorClientEditForm from "./ModeratorApp/ModeratorForms/ModeratorClientEditForm";
import ModeratorNewPolicyController from "./ModeratorApp/ControllerModerator/ModeratorNewPolicyController";
import ModeratorEditPolicyController from "./ModeratorApp/ControllerModerator/ModeratorEditPolicyController";

// ---------- APP ----------

function App() {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true);

      try {
        // 1. Check Supabase Auth first (Source of Truth)
        const { data: { session: supabaseSession }, error: sessionError } = await db.auth.getSession();
        
        // If Supabase says no, we are done.
        if (!supabaseSession || sessionError) {
          setSession(null);
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        setSession(supabaseSession);

        // 2. ✅ Retrieve User Data from localStorage ONLY (cross-tab sync)
        const savedUserStr = localStorage.getItem("currentUser");
        
        if (savedUserStr) {
          setCurrentUser(JSON.parse(savedUserStr));
          setIsLoading(false);
          return;
        }

        // 3. Fallback: Fetch from DB if storage is empty but Supabase is active
        // (This handles cases where user cleared cache but cookie remains)
        const { data: accountData, error: accountError } = await db
          .from("employee_Accounts")
          .select("id, is_Admin, status_Account, first_name, last_name, employee_email")
          .eq("id", supabaseSession.user.id)
          .single();

        if (accountError || !accountData || !accountData.status_Account) {
          showGlobalAlert("Invalid account. Please contact admin.");
          setCurrentUser(null);
          setSession(null);
          await db.auth.signOut();
          setIsLoading(false);
          return;
        }

        const userData = {
          id: accountData.id,
          email: accountData.employee_email,
          first_name: accountData.first_name,
          last_name: accountData.last_name,
          is_Admin: accountData.is_Admin,
          access_token: supabaseSession.access_token,
        };

        // ✅ Store in localStorage for cross-tab persistence
        localStorage.setItem("currentUser", JSON.stringify(userData));
        setCurrentUser(userData);

      } catch (err) {
        console.error("Restore session failed", err);
        setSession(null);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", flexDirection:"column", gap:"1rem" }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <GlobalAlert />
      <SessionMonitor session={session} currentUser={currentUser} />

      <Routes>
        {/* LOGIN */}
        <Route
          path="/"
          element={
            session ? (
              <Navigate to="/appinsurance/main-app/dashboard" replace />
            ) : (
              <LoginForm setSession={setSession} setCurrentUser={setCurrentUser} />
            )
          }
        />

        <Route path="/appinsurance/reset-password" element={<PasswordResetForm />} />
        <Route path="/appinsurance/reset-password/confirm" element={<PasswordResetConfirm />} />

    
        <Route element={
            <AuthChecker 
                session={session} 
                setSession={setSession} 
                setCurrentUser={setCurrentUser} 
            />
        }>

          {/* Admin */}
          <Route path="/appinsurance/main-app" element={<MainArea currentUser={currentUser} />}>
            <Route index element={<Dashboard currentUser={currentUser} />} />
            <Route path="dashboard" element={<Dashboard currentUser={currentUser} />} />
            <Route path="client" element={<Client currentUser={currentUser} />} />
            <Route path="client/clientCreationForm" element={<NewClientController currentUser={currentUser} />} />
            <Route path="client/clientEditForm" element={<EditClientForm currentUser={currentUser} />} />
            <Route path="due" element={<Due currentUser={currentUser} />} />
            <Route path="policy" element={<Policy currentUser={currentUser} />} />
            <Route path="policy/policy-new-client" element={<NewPolicyController currentUser={currentUser} />} />
            <Route path="policy/edit/:policyId" element={<EditPolicyController currentUser={currentUser} />} />
            <Route path="policy/policyNewClient/vehicle-details" element={<VehicleDetails currentUser={currentUser} />} />
            <Route path="policy/listClient" element={<ListClient currentUser={currentUser} />} />
            <Route path="policy/listClient/edit-client-form" element={<EditClientForm currentUser={currentUser} />} />
            <Route path="policy/listClient/edit-client-form/edit-vehicle-details-form" element={<EditVehicleDetailsForm currentUser={currentUser} />} />
            <Route path="claim" element={<Claims currentUser={currentUser} />} />
            <Route path="delivery" element={<Delivery currentUser={currentUser} />} />
            <Route path="delivery/new-delivery-form" element={<DeliveryCreationForm currentUser={currentUser} />} />
            <Route path="records" element={<MonthlyDataController currentUser={currentUser} />} />
            <Route path="payment-records" element={<PaymentRecords currentUser={currentUser} />} />
            <Route path="account-management" element={<AccountManagement currentUser={currentUser} />} />
            <Route path="admin-controls" element={<AdminControl currentUser={currentUser}/>} />
            <Route path="about" element={<About currentUser={currentUser} />} />
          </Route>
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;