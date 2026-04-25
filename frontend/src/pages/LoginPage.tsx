import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Rocket, Sparkles, User, Mail, Lock, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import NotificationModal from '../components/NotificationModal';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const setDemoMode = useAuthStore((state) => state.setDemoMode);

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({ 
    isOpen: false, 
    title: '', 
    message: '', 
    type: 'error' 
  });

  const from = (location.state as any)?.from?.pathname || "/";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
        navigate(from, { replace: true });
      } else {
        await register(username, password, fullName);
        setNotification({ 
          isOpen: true, 
          title: "Registration Success", 
          message: "Account created! You can now log in.", 
          type: 'success' 
        });
        setIsLogin(true);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Authentication sequence failed. Check credentials.";
      setNotification({ 
        isOpen: true, 
        title: "Access Denied", 
        message: msg, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTryDemo = () => {
    setDemoMode(true);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <NotificationModal 
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-accent text-[var(--text-accent)] rounded-3xl mb-6 shadow-2xl rotate-3">
            <Rocket size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-2 text-main">
            Brain<span className="text-accent">Wave</span>
          </h1>
          <p className="text-muted font-bold tracking-widest text-[10px] uppercase opacity-60">AI Powered Quiz Engineering</p>
        </div>

        <div className="theme-card p-1 relative overflow-hidden mb-6 flex bg-main/50 border border-theme rounded-2xl">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${isLogin ? 'bg-card text-accent shadow-lg border border-theme' : 'text-muted hover:text-main'}`}
            >
              Session Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${!isLogin ? 'bg-card text-accent shadow-lg border border-theme' : 'text-muted hover:text-main'}`}
            >
              New Registry
            </button>
        </div>

        <div className="theme-card p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
          
          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Legal Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="theme-input w-full pl-12 font-bold"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Identity (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="email" 
                  placeholder="admin@example.com"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="theme-input w-full pl-12 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="theme-input w-full pl-12 font-bold"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="theme-button-primary w-full py-4 flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isLogin ? <LogIn size={20} /> : <UserPlus size={20} />
              )}
              <span className="uppercase tracking-widest text-xs">
                {loading ? 'Processing...' : (isLogin ? 'Initialize Session' : 'Create Account')}
              </span>
            </button>
          </form>

          {isLogin && (
            <div className="mt-8 pt-8 border-t border-theme flex flex-col gap-4 text-center">
              <p className="text-[10px] text-muted font-bold uppercase mb-2">Dev Access: admin@example.com / admin123</p>
              <button 
                onClick={handleTryDemo}
                className="w-full py-4 rounded-2xl bg-main/50 border border-theme text-main font-black uppercase tracking-widest text-[10px] hover:bg-main transition-all flex items-center justify-center gap-2 group"
              >
                <Sparkles size={14} className="text-accent group-hover:animate-spin" />
                Try Demo Mode
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
