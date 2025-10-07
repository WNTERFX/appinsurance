// App.js
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

// Reusable Components
import AuthChecker from "./ReusableComponents/AuthChecker";
import SessionMonitor from "./ReusableComponents/SessionMonitor";

// Admin Components
import LoginForm from "./LoginApp/LoginForm";
import MainArea from "./AdminApp/MainArea";
import Dashboard from "./AdminApp/Dashboard";
import Due from "./AdminApp/Due";
import Policy from "./AdminApp/Policy";
import ClaimTable from "./AdminApp/ClaimTable";
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
import Profile from "./AdminApp/Profile";
import AccountManagement from "./AdminApp/AdminAccountManagement/AccountManagement";

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
import ModeratorPolicyNewClientForm from "./ModeratorApp/ModeratorForms/ModeratorPolicyNewClientForm";
import ModeratorNewPolicyController from "./ModeratorApp/ControllerModerator/ModeratorNewPolicyController";
import ModeratorEditPolicyController from "./ModeratorApp/ControllerModerator/ModeratorEditPolicyController";


//Reusable Components
import GlobalAlert from "./ReusableComponents/GlobalAlert";
function App() {
  const [session, setSession] = useState(null);
  const [anotherLoginDetected, setAnotherLoginDetected] = useState(false);
  

  return (
    <>
      {/* Only start monitoring after login */}
       <GlobalAlert />
       <SessionMonitor session={session} />
     

      <Routes>
        {/* Public route */}
        <Route path="/appinsurance" element={<LoginForm anotherLoginDetected={anotherLoginDetected} setSession={setSession} />} />

        {/* Protected routes */}
        <Route element={<AuthChecker />}>
          {/* Admin routes */}
          <Route path="/appinsurance/MainArea" element={<MainArea />}>
            <Route index element={<Dashboard />} />
            <Route path="Dashboard" element={<Dashboard />} />
            <Route path="Client" element={<Client />} />
            <Route path="Client/ClientCreationForm" element={<NewClientController />} />
            <Route path="Client/ClientEditForm" element={<EditClientForm />} />
            <Route path="Due" element={<Due />} />
            <Route path="Policy" element={<Policy />} />
            <Route path="Policy/PolicyNewClient" element={<NewPolicyController />} />
            <Route path="Policy/Edit/:policyId" element={<EditPolicyController />} />
            <Route path="Policy/PolicyNewClient/VehicleDetails" element={<VehicleDetails />} />
            <Route path="Policy/ListClient" element={<ListClient />} />
            <Route path="Policy/ListClient/EditClientForm" element={<EditClientForm />} />
            <Route path="Policy/ListClient/EditClientForm/EditVehicleDetailsForm" element={<EditVehicleDetailsForm />} />
            <Route path="ClaimTable" element={<ClaimTable />} />
            <Route path="Delivery" element={<Delivery />} />
            <Route path="Delivery/NewDeliveryForm" element={<DeliveryCreationForm />} />
            <Route path="MonthlyData" element={<MonthlyDataController />} />
            <Route path="PaymentRecords" element={<PaymentRecords />} />
            <Route path="AccountManagement" element={<AccountManagement />} />
            <Route path="Profile" element={<Profile />} />
            <Route path="*" element={<div>Page not found</div>} />
          </Route>

          {/* Moderator routes */}
          <Route path="/appinsurance/MainAreaModerator" element={<MainAreaModerator />}>
            <Route index element={<DashboardModerator />} />
            <Route path="DashboardModerator" element={<DashboardModerator />} />
            <Route path="ClientModerator" element={<ClientModerator />} />
            <Route path="ClientModerator/ModeratorClientCreationForm" element={<ModeratorNewClientController />} />
            <Route path="ClientModerator/ModeratorClientEditForm" element={<ModeratorClientEditForm />} />
            <Route path="DueModerator" element={<DueModerator />} />
            <Route path="PolicyModerator" element={<PolicyModerator />} />
            <Route path="PolicyModerator/ModeratorPolicyNewClientForm" element={<ModeratorPolicyNewClientForm />} />
            <Route path="PolicyModerator/Edit/:policyId" element={<ModeratorEditPolicyController />} />
            <Route path="PolicyModerator/ModeratorNewPolicyController" element={<ModeratorNewPolicyController />} />
            <Route path="ClaimTableModerator" element={<ClaimTableModerator />} />
            <Route path="DeliveryModerator" element={<DeliveryModerator />} />
            <Route path="MonthlyDataModerator" element={<MonthlyDataModerator />} />
            <Route path="PaymentRecordsModerator" element={<PaymentRecordsModerator />} />
            <Route path="ProfileModerator" element={<ProfileModerator />} />
            <Route path="PolicyModerator/NewClientModerator" element={<PolicyNewClientModerator />} />
            <Route path="PolicyModerator/NewClientModerator/VehicleDetailsModerator" element={<VehicleDetailsModerator />} />
            <Route path="*" element={<div>Page not found</div>} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
