import express from 'express';
import cors from 'cors';
import { initDatabase, taskDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database
await initDatabase();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET /api/tasks - Retrieve all tasks with optional filters
app.get('/api/tasks', (req, res) => {
  try {
    const { status, priority, category, search, sortBy } = req.query;
    const tasks = taskDb.getAll({ status, priority, category, search, sortBy });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// GET /api/tasks/:id - Retrieve single task
app.get('/api/tasks/:id', (req, res) => {
  try {
    const task = taskDb.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to retrieve task' });
  }
});

// POST /api/tasks - Create new task
app.post('/api/tasks', (req, res) => {
  try {
    const { title, description, priority, category, dueDate, isPinned, subtasks } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required and cannot be empty' });
    }

    const newTask = taskDb.create({
      title,
      description,
      priority: priority || 'Medium',
      category: category || 'Work',
      dueDate: dueDate || '',
      isPinned: Boolean(isPinned),
      subtasks: Array.isArray(subtasks) ? subtasks : []
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { title, description, priority, category, dueDate, completed, isPinned, subtasks } = req.body;
    
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'Task title cannot be empty' });
    }

    const updatedTask = taskDb.update(req.params.id, {
      title,
      description,
      priority,
      category,
      dueDate,
      completed,
      isPinned,
      subtasks
    });

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const success = taskDb.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// PATCH /api/tasks/:id/toggle - Toggle task completion
app.patch('/api/tasks/:id/toggle', (req, res) => {
  try {
    const updated = taskDb.toggle(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

// PATCH /api/tasks/:id/pin - Toggle task pin to top
app.patch('/api/tasks/:id/pin', (req, res) => {
  try {
    const updated = taskDb.togglePin(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error pinning task:', error);
    res.status(500).json({ error: 'Failed to toggle pin state' });
  }
});

// POST /api/tasks/:id/subtasks - Add subtask to a task
app.post('/api/tasks/:id/subtasks', (req, res) => {
  try {
    const { title } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Subtask title is required' });
    }

    const subtask = taskDb.addSubtask(req.params.id, title);
    if (!subtask) {
      return res.status(404).json({ error: 'Parent task not found' });
    }

    res.status(201).json(subtask);
  } catch (error) {
    console.error('Error adding subtask:', error);
    res.status(500).json({ error: 'Failed to add subtask' });
  }
});

// PATCH /api/subtasks/:subtaskId/toggle - Toggle subtask completion
app.patch('/api/subtasks/:subtaskId/toggle', (req, res) => {
  try {
    const subtask = taskDb.toggleSubtask(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ error: 'Subtask not found' });
    }
    res.json(subtask);
  } catch (error) {
    console.error('Error toggling subtask:', error);
    res.status(500).json({ error: 'Failed to toggle subtask' });
  }
});

// DELETE /api/subtasks/:subtaskId - Delete subtask
app.delete('/api/subtasks/:subtaskId', (req, res) => {
  try {
    const success = taskDb.deleteSubtask(req.params.subtaskId);
    res.json({ message: 'Subtask deleted', id: req.params.subtaskId });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ error: 'Failed to delete subtask' });
  }
});

// GET /api/stats - Statistics & completion rate
app.get('/api/stats', (req, res) => {
  try {
    const stats = taskDb.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
});

// POST /api/tasks/clear-completed - Batch clear completed tasks
app.post('/api/tasks/clear-completed', (req, res) => {
  try {
    taskDb.clearCompleted();
    res.json({ message: 'Cleared all completed tasks' });
  } catch (error) {
    console.error('Error clearing completed tasks:', error);
    res.status(500).json({ error: 'Failed to clear completed tasks' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Modern To-Do API Server running at http://localhost:${PORT}`);
});
