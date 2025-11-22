
import React, { useEffect } from 'react';
import { SystemNotification } from '../types';

interface NotificationSystemProps {
  notifications: SystemNotification[];
  onDismiss: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onDismiss }) => {
  // Auto-dismiss logic
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        const oldest = notifications[0];
        if (oldest.type !== 'CRITICAL') {
          onDismiss(oldest.id);
        }
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notifications, onDismiss]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-[100] w-80 space-y-4 pointer-events-none">
      {notifications.map((note) => (
        <div 
          key={note.id}
          className={`
            pointer-events-auto relative overflow-hidden p-4 shadow-2xl 
            border-l-4 transition-all duration-500 animate-slideIn bg-brand-surface/90 backdrop-blur-xl
            ${note.type === 'CRITICAL' ? 'border-danger shadow-[0_0_15px_rgba(255,68,68,0.3)]' : ''}
            ${note.type === 'WARNING' ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : ''}
            ${note.type === 'INFO' ? 'border-brand-primary shadow-[0_0_15px_rgba(0,229,255,0.3)]' : ''}
          `}
        >
          {/* Scanline effect overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-1">
            <h4 className={`
              text-xs font-bold uppercase tracking-widest flex items-center gap-2
              ${note.type === 'CRITICAL' ? 'text-danger animate-pulse' : ''}
              ${note.type === 'WARNING' ? 'text-yellow-500' : ''}
              ${note.type === 'INFO' ? 'text-brand-primary' : ''}
            `}>
              <span>{note.type === 'INFO' ? 'ℹ' : note.type === 'WARNING' ? '⚠' : '☣'}</span>
              {note.title}
            </h4>
            <button 
              onClick={() => onDismiss(note.id)}
              className="text-[10px] text-brand-text-dim hover:text-brand-secondary uppercase transition-colors"
            >
              CERRAR
            </button>
          </div>
          
          <p className="text-sm text-brand-text font-mono leading-tight mt-2 border-t border-brand-line pt-2">
            {note.message}
          </p>
          
          <div className="mt-2 text-[8px] text-brand-text-dim font-mono text-right">
            SINAPPTRON_ALERT_SYSTEM // {note.timestamp}
          </div>
        </div>
      ))}
      
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;