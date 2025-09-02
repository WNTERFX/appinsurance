import ReactDOM from "react-dom";
import "./styles/client-modal-styles.css";

export default function InfoModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times; 
        </button>
        {title && <h2>{title}</h2>}
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
