"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface Alert {
  id: string;
  message: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = useCallback((message: string, type: AlertType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setAlerts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 4000);
  }, []);

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const getAlertStyles = (type: AlertType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50/95 border-emerald-500/30 text-emerald-950',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
        };
      case 'error':
        return {
          bg: 'bg-rose-50/95 border-rose-500/30 text-rose-950',
          icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-50/95 border-amber-500/30 text-amber-950',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-sky-50/95 border-sky-500/30 text-sky-950',
          icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
        };
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      
      {/* Toast Alert Portal Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {alerts.map((alert) => {
            const styles = getAlertStyles(alert.type);
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`flex items-start justify-between p-4 rounded-2xl border backdrop-blur-md shadow-elevated pointer-events-auto ${styles.bg}`}
              >
                <div className="flex items-start space-x-3">
                  {styles.icon}
                  <p className="text-xs font-semibold leading-relaxed pt-0.5">{alert.message}</p>
                </div>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                >
                  <X className="w-3.5 h-3.5 opacity-60 hover:opacity-90" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
