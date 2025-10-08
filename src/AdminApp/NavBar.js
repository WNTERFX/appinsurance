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
          <Link to="/appinsurance/MainArea/Dashboard" className={"side-bar-item" + (isActive("/appinsurance/MainArea/Dashboard") ? " active" : "")}>
            <div className="side-bar-label">
              <LuLayoutDashboard className="side-bar-icon" />
              <span>Dashboard</span>
            </div>
          </Link>

          <Link to="/appinsurance/MainArea/Client" className={"side-bar-item" + (isActive("/appinsurance/MainArea/Client") ? " active" : "")}>
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


          <Link to="/appinsurance/MainArea/Policy" className={"side-bar-item" + (isActive("/appinsurance/MainArea/Policy") ? " active" : "")}>
            <div className="side-bar-label">
              <LuFolder className="side-bar-icon" />
              <span>Policy</span>
            </div>
          </Link>

          <Link to="/appinsurance/MainArea/ClaimTable" className={"side-bar-item" + (isActive("/appinsurance/MainArea/ClaimTable") ? " active" : "")}>
            <div className="side-bar-label">
              <LuClipboard className="side-bar-icon" />
              <span>Claims</span>
            </div>
          </Link>

          <Link to="/appinsurance/MainArea/Delivery" className={"side-bar-item" + (isActive("/appinsurance/MainArea/Delivery") ? " active" : "")}>
            <div className="side-bar-label">
              <LuMail className="side-bar-icon" />
              <span>Deliveries</span>
            </div>
          </Link>

          <Link to="/appinsurance/MainArea/MonthlyData" className={"side-bar-item" + (isActive("/appinsurance/MainArea/MonthlyData") ? " active" : "")}>
            <div className="side-bar-label">
              <LuActivity className="side-bar-icon" />
              <span>Reports</span>
            </div>
          </Link>

          <Link to="/appinsurance/MainArea/PaymentRecords" className={"side-bar-item" + (isActive("/appinsurance/MainArea/PaymentRecords") ? " active" : "")}>
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


          <Link to="/appinsurance/MainArea/AccountManagement" className={"side-bar-item" + (isActive("/appinsurance/MainArea/AccountManagement") ? " active" : "")}>
            <div className="side-bar-label">
              <LuSettings className="side-bar-icon" />
              <span>Manage Users</span>
            </div>
          </Link>
        </div>

        {/* --- BOTTOM LINKS --- */}
        <div className="side-bar bottom-links">
          <Link to="/appinsurance/MainArea/Profile" className="side-bar-item">
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
