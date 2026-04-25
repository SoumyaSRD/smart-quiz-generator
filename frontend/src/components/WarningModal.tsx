import React from 'react';
import { AlertTriangle, XCircle, LogOut } from 'lucide-react';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
}

const WarningModal: React.FC<WarningModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = "Exit Quiz",
  cancelText = "Stay & Finish",
  type = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop with heavy blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Glassmorphism Modal */}
      <div className="relative w-full max-w-md bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl transform animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl ${type === 'danger' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'} flex items-center justify-center mb-6 ring-8 ${type === 'danger' ? 'ring-red-500/5' : 'ring-orange-500/5'}`}>
            <AlertTriangle size={32} />
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">
            {title}
          </h2>
          
          <p className="text-white/60 font-medium mb-8 leading-relaxed">
            {message}
          </p>
          
          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onConfirm}
              className={`w-full py-4 rounded-xl ${type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'} text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group`}
            >
              <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
              {confirmText}
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-black uppercase tracking-widest text-xs transition-all border border-white/10"
            >
              {cancelText}
            </button>
          </div>
        </div>
        
        {/* Close icon for quick dismissal */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-white/20 hover:text-white/60 transition-colors"
        >
          <XCircle size={20} />
        </button>
      </div>
    </div>
  );
};

export default WarningModal;
