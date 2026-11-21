'use client';

import React from 'react';
import { useGateDesk } from '@/context/GateDeskContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGateDesk();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg shadow-lg border text-sm backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-slate-900/95 border-teal-500/40 text-white'
              : toast.type === 'error'
              ? 'bg-red-950/95 border-red-500/50 text-white'
              : 'bg-slate-900/95 border-slate-700 text-slate-200'
          }`}
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <h5 className="font-semibold text-xs sm:text-sm">{toast.title}</h5>
            {toast.message && (
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
