import React from 'react';

interface ToastProps {
  message: string | null;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#353028] text-[#faefe4] rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3 border border-[#8e7067]/40">
        <span className="material-symbols-outlined text-[#ffb59e] text-[24px] shrink-0">
          task_alt
        </span>
        <p className="text-[13px] font-medium leading-snug flex-1">
          {message}
        </p>
      </div>
    </div>
  );
};
