import React from 'react';
import { useTasks } from '../context/TaskContext';
import { Sparkles, Plus, CheckCircle, SearchX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState() {
  const { searchQuery, statusFilter, setIsFormOpen, setTaskToEdit } = useTasks();

  const handleCreate = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const isSearching = searchQuery.trim().length > 0;
  const isCompletedTab = statusFilter === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8 border border-slate-200/60 dark:border-slate-800/60"
    >
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-500/20 via-indigo-500/20 to-purple-500/20 flex items-center justify-center text-brand-500 mb-4 border border-brand-500/30 shadow-inner">
        {isSearching ? (
          <SearchX className="w-8 h-8" />
        ) : isCompletedTab ? (
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        ) : (
          <Sparkles className="w-8 h-8" />
        )}
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
        {isSearching
          ? 'No matching tasks found'
          : isCompletedTab
          ? 'No completed tasks yet'
          : 'Your task list is clear!'}
      </h3>

      <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs">
        {isSearching
          ? `We couldn't find anything matching "${searchQuery}". Try a different keyword.`
          : isCompletedTab
          ? 'Complete some of your active tasks to see them archived here.'
          : 'Ready for a productive day? Create your first task or checklist to get started.'}
      </p>

      {!isCompletedTab && (
        <button
          onClick={handleCreate}
          className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/25 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Task</span>
        </button>
      )}
    </motion.div>
  );
}
