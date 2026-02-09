import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <FaCheckCircle />,
    error: <FaTimesCircle />,
    info: <FaInfoCircle />,
    warning: <FaExclamationTriangle />
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{icons[type] || icons.success}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>
        <FaTimesCircle />
      </button>
    </div>
  );
};

export default Toast;
