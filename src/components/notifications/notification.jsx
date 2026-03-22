import { useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";

export const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700"
  };

  const icon = {
    success: <FiCheckCircle className="text-green-500" size={20} />,
    error: <FiXCircle className="text-red-500" size={20} />,
    warning: <FiAlertCircle className="text-yellow-500" size={20} />
  };

  return (
    <div className={`fixed top-4 right-4 border-l-4 ${bgColor[type]} p-4 rounded shadow-lg max-w-sm flex items-start z-50`}>
      <div className="mr-3 mt-0.5">
        {icon[type]}
      </div>
      <div className="flex-1">
        <p className="font-medium">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="ml-2 text-gray-500 hover:text-gray-700"
      >
        <FiXCircle size={18} />
      </button>
    </div>
  );
};