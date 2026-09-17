import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  getTodayDateString, 
  getTomorrowDateString, 
  getNextWeekDateString 
} from '../utils/dateUtils';
import { 
  X, 
  Plus, 
  Calendar, 
  Tag, 
  Flag, 
  Star, 
  CheckCircle, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskForm() {
  const { isFormOpen, setIsFormOpen, taskToEdit, setTaskToEdit, addTask, updateTask, categories } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Work');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCat, setShowCustomCat] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'Medium');
      setCategory(taskToEdit.category || 'Work');
      setDueDate(taskToEdit.dueDate || '');
      setIsPinned(Boolean(taskToEdit.isPinned));
      setSubtasks(taskToEdit.subtasks ? [...taskToEdit.subtasks] : []);
    } else {
      // Reset defaults
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setCategory('Work');
      setDueDate(getTodayDateString());
      setIsPinned(false);
      setSubtasks([]);
    }
    setErrors({});
    setShowCustomCat(false);
    setCustomCategory('');
  }, [taskToEdit, isFormOpen]);

  if (!isFormOpen) return null;

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (subtaskInput.trim()) {
      setSubtasks(prev => [
        ...prev,
        {
          id: `sub-temp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: subtaskInput.trim(),
          completed: false
        }
      ]);
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Task title cannot be empty.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCategory = showCustomCat && customCategory.trim() 
      ? customCategory.trim() 
      : category;

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category: finalCategory,
      dueDate,
      isPinned,
      subtasks
    };

    if (taskToEdit) {
      updateTask(taskToEdit.id, taskPayload);
    } else {
      addTask(taskPayload);
    }

    handleClose();
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setTaskToEdit(null);
  };

  const priorities = [
    { value: 'Urgent', label: 'Urgent', color: 'border-rose-500 text-rose-500 bg-rose-500/10' },
    { value: 'High', label: 'High', color: 'border-orange-500 text-orange-500 bg-orange-500/10' },
    { value: 'Medium', label: 'Medium', color: 'border-amber-500 text-amber-500 bg-amber-500/10' },
    { value: 'Low', label: 'Low', color: 'border-emerald-500 text-emerald-500 bg-emerald-500/10' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Backdrop blur overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
          className="relative w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl z-10 border border-slate-200/80 dark:border-slate-800/80 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
                <CheckCircle className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {taskToEdit ? 'Edit Task' : 'Create New Task'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            
            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({});
                }}
                placeholder="e.g., Prepare quarterly roadmap presentation"
                className={`w-full glass-input text-sm font-medium ${
                  errors.title ? 'border-rose-500 focus:ring-rose-500/40' : ''
                }`}
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-rose-500 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Description / Notes
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details, links, or context..."
                className="w-full glass-input text-sm resize-none"
              />
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center space-x-1">
                <Flag className="w-3.5 h-3.5 text-brand-500" />
                <span>Priority Level</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {priorities.map((p) => {
                  const isSelected = priority === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                        isSelected
                          ? `${p.color} ring-2 ring-brand-500/30 font-bold shadow-sm`
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category & Due Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-brand-500" />
                  <span>Category</span>
                </label>
                {!showCustomCat ? (
                  <div className="flex space-x-2">
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setShowCustomCat(true);
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full glass-input text-sm cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__custom__">+ Add Custom Category...</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      autoFocus
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Design, Hobby"
                      className="flex-1 glass-input text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomCat(false)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-500" />
                  <span>Due Date</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full glass-input text-sm cursor-pointer"
                />
                {/* Date Quick Presets */}
                <div className="mt-1.5 flex items-center space-x-1.5 text-[11px] text-slate-500">
                  <button
                    type="button"
                    onClick={() => setDueDate(getTodayDateString())}
                    className="hover:text-brand-500 font-medium"
                  >
                    Today
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setDueDate(getTomorrowDateString())}
                    className="hover:text-brand-500 font-medium"
                  >
                    Tomorrow
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setDueDate(getNextWeekDateString())}
                    className="hover:text-brand-500 font-medium"
                  >
                    Next Week
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="hover:text-rose-500 font-medium"
                  >
                    None
                  </button>
                </div>
              </div>

            </div>

            {/* Subtasks Builder */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Subtasks / Checklist ({subtasks.length})
              </label>

              {/* Existing subtasks in form */}
              {subtasks.length > 0 && (
                <div className="space-y-1.5 mb-2.5 max-h-36 overflow-y-auto pr-1">
                  {subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-xs"
                    >
                      <span className="text-slate-700 dark:text-slate-200">{sub.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(sub.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add subtask input inside form */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask(e);
                    }
                  }}
                  placeholder="Type subtask and press Enter..."
                  className="flex-1 glass-input text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-2 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 rounded-xl border border-brand-500/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pin to Top Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500"
                />
                <span className="flex items-center space-x-1">
                  <Star className={`w-3.5 h-3.5 ${isPinned ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                  <span>Pin this task to the top</span>
                </span>
              </label>
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/25 active:scale-95 transition-all"
              >
                {taskToEdit ? 'Save Changes' : 'Create Task'}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
