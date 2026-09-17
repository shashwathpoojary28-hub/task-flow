import React from 'react';
import { useTasks } from '../context/TaskContext';
import { formatDate } from '../utils/dateUtils';
import SubtaskList from './SubtaskList';
import { 
  X, 
  CheckCircle, 
  Calendar, 
  Tag, 
  Flag, 
  Star, 
  Clock, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskDetailModal() {
  const { selectedTask, setSelectedTask, toggleTask, deleteTask, setTaskToEdit, setIsFormOpen, togglePin } = useTasks();

  if (!selectedTask) return null;

  const dateInfo = formatDate(selectedTask.dueDate);

  const handleEdit = () => {
    setTaskToEdit(selectedTask);
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    deleteTask(selectedTask.id);
    setSelectedTask(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedTask(null)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
          className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl z-10 border border-slate-200/80 dark:border-slate-800/80 max-h-[90vh] overflow-y-auto space-y-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleTask(selectedTask.id)}
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                  selectedTask.completed
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'border-2 border-slate-300 dark:border-slate-600 hover:border-brand-500'
                }`}
              >
                {selectedTask.completed && <CheckCircle className="w-5 h-5" />}
              </button>
              <h2 className={`text-xl font-bold ${selectedTask.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                {selectedTask.title}
              </h2>
            </div>
            <button
              onClick={() => setSelectedTask(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          {selectedTask.description && (
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
              {selectedTask.description}
            </div>
          )}

          {/* Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl glass-card space-y-1">
              <span className="text-slate-400 font-medium flex items-center space-x-1">
                <Flag className="w-3.5 h-3.5" />
                <span>Priority</span>
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{selectedTask.priority}</p>
            </div>

            <div className="p-3 rounded-xl glass-card space-y-1">
              <span className="text-slate-400 font-medium flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Category</span>
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{selectedTask.category}</p>
            </div>

            <div className="p-3 rounded-xl glass-card space-y-1">
              <span className="text-slate-400 font-medium flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Due Date</span>
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{dateInfo ? dateInfo.text : 'None'}</p>
            </div>
          </div>

          {/* Subtasks inside modal */}
          <SubtaskList taskId={selectedTask.id} subtasks={selectedTask.subtasks || []} />

          {/* Timestamps */}
          {selectedTask.createdAt && (
            <div className="flex items-center space-x-1 text-[11px] text-slate-400 pt-2">
              <Clock className="w-3 h-3" />
              <span>Created {new Date(selectedTask.createdAt).toLocaleString()}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
            <button
              onClick={handleDelete}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Task</span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => togglePin(selectedTask.id)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1"
              >
                <Star className={`w-3.5 h-3.5 ${selectedTask.isPinned ? 'text-amber-400 fill-amber-400' : ''}`} />
                <span>{selectedTask.isPinned ? 'Unpin' : 'Pin'}</span>
              </button>
              <button
                onClick={handleEdit}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Task</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
