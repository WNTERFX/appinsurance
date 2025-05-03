import LoginForm from './LoginForm';
import MainArea from './MainArea';
import Dashboard from './Dashboard';
import Due from './Due';
import Policy from './Policy';
import Client from './Client';
import NewClient from './Policy-new-client';
import VehicleDetails from './VehicleDetails';
import ListClient from './ListClient';
import EditClientForm from './EditClientForm';
import EditVehicleDetailsForm from './EditVehicleDetailsForm';
import {Routes, Route} from "react-router-dom";


function App() {
  return (
    
    <Routes>
      <Route path="/appinsurance" element={<LoginForm /> }/>
      
      <Route path="/appinsurance/MainArea" element={<MainArea /> }> 
        <Route path="/appinsurance/MainArea/Dashboard" element={<Dashboard />} />
        <Route path="/appinsurance/MainArea/Client" element={<Client />} />
        <Route path="/appinsurance/MainArea/Due" element={<Due />} />
        <Route path="/appinsurance/MainArea/Policy" element={<Policy />} />
        
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