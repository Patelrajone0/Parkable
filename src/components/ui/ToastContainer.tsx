'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm ml-auto">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              isSuccess
                ? 'bg-[#181512]/95 text-[#f6f2ec] border-[#dfba89]/40 shadow-black/50'
                : isError
                ? 'bg-[#1c1212]/95 text-[#f6f2ec] border-rose-500/40 shadow-black/50'
                : isWarning
                ? 'bg-[#1c1710]/95 text-[#f6f2ec] border-[#d4a373]/40 shadow-black/50'
                : 'bg-[#181512]/95 text-[#f6f2ec] border-[#383028] shadow-black/50'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#dfba89]" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-[#d4a373]" />}
              {isInfo && <Info className="w-5 h-5 text-[#dfba89]" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm leading-tight text-[#f6f2ec]">{toast.title}</div>
              {toast.description && (
                <div className="text-xs mt-1 text-[#a89682] leading-snug">{toast.description}</div>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 text-[#756758] hover:text-[#dfba89] rounded-lg hover:bg-[#241f1a] transition"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
