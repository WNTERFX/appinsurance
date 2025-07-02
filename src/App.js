import LoginForm from './LoginForm';
import MainArea from './MainArea';
import Dashboard from './Dashboard';
import Due from './Due';
import Policy from './Policy';
import ClaimTable from './ClaimTable';
import DeliveryTable from './DeliveryTable';
import Client from './Client';
import MonthlyData from './MonthlyData';
import PaymentRecords from './PaymentRecords';
import NewClient from './Policy-new-client';
import VehicleDetails from './VehicleDetails';
import ListClient from './ListClient';
import EditClientForm from './EditClientForm';
import EditVehicleDetailsForm from './EditVehicleDetailsForm';
import {Routes, Route} from "react-router-dom";
import Profile from './Profile';

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
function App() {
  return (
    
    <Routes>
      <Route path="/appinsurance" element={<LoginForm /> }/>

      <Route path="/appinsurance/MainAreaModerator" element={<MainAreaModerator /> }>
        <Route path="/appinsurance/MainAreaModerator/DashboardModerator" element={<DashboardModerator />} />
        <Route path ="/appinsurance/MainAreaModerator/ClientModerator" element={<ClientModerator />} />
        <Route path="/appinsurance/MainAreaModerator/DueModerator" element={<DueModerator />} />
        <Route path="/appinsurance/MainAreaModerator/PolicyModerator" element={<PolicyModerator />} />
        <Route path="/appinsurance/MainAreaModerator/ClaimTableModerator" element={<ClaimTableModerator />} />
        <Route path="/appinsurance/MainAreaModerator/DeliveryTableModerator" element={<DeliveryTableModerator />} />
        <Route path="/appinsurance/MainAreaModerator/MonthlyDataModerator" element={<MonthlyDataModerator />} />
        <Route path="/appinsurance/MainAreaModerator/PaymentRecordsModerator" element={<PaymentRecordsModerator />} />
        <Route path="/appinsurance/MainAreaModerator/ProfileModerator" element={<ProfileModerator />} />
        <Route path="*" element={<div>Page not found</div>} />  
      </Route>


      
      <Route path="/appinsurance/MainArea" element={<MainArea /> }> 
        <Route path="/appinsurance/MainArea/Dashboard" element={<Dashboard />} />
        <Route path="/appinsurance/MainArea/Client" element={<Client />} />
        <Route path="/appinsurance/MainArea/Due" element={<Due />} />
        <Route path="/appinsurance/MainArea/Policy" element={<Policy />} />
        <Route path="/appinsurance/MainArea/ClaimTable" element={<ClaimTable />} />
        <Route path="/appinsurance/MainArea/DeliveryTable" element={<DeliveryTable />} />
        <Route path="/appinsurance/MainArea/MonthlyData" element={<MonthlyData />}/>
        <Route path="/appinsurance/MainArea/PaymentRecords" element={<PaymentRecords />}/>
        <Route path="/appinsurance/MainArea/Profile" element={<Profile />} />
        
        <Route path="/appinsurance/MainArea/Policy/NewClient" element={<NewClient />} />
        <Route path="/appinsurance/MainArea/Policy/NewClient/VehicleDetails" element={<VehicleDetails />} />

        <Route path="/appinsurance/MainArea/Policy/ListClient" element={<ListClient />} />
        <Route path="/appinsurance/MainArea/Policy/ListClient/EditClientForm" element={<EditClientForm />} />
        <Route path="/appinsurance/MainArea/Policy/ListClient/EditClientForm/EditVehicleDetailsForm" element={<EditVehicleDetailsForm />} />
     
        <Route path="*" element={<div>Page not found</div>} />  
      </Route>

    </Routes>
    
  );
  
}
export default App;