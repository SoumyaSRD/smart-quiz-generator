import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  User,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { ThemeToggle } from './ThemeToggle';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isDemoMode } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Generator', path: '/' },
    { icon: HelpCircle, label: 'How it works', path: '/help' },
    { icon: Settings, label: 'Preferences', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div 
      className={`fixed top-0 left-0 h-full border-r border-theme bg-card/40 backdrop-blur-3xl transition-all duration-500 z-[150] flex flex-col ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Sidebar Toggle - Placed outside the main container flow to avoid clipping */}
      <button 
        onClick={() => setIsOpen(!isCollapsed)}
        className="absolute -right-3 top-12 w-8 h-8 bg-accent text-[var(--text-accent)] rounded-full flex items-center justify-center shadow-2xl z-[160] hover:scale-110 active:scale-95 transition-all border border-white/20"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Profile Section - Only show for authenticated users */}
      {!isDemoMode && (
        <div className="p-6 mb-4 mt-4">
          <div className={`flex items-center gap-4 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent ring-2 ring-accent/10 flex-shrink-0">
              <User size={20} />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h3 className="text-sm font-black text-main truncate uppercase tracking-tighter italic">
                  {user?.full_name}
                </h3>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest opacity-60 truncate">
                  {user?.username}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Demo Badge for Demo users */}
      {isDemoMode && !isCollapsed && (
        <div className="px-6 py-8">
           <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 text-center">
             <Zap size={20} className="mx-auto text-accent mb-2 animate-pulse" />
             <p className="text-[10px] font-black text-accent uppercase tracking-widest">Demo Session</p>
           </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-grow px-4 space-y-2 mt-4">
        {!isCollapsed && (
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted mb-4 ml-4 opacity-40">System Core</p>
        )}
        {menuItems
          .filter(item => !isDemoMode || item.path === '/' || item.path === '/help') // Filter items for demo
          .map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all group relative ${
              location.pathname === item.path 
                ? 'bg-accent/10 text-accent border border-accent/20' 
                : 'hover:bg-main/40 text-muted border border-transparent'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <item.icon size={20} className={location.pathname === item.path ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
            {!isCollapsed ? (
              <span className="font-extrabold text-xs uppercase tracking-widest">{item.label}</span>
            ) : (
              /* Floating Tooltip when collapsed */
              <div className="absolute left-full ml-4 px-3 py-2 bg-accent text-[var(--text-accent)] text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-2xl z-[200]">
                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-accent rotate-45" />
                {item.label}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-4 mt-auto border-t border-theme">
        <div className={`flex flex-col gap-3 ${isCollapsed ? 'items-center' : ''}`}>
          {!isCollapsed && (
             <div className="flex items-center justify-between px-2 mb-2">
               <span className="text-[9px] font-black uppercase tracking-widest text-muted opacity-40 italic">Visual Sync</span>
               <ThemeToggle />
             </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 group relative ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={20} />
            {!isCollapsed ? (
              <span className="font-extrabold text-xs uppercase tracking-widest">Logout</span>
            ) : (
              /* Floating Tooltip when collapsed */
              <div className="absolute left-full ml-4 px-3 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-2xl z-[200]">
                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rotate-45" />
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
