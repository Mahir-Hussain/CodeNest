import '../css/Alert.css';

function Alert({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="custom-alert">
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
  );
}

export default Alert;