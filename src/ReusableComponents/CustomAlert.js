export function CustomAlert({ message, type, onClose }) {
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const alertStyle = {
    padding: '20px 30px',
    borderRadius: '8px',
    color: type === 'error' ? '#721c24' : '#155724',
    backgroundColor: type === 'error' ? '#f8d7da' : '#d4edda',
    border: type === 'error' ? '2px solid #f5c6cb' : '2px solid #c3e6cb',
    minWidth: '300px',
    maxWidth: '500px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    animation: 'slideIn 0.3s ease-out',
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: type === 'error' ? '#721c24' : '#155724',
    fontWeight: 'bold',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={alertStyle} onClick={(e) => e.stopPropagation()}>
        {message}
      </div>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateY(-50px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}