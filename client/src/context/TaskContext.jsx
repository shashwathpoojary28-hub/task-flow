import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { sounds } from '../utils/sound';
import confetti from 'canvas-confetti';

const TaskContext = createContext();

const API_BASE = '/api';

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, completed, today, overdue
  const [priorityFilter, setPriorityFilter] = useState('All'); // All, Urgent, High, Medium, Low
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default'); // default, dueDateAsc, dueDateDesc, priority, title

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Deleted tasks stack for Undo
  const [lastDeletedTask, setLastDeletedTask] = useState(null);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', action = null) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type, action }]);
    if (!action) {
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch tasks from API or fallback to localStorage
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/tasks`);
      if (!res.ok) throw new Error('API response not ok');
      const data = await res.json();
      setTasks(data);
      setIsOnline(true);
      localStorage.setItem('taskflow_tasks_backup', JSON.stringify(data));
    } catch (err) {
      console.warn('Backend server unavailable, falling back to LocalStorage:', err.message);
      setIsOnline(false);
      const backup = localStorage.getItem('taskflow_tasks_backup');
      if (backup) {
        setTasks(JSON.parse(backup));
      } else {
        // Seed default local tasks if none exist
        const defaultLocal = [
          {
            id: 'task-1',
            title: 'Design Glassmorphism Dashboard UI',
            description: 'Create high-fidelity wireframes with frosted glass effects and subtle borders.',
            priority: 'High',
            category: 'Work',
            dueDate: new Date().toISOString().split('T')[0],
            completed: true,
            isPinned: true,
            subtasks: [
              { id: 'sub-1', title: 'Pick vibrant gradient palette', completed: true },
              { id: 'sub-2', title: 'Dark and light mode design', completed: true }
            ],
            createdAt: new Date().toISOString()
          },
          {
            id: 'task-2',
            title: 'Implement Subtasks Checklist',
            description: 'Add interactive mini checklists inside each task item with real-time percentage indicators.',
            priority: 'High',
            category: 'Work',
            dueDate: new Date().toISOString().split('T')[0],
            completed: false,
            isPinned: true,
            subtasks: [
              { id: 'sub-3', title: 'Create SubtaskList component', completed: true },
              { id: 'sub-4', title: 'Add animated check toggle', completed: false }
            ],
            createdAt: new Date().toISOString()
          }
        ];
        setTasks(defaultLocal);
        localStorage.setItem('taskflow_tasks_backup', JSON.stringify(defaultLocal));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Sync to local storage backup whenever tasks change
  useEffect(() => {
    if (!loading && tasks.length >= 0) {
      localStorage.setItem('taskflow_tasks_backup', JSON.stringify(tasks));
    }
  }, [tasks, loading]);

  // Trigger celebration confetti
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#34d399']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  // Add Task
  const addTask = async (taskData) => {
    sounds.playAdd();
    const tempId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();
    const newTask = {
      id: tempId,
      title: taskData.title.trim(),
      description: taskData.description || '',
      priority: taskData.priority || 'Medium',
      category: taskData.category || 'Work',
      dueDate: taskData.dueDate || '',
      completed: false,
      isPinned: Boolean(taskData.isPinned),
      subtasks: taskData.subtasks || [],
      createdAt: now,
      updatedAt: now
    };

    // Optimistic UI update
    setTasks(prev => [newTask, ...prev]);
    addToast('Task created successfully!', 'success');

    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        });
        if (res.ok) {
          const serverTask = await res.json();
          setTasks(prev => prev.map(t => (t.id === tempId ? serverTask : t)));
        }
      } catch (err) {
        console.warn('API error adding task, saved locally:', err);
      }
    }
  };

  // Update Task
  const updateTask = async (id, updates) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, ...updates, updatedAt: new Date().toISOString() };
      }
      return t;
    }));
    addToast('Task updated', 'info');

    if (isOnline) {
      try {
        await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
      } catch (err) {
        console.warn('API error updating task:', err);
      }
    }
  };

  // Toggle Task Completion
  const toggleTask = async (id) => {
    let willComplete = false;
    let newCompletedCount = 0;

    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          willComplete = !t.completed;
          const nextSubs = willComplete 
            ? t.subtasks.map(s => ({ ...s, completed: true })) 
            : t.subtasks;
          return { ...t, completed: willComplete, subtasks: nextSubs, updatedAt: new Date().toISOString() };
        }
        return t;
      });

      newCompletedCount = updated.filter(t => t.completed).length;
      return updated;
    });

    if (willComplete) {
      sounds.playComplete();
      // Check if all active tasks are now completed
      const remainingActive = tasks.filter(t => t.id !== id && !t.completed).length;
      if (remainingActive === 0 && tasks.length > 0) {
        triggerConfetti();
        addToast('🎉 All tasks completed! Great work today!', 'success');
      } else {
        addToast('Task marked as complete', 'success');
      }
    }

    if (isOnline) {
      try {
        await fetch(`${API_BASE}/tasks/${id}/toggle`, { method: 'PATCH' });
      } catch (err) {
        console.warn('API toggle error:', err);
      }
    }
  };

  // Toggle Pin
  const togglePin = async (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, isPinned: !t.isPinned };
      }
      return t;
    }));

    if (isOnline) {
      try {
        await fetch(`${API_BASE}/tasks/${id}/pin`, { method: 'PATCH' });
      } catch (err) {
        console.warn('API pin error:', err);
      }
    }
  };

  // Delete Task with Undo
  const deleteTask = async (id) => {
    sounds.playDelete();
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    setLastDeletedTask(taskToDelete);
    setTasks(prev => prev.filter(t => t.id !== id));

    addToast(`Deleted "${taskToDelete.title.slice(0, 24)}..."`, 'info', {
      label: 'Undo',
      onClick: () => undoDelete(taskToDelete)
    });

    if (isOnline) {
      try {
        await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('API delete error:', err);
      }
    }
  };

  // Undo Delete
  const undoDelete = async (taskToRestore = null) => {
    const task = taskToRestore || lastDeletedTask;
    if (!task) return;

    setTasks(prev => [task, ...prev]);
    setLastDeletedTask(null);
    addToast('Task restored', 'success');

    if (isOnline) {
      try {
        await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });
      } catch (err) {
        console.warn('API restore error:', err);
      }
    }
  };

  // Subtask: Add
  const addSubtask = async (taskId, title) => {
    if (!title.trim()) return;
    const subId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newSub = { id: subId, taskId, title: title.trim(), completed: false };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, subtasks: [...(t.subtasks || []), newSub] };
      }
      return t;
    }));

    if (isOnline) {
      try {
        await fetch(`${API_BASE}/tasks/${taskId}/subtasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim() })
        });
      } catch (err) {
        console.warn('API add subtask error:', err);
      }
    }
  };

  // Subtask: Toggle
  const toggleSubtask = async (taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextSubs = t.subtasks.map(s => {
          if (s.id === subtaskId) {
            const nextDone = !s.completed;
            if (nextDone) sounds.playComplete();
            return { ...s, completed: nextDone };
          }
          return s;
        });
        return { ...t, subtasks: nextSubs };
      }
      return t;
    }));

    if (isOnline) {
      try {
        await fetch(`${API_BASE}/subtasks/${subtaskId}/toggle`, { method: 'PATCH' });
      } catch (err) {
        console.warn('API toggle subtask error:', err);
      }
    }
  };

  // Subtask: Delete
  const deleteSubtask = async (taskId, subtaskId) => {
    sounds.playDelete();
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) };
      }
      return t;
    }));

    if (isOnline) {
      try {
        await fetch(`${API_BASE}/subtasks/${subtaskId}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('API delete subtask error:', err);
      }
    }
  };

  // Clear all completed tasks
  const clearCompletedTasks = async () => {
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) return;

    sounds.playDelete();
    setTasks(prev => prev.filter(t => !t.completed));
    addToast(`Cleared ${completedTasks.length} completed tasks`, 'info');

    if (isOnline) {
      try {
        await fetch(`${API_BASE}/tasks/clear-completed`, { method: 'POST' });
      } catch (err) {
        console.warn('API clear completed error:', err);
      }
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const base = ['Work', 'Personal', 'Urgent', 'Health', 'Finance', 'Study'];
    const custom = tasks.map(t => t.category).filter(c => c && !base.includes(c));
    return Array.from(new Set([...base, ...custom]));
  }, [tasks]);

  // Filtered & Sorted tasks
  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return tasks.filter(task => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        const matchCategory = task.category?.toLowerCase().includes(q);
        const matchSubtasks = task.subtasks?.some(s => s.title.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchCategory && !matchSubtasks) return false;
      }

      // Status Filter
      if (statusFilter === 'active' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;
      if (statusFilter === 'today' && task.dueDate !== todayStr) return false;
      if (statusFilter === 'overdue' && (!task.dueDate || task.dueDate >= todayStr || task.completed)) return false;

      // Priority Filter
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;

      // Category Filter
      if (categoryFilter !== 'All' && task.category !== categoryFilter) return false;

      return true;
    }).sort((a, b) => {
      // Pinned tasks always on top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Completed tasks sink to bottom within their pinned status
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;

      if (sortBy === 'dueDateAsc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === 'dueDateDesc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return b.dueDate.localeCompare(a.dueDate);
      }
      if (sortBy === 'priority') {
        const order = { Urgent: 1, High: 2, Medium: 3, Low: 4 };
        return (order[a.priority] || 5) - (order[b.priority] || 5);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // Default: newest first
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

  // Statistics calculation
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    const todayTasks = tasks.filter(t => t.dueDate === todayStr);
    const todayTotal = todayTasks.length;
    const todayCompleted = todayTasks.filter(t => t.completed).length;

    // Daily progress rate: if tasks exist for today, use today's completion rate; otherwise overall completion rate
    const dailyRate = todayTotal > 0
      ? Math.round((todayCompleted / todayTotal) * 100)
      : (total > 0 ? Math.round((completed / total) * 100) : 0);

    const overdueCount = tasks.filter(t => t.dueDate && t.dueDate < todayStr && !t.completed).length;

    const priorityCounts = {
      Urgent: tasks.filter(t => t.priority === 'Urgent' && !t.completed).length,
      High: tasks.filter(t => t.priority === 'High' && !t.completed).length,
      Medium: tasks.filter(t => t.priority === 'Medium' && !t.completed).length,
      Low: tasks.filter(t => t.priority === 'Low' && !t.completed).length
    };

    return {
      total,
      completed,
      active,
      todayTotal,
      todayCompleted,
      dailyRate,
      overdueCount,
      priorityCounts
    };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        loading,
        isOnline,
        stats,
        categories,
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
        isFormOpen,
        setIsFormOpen,
        taskToEdit,
        setTaskToEdit,
        selectedTask,
        setSelectedTask,
        toasts,
        addToast,
        removeToast,
        addTask,
        updateTask,
        deleteTask,
        undoDelete,
        toggleTask,
        togglePin,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        clearCompletedTasks,
        triggerConfetti
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
