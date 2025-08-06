export default function PopupMenu(props) {
  return (props.isOpen && props.onClose) ? (
    
    <div className="popup-login-menu">
        <div class className="popup-inner"></div>
        <div className="popup-content">
          <h2>{props.title}</h2>
          <button className="admin-button" onClick={props.onAdminClick}>Admin</button>
          <button className="Moderator-button" onClick={props.onUserClick}>Moderator</button>
          <button className="close-button" onClick={props.onClose}>X</button>
        </div>
    </div>
  ) : "";
}