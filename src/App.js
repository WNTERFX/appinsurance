import LoginForm from './LoginForm';
import MainArea from './MainArea';
import Dashboard from './Dashboard';
import Due from './Due';
import Policy from './Policy';
import Client from './Client';
import {Routes, Route, HashRouter } from "react-router-dom";

function App() {
  return (
    
    <Routes>
      <Route path="/appinsurance" element={<LoginForm /> }/>
      
      
      <Route path="/appinsurance/MainArea" element={<MainArea /> }> 
        <Route path="/appinsurance/MainArea/Dashboard" element={<Dashboard />} />
        <Route path="/appinsurance/MainArea/Client" element={<Client />} />
        <Route path="/appinsurance/MainArea/Due" element={<Due />} />
        <Route path="*" element={<div>Page not found</div>} />
      <Route path="/appinsurance/MainArea/Policy" element={<Policy />} />
      </Route>

    </Routes>
    
  );
  
   
}

export default App;