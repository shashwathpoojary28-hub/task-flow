import React from 'react';
import { useTasks } from '../context/TaskContext';
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast() {
  const { toasts, removeToast } = useTasks();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isInfo = toast.type === 'info';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl glass-panel shadow-xl border border-slate-200/80 dark:border-slate-800/80"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
                {isSuccess && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                )}
                {isError && (
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                )}
                {isInfo && (
                  <Info className="w-5 h-5 text-brand-500 flex-shrink-0" />
                )}
                <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                  {toast.message}
                </span>
              </div>

              <div className="flex items-center space-x-1.5 flex-shrink-0">
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action.onClick();
                      removeToast(toast.id);
                    }}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 transition-colors"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>{toast.action.label || 'Undo'}</span>
                  </button>
                )}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
