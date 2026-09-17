import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Server, 
  HardDriveDownload 
} from 'lucide-react';

export default function Header() {
  const { theme, toggleTheme, isDark, soundEnabled, toggleSound } = useTheme();
  const { setIsFormOpen, setTaskToEdit, isOnline, stats } = useTasks();

  const handleOpenAddModal = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/60 dark:border-slate-800/80 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 shadow-lg shadow-brand-500/25 text-white transform hover:scale-105 transition-transform duration-300">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-indigo-700 dark:from-white dark:via-brand-300 dark:to-indigo-300 bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <span>{todayFormatted}</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="flex items-center text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
                <Sparkles className="w-3 h-3 mr-0.5 inline" /> {stats.completed}/{stats.total} done
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls & Toggles */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Online/Offline Status Indicator */}
          <div 
            title={isOnline ? "Connected to Express & SQLite backend" : "Offline mode: Saving to LocalStorage"}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <Server className="w-3.5 h-3.5 text-emerald-500 ml-0.5" />
                <span className="text-[11px]">SQLite Sync</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <HardDriveDownload className="w-3.5 h-3.5 text-amber-500 ml-0.5" />
                <span className="text-[11px]">Local Mode</span>
              </>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? "Disable audio cues" : "Enable audio cues"}
            title={soundEnabled ? "Audio Cues Enabled" : "Audio Muted"}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-brand-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Add Task Primary Action Button */}
          <button
            onClick={handleOpenAddModal}
            className="group relative inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:via-indigo-500 hover:to-purple-500 shadow-md shadow-brand-500/20 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <Plus className="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
            <span>New Task</span>
            <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-white/20 rounded text-white">
              Ctrl+N
            </kbd>
          </button>

        </div>
      </div>
    </header>
  );
}
