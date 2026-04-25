import React, { useState } from 'react';
import { Palette, X, Sun, Moon, Zap, Ship, Ghost, Waves, Mountain, Trees, Droplets, Wind } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { ThemeType } from '../context/ThemeContext';

export const ThemeOffcanvas: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const themeGroups = [
    {
      title: "Core",
      items: [
        { id: 'light' as ThemeType, label: 'Light Mode', icon: Sun, color: 'bg-white text-gray-900 border-gray-200' },
        { id: 'dark' as ThemeType, label: 'Dark Mode', icon: Moon, color: 'bg-gray-800 text-white border-gray-700' },
      ]
    },
    {
      title: "Anime & Action",
      items: [
        { id: 'solo-leveling' as ThemeType, label: 'Solo Leveling', icon: Zap, color: 'bg-indigo-900 text-purple-100 border-purple-800' },
        { id: 'one-piece' as ThemeType, label: 'One Piece', icon: Ship, color: 'bg-orange-100 text-orange-900 border-orange-200' },
        { id: 'batman' as ThemeType, label: 'The Batman', icon: Ghost, color: 'bg-black text-yellow-400 border-gray-800' },
      ]
    },
    {
      title: "Nature Collection",
      items: [
        { id: 'nature-sea' as ThemeType, label: 'Deep Sea', icon: Waves, color: 'bg-cyan-900 text-cyan-50 border-cyan-800' },
        { id: 'nature-hill' as ThemeType, label: 'Green Hills', icon: Trees, color: 'bg-lime-100 text-lime-900 border-lime-200' },
        { id: 'nature-mountain' as ThemeType, label: 'Cold Mountain', icon: Mountain, color: 'bg-slate-200 text-slate-900 border-slate-300' },
        { id: 'nature-river' as ThemeType, label: 'Blue River', icon: Wind, color: 'bg-blue-500 text-white border-blue-600' },
        { id: 'nature-waterfall' as ThemeType, label: 'Waterfall', icon: Droplets, color: 'bg-sky-100 text-sky-900 border-sky-200' },
      ]
    }
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 rounded-xl bg-accent text-white hover:opacity-90 transition-all shadow-lg flex items-center justify-center"
        title="Change Theme"
      >
        <Palette size={22} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-opacity animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-[350px] bg-card border-l border-theme z-[101] shadow-2xl transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
        <div className="p-6 border-b border-theme flex justify-between items-center sticky top-0 bg-card z-10 backdrop-blur-xl">
          <h2 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
            <Palette className="text-accent" /> UI Customs
          </h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-main rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-10">
          {themeGroups.map((group, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1">{group.title}</h3>
              <div className="grid grid-cols-1 gap-3">
                {group.items.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all group relative overflow-hidden ${
                      theme === t.id 
                        ? 'border-accent ring-4 ring-accent/10' 
                        : 'border-transparent hover:border-accent/30 bg-main/50'
                    } ${t.color}`}
                  >
                    <div className={`p-2 rounded-lg ${theme === t.id ? 'bg-accent text-white' : 'bg-white/10'}`}>
                      <t.icon size={20} />
                    </div>
                    <span className="font-extrabold text-sm uppercase tracking-tight">{t.label}</span>
                    
                    {theme === t.id && (
                      <div className="ml-auto animate-pulse">
                        <Zap size={14} className="fill-current" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 border-t border-theme text-[10px] font-black uppercase tracking-widest text-center text-muted opacity-50">
          Quiz Generator v2.0 • Premium Themes
        </div>
      </div>
    </>
  );
};
