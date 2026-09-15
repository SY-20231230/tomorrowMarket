import React, { createContext, useContext, useState, ReactNode } from 'react';
import './ToastContext.css';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // 3초 후 자동 삭제
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-message toast-${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '🚨'}
              {toast.type === 'info' && '💡'}
            </span>
            <span className="toast-text">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
