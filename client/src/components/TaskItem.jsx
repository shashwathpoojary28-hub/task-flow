import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { formatDate } from '../utils/dateUtils';
import SubtaskList from './SubtaskList';
import { 
  Check, 
  Trash2, 
  Edit3, 
  Star, 
  Calendar, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TaskItem({ task }) {
  const { toggleTask, deleteTask, togglePin, setTaskToEdit, setIsFormOpen, setSelectedTask } = useTasks();
  const [isExpanded, setIsExpanded] = useState(false);

  const dateInfo = formatDate(task.dueDate);
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(s => s.completed).length;

  const handleEdit = (e) => {
    e.stopPropagation();
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const priorityStyles = {
    Urgent: {
      bg: 'bg-rose-500/15 dark:bg-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30',
      glow: 'shadow-rose-500/10'
    },
    High: {
      bg: 'bg-orange-500/15 dark:bg-orange-500/20',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500/30',
      glow: 'shadow-orange-500/10'
    },
    Medium: {
      bg: 'bg-amber-500/15 dark:bg-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/10'
    },
    Low: {
      bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/10'
    }
  };

  const currentPriorityStyle = priorityStyles[task.priority] || priorityStyles.Medium;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`glass-panel glass-card-hover rounded-2xl p-4 sm:p-5 relative transition-all duration-300 ${
        task.completed
          ? 'opacity-65 bg-slate-100/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40'
          : task.isPinned
          ? 'border-brand-500/40 dark:border-brand-500/40 shadow-md shadow-brand-500/5'
          : 'border-slate-200/80 dark:border-slate-800/80'
      }`}
    >
      {/* Top Header inside Task Card */}
      <div className="flex items-start justify-between gap-3">
        
        {/* Checkbox + Title + Description */}
        <div className="flex items-start space-x-3.5 flex-1 min-w-0">
          
          {/* Animated Checkbox */}
          <button
            type="button"
            onClick={() => toggleTask(task.id)}
            aria-label={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
            className={`mt-0.5 w-6 h-6 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-400 ${
              task.completed
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400'
                : 'border-2 border-slate-300 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-400 bg-white/40 dark:bg-slate-800/40'
            }`}
          >
            {task.completed && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </motion.div>
            )}
          </button>

          {/* Task Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <h3
                onClick={() => setSelectedTask(task)}
                className={`text-base font-semibold cursor-pointer select-none transition-colors break-words ${
                  task.completed
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400'
                }`}
              >
                {task.title}
              </h3>
            </div>

            {task.description && (
              <p
                onClick={() => setSelectedTask(task)}
                className={`mt-1 text-xs sm:text-sm line-clamp-2 cursor-pointer ${
                  task.completed ? 'text-slate-400 dark:text-slate-600' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Badges & Meta Row */}
            <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
              
              {/* Priority Badge */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold border ${currentPriorityStyle.bg} ${currentPriorityStyle.text} ${currentPriorityStyle.border}`}
              >
                {task.priority} Priority
              </span>

              {/* Category Badge */}
              {task.category && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span>{task.category}</span>
                </span>
              )}

              {/* Due Date Badge */}
              {dateInfo && (
                <span
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-medium border ${
                    dateInfo.status === 'overdue' && !task.completed
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse-subtle'
                      : dateInfo.status === 'today'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>{dateInfo.text}</span>
                </span>
              )}

              {/* Subtasks Accordion Indicator Badge */}
              {subtasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 transition-colors"
                >
                  <CheckSquare className="w-3 h-3" />
                  <span>
                    {completedSubtasks}/{subtasks.length} Subtasks
                  </span>
                  {isExpanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                </button>
              )}

            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          
          {/* Pin Button */}
          <button
            onClick={() => togglePin(task.id)}
            title={task.isPinned ? "Unpin task" : "Pin to top"}
            aria-label={task.isPinned ? "Unpin task" : "Pin task to top"}
            className={`p-1.5 rounded-lg transition-colors ${
              task.isPinned
                ? 'text-amber-400 hover:text-amber-500 bg-amber-400/10'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Star className={`w-4 h-4 ${task.isPinned ? 'fill-current' : ''}`} />
          </button>

          {/* Edit Button */}
          <button
            onClick={handleEdit}
            title="Edit task"
            aria-label="Edit task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => deleteTask(task.id)}
            title="Delete task"
            aria-label="Delete task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Expandable Subtasks Checklist Section */}
      {(isExpanded || (subtasks.length > 0 && !task.completed)) && (
        <SubtaskList taskId={task.id} subtasks={subtasks} />
      )}

    </motion.div>
  );
}
