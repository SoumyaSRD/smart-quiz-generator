import React from 'react';
import { Info, AlertCircle, CheckCircle2, X } from 'lucide-react';

export type NotificationType = 'info' | 'error' | 'success' | 'warning';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: NotificationType;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info' 
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    info: { icon: Info, color: 'text-accent', bg: 'bg-accent/20', accent: 'border-accent/50' },
    error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/20', accent: 'border-red-500/50' },
    success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/20', accent: 'border-green-500/50' },
    warning: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/20', accent: 'border-orange-500/50' },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className={`relative w-full max-w-sm bg-card/80 backdrop-blur-2xl border ${config.accent} rounded-[2rem] p-8 shadow-2xl transform animate-in zoom-in-95 duration-300 text-center`}>
        <div className={`w-16 h-16 rounded-2xl ${config.bg} flex items-center justify-center mb-6 ${config.color} mx-auto ring-8 ${config.bg}/5`}>
          <Icon size={32} />
        </div>
        
        <h2 className="text-2xl font-black text-main mb-2 uppercase tracking-tighter italic">
          {title}
        </h2>
        
        <p className="text-muted font-medium mb-8 leading-relaxed">
          {message}
        </p>
        
        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl bg-accent text-[var(--text-accent)] font-black uppercase tracking-widest text-xs transition-all hover:opacity-90 active:scale-95"
        >
          Dismiss
        </button>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-muted/40 hover:text-muted transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;
