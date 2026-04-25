import React, { useState } from 'react';
import { Settings, Save, Shield, Sliders, Monitor, Zap } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import NotificationModal from '../components/NotificationModal';

const PreferencesPage: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'success' as any });

  const [prefs, setPrefs] = useState({
    default_marks: 1,
    default_negative: 0.25,
    default_duration: 15,
    enable_animations: true,
    high_performance: false
  });

  const handleSave = () => {
    // In a real app, this would persist to a backend or detailed localStorage
    setNotification({
      isOpen: true,
      title: "Sync Complete",
      message: "System preferences have been updated across all cores.",
      type: 'success'
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <NotificationModal 
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-main">
            System <span className="text-accent">Preferences</span>
          </h1>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mt-1 opacity-60">Control your engineering environment</p>
        </div>
        <button 
          onClick={handleSave}
          className="theme-button-primary flex items-center gap-2 px-8 py-3"
        >
          <Save size={18} />
          <span className="uppercase tracking-widest text-[10px]">Save Config</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: Visual Core */}
        <div className="theme-card p-8 space-y-6">
          <div className="flex items-center gap-3 text-accent mb-4">
            <Monitor size={20} />
            <h2 className="font-black uppercase tracking-widest text-sm">Visual Core</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-muted mb-2 tracking-widest">Active System Theme</label>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="theme-input w-full font-bold uppercase text-xs"
              >
                <option value="light">Light Protocol</option>
                <option value="dark">AMOLED Dark</option>
                <option value="animated-dark">Animated Spectrum</option>
                <option value="solo-leveling">Monarch Shadow</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-main/30 rounded-2xl border border-theme">
              <span className="text-xs font-bold uppercase tracking-tight text-main">Interface Animations</span>
              <button 
                onClick={() => setPrefs(p => ({ ...p, enable_animations: !p.enable_animations }))}
                className={`w-12 h-6 rounded-full transition-all p-1 ${prefs.enable_animations ? 'bg-accent' : 'bg-zinc-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-all ${prefs.enable_animations ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Generation Engine */}
        <div className="theme-card p-8 space-y-6">
          <div className="flex items-center gap-3 text-accent mb-4">
            <Zap size={20} />
            <h2 className="font-black uppercase tracking-widest text-sm">Engine Defaults</h2>
          </div>

          <div className="space-y-4">
             {[
               { label: 'Base Marks', key: 'default_marks' },
               { label: 'Penalty Factor', key: 'default_negative' },
               { label: 'Standard Timer (Mins)', key: 'default_duration' }
             ].map(item => (
               <div key={item.key}>
                 <label className="block text-[10px] font-black uppercase text-muted mb-2 tracking-widest">{item.label}</label>
                 <input 
                   type="number" 
                   value={(prefs as any)[item.key]}
                   onChange={(e) => setPrefs(p => ({ ...p, [item.key]: parseFloat(e.target.value) }))}
                   className="theme-input w-full font-black text-sm"
                 />
               </div>
             ))}
          </div>
        </div>

        {/* Section 3: Security & Privacy */}
        <div className="theme-card p-8 space-y-6 md:col-span-2">
          <div className="flex items-center gap-3 text-accent mb-4">
            <Shield size={20} />
            <h2 className="font-black uppercase tracking-widest text-sm">Security Matrix</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 flex flex-col justify-between">
              <div>
                <h3 className="text-red-500 font-black uppercase tracking-tighter text-xs mb-2">Purge Local Data</h3>
                <p className="text-[10px] text-muted font-medium leading-relaxed mb-6">Instantly clear all cached quizzes, themes, and session identities.</p>
              </div>
              <button className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all">Execute Purge</button>
            </div>

            <div className="p-6 rounded-3xl bg-main border border-theme flex flex-col justify-between">
              <div>
                <h3 className="text-main font-black uppercase tracking-tighter text-xs mb-2">System Diagnostics</h3>
                <p className="text-[10px] text-muted font-medium leading-relaxed mb-6">Check connection integrity with BrainWave backend clusters.</p>
              </div>
              <button className="w-full py-3 border border-theme text-main rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-main transition-all">Run Diagnostics</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
