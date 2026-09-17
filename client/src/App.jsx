import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Stats from './components/Stats';
import FilterBar from './components/FilterBar';
import TaskItem from './components/TaskItem';
import TaskForm from './components/TaskForm';
import TaskDetailModal from './components/TaskDetailModal';
import Toast from './components/Toast';
import EmptyState from './components/EmptyState';
import { useTasks } from './context/TaskContext';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle, Command, X } from 'lucide-react';

export default function App() {
  const { filteredTasks, loading, setIsFormOpen, setTaskToEdit } = useTasks();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+N or Cmd+N to open task form
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setTaskToEdit(null);
        setIsFormOpen(true);
      }
      // '?' to toggle keyboard shortcuts
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
      // Escape to close shortcuts
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsFormOpen, setTaskToEdit, showShortcuts]);

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* Dynamic Background Glowing Orbs */}
      <div className="glow-orb-1 opacity-70 dark:opacity-40" />
      <div className="glow-orb-2 opacity-70 dark:opacity-40" />
      <div className="glow-orb-3 opacity-50 dark:opacity-30" />

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Progress & Productivity Stats Dashboard */}
        <Stats />

        {/* Filter and Search Bar */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <FilterBar />
        </div>

        {/* Task List Grid */}
        <section aria-label="Tasks List" className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Syncing tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div layout className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-slate-200/50 dark:border-slate-800/60 text-center text-xs text-slate-400 flex items-center justify-center space-x-3">
        <span>TaskFlow Pro • Glassmorphism Edition</span>
        <span>•</span>
        <button
          onClick={() => setShowShortcuts(true)}
          className="hover:text-brand-500 font-medium flex items-center space-x-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Shortcuts</span>
        </button>
      </footer>

      {/* Modal Dialogs & Toasts */}
      <TaskForm />
      <TaskDetailModal />
      <Toast />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShortcuts(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass-panel rounded-3xl p-6 shadow-2xl z-10 border border-slate-200/80 dark:border-slate-800/80"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <Command className="w-5 h-5 text-brand-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
                </div>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-600 dark:text-slate-300">Create new task</span>
                  <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">Ctrl + N</kbd>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-600 dark:text-slate-300">Search tasks</span>
                  <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">/</kbd>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-600 dark:text-slate-300">Toggle shortcuts guide</span>
                  <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">?</kbd>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-600 dark:text-slate-300">Close open dialogs</span>
                  <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">Esc</kbd>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
