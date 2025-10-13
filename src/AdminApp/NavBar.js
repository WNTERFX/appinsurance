import "./styles/nav-styles.css";
import { Link, useLocation } from "react-router-dom";
import { LuLayoutDashboard, LuUser, LuClipboard, LuMail, LuFolder, LuCreditCard, LuSettings, LuActivity, LuInfo } from "react-icons/lu";
import "./images/logo_.png"

export default function NavBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (

    <div className="nav-bar">
      <div className="logo-container">
              <img className="nav-logo-img" src={require("./images/logo_.png")} alt="silverstar_insurance_inc_Logo" />
        <h1 className="logo">Silverstar Insurance</h1>
      </div>


        {/* Divider line */}
      <hr className="nav-divider" />

      <div className="side-bar-container">
        {/* --- TOP LINKS --- */}
        <div className="side-bar top-links">
          <Link to="/appinsurance/main-app/dashboard" className={"side-bar-item" + (isActive("/appinsurance/main-app/dashboard") ? " active" : "")}>
            <div className="side-bar-label">
              <LuLayoutDashboard className="side-bar-icon" />
              <span>Dashboard</span>
            </div>
          </Link>

          <Link to="/appinsurance/main-app/client" className={"side-bar-item" + (isActive("/appinsurance/main-app/client") ? " active" : "")}>
            <div className="side-bar-label">
              <LuUser className="side-bar-icon" />
              <span>Clients</span>
            </div>
          </Link>

        {/*<Link to="/appinsurance/MainArea/Due" className={"side-bar-item" + (isActive("/appinsurance/MainArea/Due") ? " active" : "")}>
        {isMinimize ? (
          <LuCalendarArrowUp />
        ) : (
          <div className="side-bar-label">
            <LuCalendarArrowUp className="side-bar-icon" />
            <span>Due</span>
         </div>
        )}   
      </Link>*/}


          <Link to="/appinsurance/main-app/policy" className={"side-bar-item" + (isActive("/appinsurance/main-app/policy") ? " active" : "")}>
            <div className="side-bar-label">
              <LuFolder className="side-bar-icon" />
              <span>Policy</span>
            </div>
          </Link>

          <Link to="/appinsurance/main-app/claim" className={"side-bar-item" + (isActive("/appinsurance/main-app/claim") ? " active" : "")}>
            <div className="side-bar-label">
              <LuClipboard className="side-bar-icon" />
              <span>Claims</span>
            </div>
          </Link>

          <Link to="/appinsurance/main-app/delivery" className={"side-bar-item" + (isActive("/appinsurance/main-app/delivery") ? " active" : "")}>
            <div className="side-bar-label">
              <LuMail className="side-bar-icon" />
              <span>Deliveries</span>
            </div>
          </Link>

          <Link to="/appinsurance/main-app/records" className={"side-bar-item" + (isActive("/appinsurance/main-app/records") ? " active" : "")}>
            <div className="side-bar-label">
              <LuActivity className="side-bar-icon" />
              <span>Reports</span>
            </div>
          </Link>

          <Link to="/appinsurance/main-app/payment-records" className={"side-bar-item" + (isActive("/appinsurance/main-app/payment-records") ? " active" : "")}>
            <div className="side-bar-label">
              <LuCreditCard className="side-bar-icon" />
              <span>Payments</span>
            </div>
          </Link>

        {/*<Link to="/appinsurance/MainArea/Profile" className={"side-bar-item" + (isActive("/appinsurance/MainArea/Profile") ? " active" : "")}>
        {isMinimize ? (
         <LuSettings />
        ) : (
          <div className="side-bar-label">
            <LuSettings className="side-bar-icon" />
            <span className="side-bar-name" >Profile</span>
          </div>
        )}
      </Link>
         */}

          
         <Link to="/appinsurance/main-app/admin-controls" className={"side-bar-item" + (isActive("/appinsurance/main-app/admin-controls") ? " active" : "")}>
          <div className="side-bar-label">
            <LuSettings className="side-bar-icon" />
            <span>Admin Controls</span>
          </div>
        </Link>


          <Link to="/appinsurance/main-app/account-management" className={"side-bar-item" + (isActive("/appinsurance/main-app/account-management") ? " active" : "")}>
            <div className="side-bar-label">
              <LuSettings className="side-bar-icon" />
              <span>Manage Users</span>
            </div>
          </Link>
        </div>

        {/* --- BOTTOM LINKS --- */}
        <div className="side-bar bottom-links">
          <Link to="/appinsurance/main-app/about" className="side-bar-item">
            <div className="side-bar-label">
              <LuInfo className="side-bar-icon" />
              <span>About</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
