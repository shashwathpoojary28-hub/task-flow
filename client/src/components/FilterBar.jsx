import React, { useRef, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ListTodo
} from 'lucide-react';

export default function FilterBar() {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    categories,
    stats,
    clearCompletedTasks
  } = useTasks();

  const searchInputRef = useRef(null);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const statusTabs = [
    { id: 'all', label: 'All Tasks', count: stats.total, icon: ListTodo },
    { id: 'active', label: 'Active', count: stats.active, icon: ListTodo },
    { id: 'completed', label: 'Completed', count: stats.completed, icon: CheckCircle2 },
    { id: 'today', label: 'Today', count: stats.todayTotal, icon: Calendar },
    { id: 'overdue', label: 'Overdue', count: stats.overdueCount, icon: AlertTriangle, alert: stats.overdueCount > 0 },
  ];

  const priorities = ['All', 'Urgent', 'High', 'Medium', 'Low'];

  return (
    <div className="w-full space-y-4">
      
      {/* Top Row: Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, descriptions, or tags... (Press '/' to focus)"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort selector & Batch Action */}
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl glass-input text-sm appearance-none cursor-pointer"
            >
              <option value="default">Sort: Newest First</option>
              <option value="dueDateAsc">Due Date: Earliest First</option>
              <option value="dueDateDesc">Due Date: Latest First</option>
              <option value="priority">Priority: Highest First</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>

          {stats.completed > 0 && (
            <button
              onClick={clearCompletedTasks}
              title="Clear all completed tasks"
              className="inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Clear Done</span>
            </button>
          )}
        </div>

      </div>

      {/* Filter Tabs & Chips */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : tab.alert
                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Priority and Category Selectors */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          
          {/* Priority Pill Filters */}
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/70 dark:border-slate-800/80 text-xs">
            {priorities.map((p) => {
              const isActive = priorityFilter === p;
              return (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl glass-input text-xs font-medium cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

    </div>
  );
}
