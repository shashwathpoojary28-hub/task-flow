import React from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Flame, 
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Stats() {
  const { stats, triggerConfetti } = useTasks();

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.dailyRate / 100) * circumference;

  return (
    <section aria-label="Task Analytics" className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Main Daily Completion Gauge Card */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle gradient accent background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-500/10 via-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 dark:text-brand-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
                  Daily Productivity
                </h2>
              </div>
              <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {stats.dailyRate === 100 && stats.total > 0 ? (
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                    All Goals Smashed! 🎉
                  </span>
                ) : stats.dailyRate >= 50 ? (
                  <span>Great Momentum! 🚀</span>
                ) : stats.total === 0 ? (
                  <span>No tasks yet today</span>
                ) : (
                  <span>Let's get things done ✨</span>
                )}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                You have completed <strong className="text-slate-800 dark:text-slate-200">{stats.completed}</strong> of <strong className="text-slate-800 dark:text-slate-200">{stats.total}</strong> total tasks.
              </p>
            </div>

            {/* Circular Progress Gauge */}
            <div className="relative flex-shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="text-brand-500"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  strokeLinecap="round"
                  stroke="url(#gradient-progress)"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="gradient-progress" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {stats.dailyRate}%
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  done
                </span>
              </div>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="mt-5 relative z-10">
            <div className="w-full bg-slate-200/70 dark:bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-300/40 dark:border-slate-700/50">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500 shadow-sm shadow-brand-500/50"
                initial={{ width: 0 }}
                animate={{ width: `${stats.dailyRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{stats.active} remaining tasks</span>
              <button
                onClick={triggerConfetti}
                className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-500 font-medium flex items-center space-x-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Celebrate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 sm:gap-4">
          
          {/* Active Tasks Card */}
          <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">In Progress</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.active}</p>
              </div>
            </div>
            {stats.overdueCount > 0 && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-3 h-3" />
                <span>{stats.overdueCount} overdue</span>
              </span>
            )}
          </div>

          {/* Completed Tasks Card */}
          <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.completed}</p>
              </div>
            </div>
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Flame className="w-3 h-3 text-orange-500" />
              <span>Streak</span>
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
