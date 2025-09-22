import LoginForm from './LoginApp/LoginForm';
import MainArea from './AdminApp/MainArea';
import Dashboard from './AdminApp/Dashboard';
import Due from './AdminApp/Due';
import Policy from './AdminApp/Policy';
import ClaimTable from './AdminApp/ClaimTable';
import Delivery from './AdminApp/Delivery';
import Client from './AdminApp/Client'; 
import MonthlyDataController from './AdminApp/ControllerAdmin/MonthlyDataController';
import ClientArchiveTable from './AdminApp/AdminTables/ClientArchiveTable';
import PaymentRecords from './AdminApp/PaymentRecords';

import VehicleDetails from './AdminApp/VehicleDetails';
import ListClient from './AdminApp/ListClient';
import EditClientForm from './AdminApp/EditClientForm';
import EditVehicleDetailsForm from './AdminApp/EditVehicleDetailsForm';
import NewPolicyController from './AdminApp/ControllerAdmin/NewPolicyController';
import NewClientController from './AdminApp/ControllerAdmin/NewClientController';
import EditPolicyController from './AdminApp/ControllerAdmin/EditPolicyController';
import {Routes, Route} from "react-router-dom";
import Profile from './AdminApp/Profile';

import MainAreaModerator from './ModeratorApp/MainAreaModerator';
import DashboardModerator from './ModeratorApp/DashboardModerator';
import ClientModerator from './ModeratorApp/ClientModerator';
import DueModerator from './ModeratorApp/DueModerator';
import PolicyModerator from './ModeratorApp/PolicyModerator';
import ClaimTableModerator from './ModeratorApp/ClaimTableModerator';
import DeliveryTableModerator from './ModeratorApp/DeliveryTableModerator';
import MonthlyDataModerator from './ModeratorApp/MonthlyDataModerator';
import PaymentRecordsModerator from './ModeratorApp/PaymentRecordsModerator';
import ProfileModerator from './ModeratorApp/ProfileModerator'; 
import PolicyNewClientModerator from './ModeratorApp/PolicyNewClientModerator';
import VehicleDetailsModerator from './ModeratorApp/VehicleDetailsModerator';

import ModeratorClientCreationForm from './ModeratorApp/ModeratorForms/ModeratorClientCreationForm';

import ClientEditForm from "./AdminApp/AdminForms/ClientEditForm";

import ModeratorNewClientController from './ModeratorApp/ControllerModerator/ModeratorNewClientController';
import PolicyEditForm from './AdminApp/AdminForms/PolicyEditForm';

import ModeratorPolicyEditForm from './ModeratorApp/ModeratorForms/ModeratorPolicyEditForm';

import ModeratorClientEditForm from "./ModeratorApp/ModeratorForms/ModeratorClientEditForm";


import ModeratorPolicyNewClientForm from "./ModeratorApp/ModeratorForms/ModeratorPolicyNewClientForm";


import ModeratorNewPolicyController from './ModeratorApp/ControllerModerator/ModeratorNewPolicyController';



import ModeratorEditPolicyController from './ModeratorApp/ControllerModerator/ModeratorEditPolicyController';

function App() {
  return (
    
    <Routes>
      <Route path="/appinsurance" element={<LoginForm /> }/>

      <Route path="/appinsurance/MainAreaModerator" element={<MainAreaModerator /> }>
        <Route path="/appinsurance/MainAreaModerator/DashboardModerator" element={<DashboardModerator />} />
        <Route path ="/appinsurance/MainAreaModerator/ClientModerator" element={<ClientModerator />} />

         <Route path="/appinsurance/MainAreaModerator/ClientModerator/ModeratorClientCreationForm" element={<ModeratorNewClientController/>} />
       

        <Route path="/appinsurance/MainAreaModerator/DueModerator" element={<DueModerator />} />
        <Route path="/appinsurance/MainAreaModerator/PolicyModerator" element={<PolicyModerator />} />
      '
        <Route path="/appinsurance/MainAreaModerator/ClaimTableModerator" element={<ClaimTableModerator />} />
        <Route path="/appinsurance/MainAreaModerator/DeliveryTableModerator" element={<DeliveryTableModerator />} />
        <Route path="/appinsurance/MainAreaModerator/MonthlyDataModerator" element={<MonthlyDataModerator />} />
        <Route path="/appinsurance/MainAreaModerator/PaymentRecordsModerator" element={<PaymentRecordsModerator />} />
        <Route path="/appinsurance/MainAreaModerator/ProfileModerator" element={<ProfileModerator />} />

        <Route path="/appinsurance/MainAreaModerator/PolicyModerator/NewClientModerator" element={<PolicyNewClientModerator />} />
        <Route path="/appinsurance/MainAreaModerator/PolicyModerator/NewClientModerator/VehicleDetailsModerator" element={<VehicleDetailsModerator />} />


  
        <Route path="/appinsurance/MainAreaModerator/PolicyModerator/ModeratorPolicyNewClientForm" element={<ModeratorPolicyNewClientForm />} />

           <Route path="/appinsurance/MainAreaModerator/PolicyModerator/Edit/:policyId" element={<ModeratorEditPolicyController/>} />

           

    
        <Route path="/appinsurance/MainAreaModerator/PolicyModerator/ModeratorPolicyNewClienForm"element={<ModeratorNewPolicyController />} />
       
      
       <Route path="/appinsurance/MainAreaModerator/ClientModerator/ModeratorClientEditForm" element={<ModeratorClientEditForm />} />

        
    
        


        <Route path="*" element={<div>Page not found</div>} />  
      </Route>


      
      <Route path="/appinsurance/MainArea" element={<MainArea /> }> 
        <Route path="/appinsurance/MainArea/Dashboard" element={<Dashboard />} />


      
        <Route path="/appinsurance/MainArea/Client" element={<Client />} />
        
        <Route path="/appinsurance/MainArea/Client/ClientCreationForm" element={<NewClientController/>} />

        <Route path="/appinsurance/MainArea/Client/ClientEditForm" element={<ClientEditForm />} />
        <Route path="/appinsurance/MainArea/Due" element={<Due />} />
        <Route path="/appinsurance/MainArea/Policy" element={<Policy />} />
        <Route path="/appinsurance/MainArea/ClaimTable" element={<ClaimTable />} />
       
        <Route path="/appinsurance/MainArea/Delivery" element={<Delivery />} />
        <Route path="/appinsurance/MainArea/MonthlyData" element={<MonthlyDataController />}/>
        <Route path="/appinsurance/MainArea/PaymentRecords" element={<PaymentRecords />}/>
        <Route path="/appinsurance/MainArea/Profile" element={<Profile />} />
        
        <Route path="/appinsurance/MainArea/Policy/PolicyNewClient" element={<NewPolicyController />} />
        <Route path="/appinsurance/MainArea/Policy/Edit/:policyId" element={<EditPolicyController/>} />
        <Route path="/appinsurance/MainArea/Policy/PolicyNewClient/VehicleDetails" element={<VehicleDetails />} />

        <Route path="/appinsurance/MainArea/Policy/ListClient" element={<ListClient />} />
        <Route path="/appinsurance/MainArea/Policy/ListClient/EditClientForm" element={<EditClientForm />} />
        <Route path="/appinsurance/MainArea/Policy/ListClient/EditClientForm/EditVehicleDetailsForm" element={<EditVehicleDetailsForm />} />
        
       
        <Route path="*" element={<div>Page not found</div>} />  
        
      </Route>

    </Routes>
    
  );
  
}
export default App;
