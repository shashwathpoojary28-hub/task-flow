import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Plus, Check, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubtaskList({ taskId, subtasks = [] }) {
  const { addSubtask, toggleSubtask, deleteSubtask } = useTasks();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = subtasks.filter(s => s.completed).length;
  const totalCount = subtasks.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      addSubtask(taskId, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/60 space-y-2">
      
      {/* Subtasks Progress Header */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <div className="flex items-center space-x-1.5 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-brand-500" />
            <span>Subtasks Checklist</span>
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {completedCount}/{totalCount} ({percent}%)
          </span>
        </div>
      )}

      {/* Subtasks Mini Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full bg-slate-200/60 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {subtasks.map((sub) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="group flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100/60 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/70 border border-slate-200/40 dark:border-slate-800/40 transition-colors"
            >
              <label className="flex items-center space-x-2.5 flex-1 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => toggleSubtask(taskId, sub.id)}
                  className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                    sub.completed
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'border border-slate-300 dark:border-slate-600 hover:border-brand-500'
                  }`}
                >
                  {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span
                  className={`text-xs transition-colors ${
                    sub.completed
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {sub.title}
                </span>
              </label>

              <button
                onClick={() => deleteSubtask(taskId, sub.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                title="Delete subtask"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Inline Add Subtask Input */}
      {isAdding ? (
        <form onSubmit={handleAdd} className="flex items-center space-x-2 mt-2">
          <input
            type="text"
            autoFocus
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Subtask name..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg glass-input"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewSubtaskTitle('');
              }
            }}
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewSubtaskTitle('');
            }}
            className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors pt-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add checklist item</span>
        </button>
      )}

    </div>
  );
}
