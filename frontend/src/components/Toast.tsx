import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((msg: string, dur?: number) => addToast(msg, 'success', dur), [addToast]);
  const error = useCallback((msg: string, dur?: number) => addToast(msg, 'error', dur), [addToast]);
  const warning = useCallback((msg: string, dur?: number) => addToast(msg, 'warning', dur), [addToast]);
  const info = useCallback((msg: string, dur?: number) => addToast(msg, 'info', dur), [addToast]);

  const value = {
    toast: addToast,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let icon = <Info className="w-5 h-5 text-blue-400" />;
            let styles = "bg-slate-900/90 border-slate-700/50 text-slate-100";
            
            if (t.type === 'success') {
              icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
              styles = "bg-emerald-950/95 border-emerald-800/30 text-emerald-100 shadow-lg shadow-emerald-950/20";
            } else if (t.type === 'error') {
              icon = <XCircle className="w-5 h-5 text-rose-400" />;
              styles = "bg-rose-950/95 border-rose-800/30 text-rose-100 shadow-lg shadow-rose-950/20";
            } else if (t.type === 'warning') {
              icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
              styles = "bg-amber-950/95 border-amber-800/30 text-amber-100 shadow-lg shadow-amber-950/20";
            } else if (t.type === 'info') {
              icon = <Info className="w-5 h-5 text-sky-400" />;
              styles = "bg-sky-950/95 border-sky-800/30 text-sky-100 shadow-lg shadow-sky-950/20";
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.85, filter: 'blur(4px)', transition: { duration: 0.15 } }}
                layout
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 ${styles}`}
              >
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <div className="flex-grow text-sm font-medium leading-5 whitespace-pre-line">{t.message}</div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
