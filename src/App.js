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

function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ---- INITIAL SESSION VALIDATION ----
  useEffect(() => {
    const validateSession = async () => {
      setIsLoading(true);

      try {
        // 1. Check Supabase Auth Session first
        const { data: { session: currentSupabaseSession }, error: sessionError } = await db.auth.getSession();

        if (sessionError || !currentSupabaseSession) {
          await handleInvalidSession();
          return;
        }

        // 2. Check Custom Security Token in Database
        const userId = currentSupabaseSession.user.id;
        const currentToken = currentSupabaseSession.access_token;

        const { data: accountData, error: dbError } = await db
          .from("employee_Accounts")
          .select("current_session_token")
          .eq("id", userId)
          .maybeSingle();

        if (dbError) {
          await handleInvalidSession();
          return;
        }

        // 3. Compare Tokens
        if (accountData && accountData.current_session_token === currentToken) {
          setSession(currentSupabaseSession);
        } else {
          showGlobalAlert("Your session has expired or you logged in elsewhere.");
          await handleInvalidSession();
        }

      } catch (err) {
        console.error("Session check failed:", err);
        await handleInvalidSession();
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const handleInvalidSession = async () => {
    localStorage.removeItem("user_session");
    sessionStorage.removeItem("user_session");
    setSession(null);
    
    // Check if we need to sign out from Supabase
    const { data } = await db.auth.getSession();
    if (data?.session) {
      await db.auth.signOut();
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <GlobalAlert />
      <SessionMonitor session={session} />

      <Routes>
        <Route
          path="/"
          element={
            session ? (
              // If session exists, go to dashboard automatically
              <Navigate to="/appinsurance/main-app/dashboard" replace />
            ) : (
              // Pass setSession so LoginForm can update the state on success
              <LoginForm setSession={setSession} />
            )
          }
        />

        <Route path="/appinsurance/reset-password" element={<PasswordResetForm />} />
        <Route path="/appinsurance/reset-password/confirm" element={<PasswordResetConfirm />} />


        {/* PROTECTED ROUTES */}
        <Route element={<AuthChecker />}>

          {/* Admin Routes */}
          <Route path="/appinsurance/main-app" element={<MainArea />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="client" element={<Client />} />
            <Route path="client/clientCreationForm" element={<NewClientController />} />
            <Route path="client/clientEditForm" element={<EditClientForm />} />
            <Route path="due" element={<Due />} />
            <Route path="policy" element={<Policy />} />
            <Route path="policy/policy-new-client" element={<NewPolicyController />} />
            <Route path="policy/edit/:policyId" element={<EditPolicyController />} />
            <Route path="policy/policyNewClient/vehicle-details" element={<VehicleDetails />} />
            <Route path="policy/listClient" element={<ListClient />} />
            <Route path="policy/listClient/edit-client-form" element={<EditClientForm />} />
            <Route path="policy/listClient/edit-client-form/edit-vehicle-details-form" element={<EditVehicleDetailsForm />} />
            <Route path="claim" element={<Claims />} />
            <Route path="delivery" element={<Delivery />} />
            <Route path="delivery/new-delivery-form" element={<DeliveryCreationForm />} />
            <Route path="records" element={<MonthlyDataController />} />
            <Route path="payment-records" element={<PaymentRecords />} />
            <Route path="account-management" element={<AccountManagement />} />
            <Route path="admin-controls" element={<AdminControl/>} />
            <Route path="about" element={<About />} />
          </Route>

          {/* Moderator Routes */}
          <Route path="/appinsurance/MainAreaModerator" element={<MainAreaModerator />}>
            <Route index element={<DashboardModerator />} />
            <Route path="DashboardModerator" element={<DashboardModerator />} />
            <Route path="ClientModerator" element={<ClientModerator />} />
            <Route path="ClientModerator/ModeratorClientCreationForm" element={<ModeratorNewClientController />} />
            <Route path="ClientModerator/ModeratorClientEditForm" element={<ModeratorClientEditForm />} />
            <Route path="DueModerator" element={<DueModerator />} />
            <Route path="PolicyModerator" element={<PolicyModerator />} />
            <Route path="PolicyModerator/ModeratorPolicyNewClientForm" element={<ModeratorNewPolicyController />} />
            <Route path="PolicyModerator/Edit/:policyId" element={<ModeratorEditPolicyController />} />
            <Route path="PolicyModerator/ModeratorNewPolicyController" element={<ModeratorNewPolicyController />} />
            <Route path="ClaimTableModerator" element={<ClaimTableModerator />} />
            <Route path="DeliveryModerator" element={<DeliveryModerator />} />
            <Route path="MonthlyDataModerator" element={<MonthlyDataModerator />} />
            <Route path="PaymentRecordsModerator" element={<PaymentRecordsModerator />} />
            <Route path="ProfileModerator" element={<ProfileModerator />} />
            <Route path="PolicyModerator/NewClientModerator" element={<PolicyNewClientModerator />} />
            <Route path="PolicyModerator/NewClientModerator/VehicleDetailsModerator" element={<VehicleDetailsModerator />} />
          </Route>

        </Route>

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  );
}

export default App;