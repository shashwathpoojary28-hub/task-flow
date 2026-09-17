import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'tasks.db');

let db = null;
let SQL = null;

// Helper to save DB binary state to disk
export function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

// Initialize SQLite database
export async function initDatabase() {
  if (db) return db;

  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'Medium',
      category TEXT DEFAULT 'Work',
      dueDate TEXT,
      completed INTEGER DEFAULT 0,
      isPinned INTEGER DEFAULT 0,
      createdAt TEXT,
      updatedAt TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      createdAt TEXT,
      FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `);

  // Seed sample data if tasks table is empty
  const countResult = db.exec("SELECT COUNT(*) as count FROM tasks");
  const taskCount = countResult.length > 0 && countResult[0].values.length > 0 ? countResult[0].values[0][0] : 0;

  if (taskCount === 0) {
    seedInitialData();
  }

  saveDb();
  return db;
}

function seedInitialData() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const seedTasks = [
    {
      id: 'task-1',
      title: 'Design Glassmorphism Dashboard UI',
      description: 'Create high-fidelity wireframes with frosted glass effects, subtle borders, and glowing accents.',
      priority: 'High',
      category: 'Work',
      dueDate: todayStr,
      completed: 1,
      isPinned: 1,
      subtasks: [
        { id: 'sub-1', title: 'Pick vibrant gradient color palette', completed: 1 },
        { id: 'sub-2', title: 'Design dark and light mode components', completed: 1 },
        { id: 'sub-3', title: 'Export Lucide icon sets', completed: 1 }
      ]
    },
    {
      id: 'task-2',
      title: 'Implement Subtasks Checklist & Progress Bars',
      description: 'Add interactive mini checklists inside each task item with real-time percentage indicators.',
      priority: 'High',
      category: 'Work',
      dueDate: todayStr,
      completed: 0,
      isPinned: 1,
      subtasks: [
        { id: 'sub-4', title: 'Create SubtaskList component', completed: 1 },
        { id: 'sub-5', title: 'Add animated check toggle', completed: 0 },
        { id: 'sub-6', title: 'Add quick subtask input drawer', completed: 0 }
      ]
    },
    {
      id: 'task-3',
      title: 'Grocery Run & Meal Prep',
      description: 'Pick up fresh vegetables, sourdough bread, almond milk, and Greek yogurt.',
      priority: 'Medium',
      category: 'Personal',
      dueDate: tomorrowStr,
      completed: 0,
      isPinned: 0,
      subtasks: [
        { id: 'sub-7', title: 'Organic greens & avocados', completed: 0 },
        { id: 'sub-8', title: 'Whole wheat sourdough', completed: 0 }
      ]
    },
    {
      id: 'task-4',
      title: 'Pay Cloud Hosting & Domain Invoices',
      description: 'Check renewal dates for AWS and Vercel hosting subscriptions before deadline.',
      priority: 'Urgent',
      category: 'Finance',
      dueDate: todayStr,
      completed: 0,
      isPinned: 0,
      subtasks: []
    },
    {
      id: 'task-5',
      title: '30-minute Evening HIIT Workout',
      description: 'Cardio session followed by 10 minutes of guided mindfulness and stretching.',
      priority: 'Low',
      category: 'Health',
      dueDate: todayStr,
      completed: 1,
      isPinned: 0,
      subtasks: [
        { id: 'sub-9', title: 'Warm-up stretching', completed: 1 },
        { id: 'sub-10', title: '20 min HIIT circuit', completed: 1 }
      ]
    }
  ];

  for (const t of seedTasks) {
    const time = new Date().toISOString();
    db.run(
      `INSERT INTO tasks (id, title, description, priority, category, dueDate, completed, isPinned, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.title, t.description, t.priority, t.category, t.dueDate, t.completed, t.isPinned, time, time]
    );

    for (const sub of t.subtasks) {
      db.run(
        `INSERT INTO subtasks (id, taskId, title, completed, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
        [sub.id, t.id, sub.title, sub.completed, time]
      );
    }
  }
}

// Helper to convert SQLite result sets into object arrays
function queryToObjects(result) {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  const values = result[0].values;
  return values.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

// Database helper functions
export const taskDb = {
  getAll: (filters = {}) => {
    let query = `SELECT * FROM tasks WHERE 1=1`;
    const params = [];

    if (filters.status === 'active') {
      query += ` AND completed = 0`;
    } else if (filters.status === 'completed') {
      query += ` AND completed = 1`;
    } else if (filters.status === 'today') {
      const today = new Date().toISOString().split('T')[0];
      query += ` AND dueDate = ?`;
      params.push(today);
    } else if (filters.status === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      query += ` AND dueDate < ? AND completed = 0`;
      params.push(today);
    }

    if (filters.priority && filters.priority !== 'All') {
      query += ` AND priority = ?`;
      params.push(filters.priority);
    }

    if (filters.category && filters.category !== 'All') {
      query += ` AND category = ?`;
      params.push(filters.category);
    }

    if (filters.search) {
      query += ` AND (title LIKE ? OR description LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // Sorting
    if (filters.sortBy === 'dueDateAsc') {
      query += ` ORDER BY isPinned DESC, dueDate ASC, createdAt DESC`;
    } else if (filters.sortBy === 'dueDateDesc') {
      query += ` ORDER BY isPinned DESC, dueDate DESC, createdAt DESC`;
    } else if (filters.sortBy === 'priority') {
      query += ` ORDER BY isPinned DESC, 
        CASE priority 
          WHEN 'Urgent' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'Low' THEN 4 
          ELSE 5 
        END ASC, createdAt DESC`;
    } else if (filters.sortBy === 'title') {
      query += ` ORDER BY isPinned DESC, title ASC`;
    } else {
      query += ` ORDER BY isPinned DESC, createdAt DESC`;
    }

    const taskRows = queryToObjects(db.exec(query, params));

    // Fetch subtasks for all tasks
    const subtaskRows = queryToObjects(db.exec(`SELECT * FROM subtasks ORDER BY createdAt ASC`));
    
    // Group subtasks by taskId
    const subtaskMap = {};
    for (const sub of subtaskRows) {
      if (!subtaskMap[sub.taskId]) subtaskMap[sub.taskId] = [];
      subtaskMap[sub.taskId].push({
        id: sub.id,
        taskId: sub.taskId,
        title: sub.title,
        completed: Boolean(sub.completed),
        createdAt: sub.createdAt
      });
    }

    return taskRows.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      priority: t.priority || 'Medium',
      category: t.category || 'Work',
      dueDate: t.dueDate || '',
      completed: Boolean(t.completed),
      isPinned: Boolean(t.isPinned),
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      subtasks: subtaskMap[t.id] || []
    }));
  },

  getById: (id) => {
    const tasks = queryToObjects(db.exec(`SELECT * FROM tasks WHERE id = ?`, [id]));
    if (tasks.length === 0) return null;
    const task = tasks[0];
    const subtasks = queryToObjects(db.exec(`SELECT * FROM subtasks WHERE taskId = ? ORDER BY createdAt ASC`, [id]));
    return {
      ...task,
      completed: Boolean(task.completed),
      isPinned: Boolean(task.isPinned),
      subtasks: subtasks.map(s => ({
        ...s,
        completed: Boolean(s.completed)
      }))
    };
  },

  create: (taskData) => {
    const id = taskData.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();
    const title = taskData.title.trim();
    const description = taskData.description?.trim() || '';
    const priority = taskData.priority || 'Medium';
    const category = taskData.category || 'Work';
    const dueDate = taskData.dueDate || '';
    const completed = taskData.completed ? 1 : 0;
    const isPinned = taskData.isPinned ? 1 : 0;

    db.run(
      `INSERT INTO tasks (id, title, description, priority, category, dueDate, completed, isPinned, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, priority, category, dueDate, completed, isPinned, now, now]
    );

    const subtasks = [];
    if (Array.isArray(taskData.subtasks)) {
      for (const sub of taskData.subtasks) {
        const subId = sub.id || `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const subTitle = (sub.title || '').trim();
        if (subTitle) {
          const subCompleted = sub.completed ? 1 : 0;
          db.run(
            `INSERT INTO subtasks (id, taskId, title, completed, createdAt)
             VALUES (?, ?, ?, ?, ?)`,
            [subId, id, subTitle, subCompleted, now]
          );
          subtasks.push({
            id: subId,
            taskId: id,
            title: subTitle,
            completed: Boolean(subCompleted),
            createdAt: now
          });
        }
      }
    }

    saveDb();

    return {
      id,
      title,
      description,
      priority,
      category,
      dueDate,
      completed: Boolean(completed),
      isPinned: Boolean(isPinned),
      createdAt: now,
      updatedAt: now,
      subtasks
    };
  },

  update: (id, updates) => {
    const existing = taskDb.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const title = updates.title !== undefined ? updates.title.trim() : existing.title;
    const description = updates.description !== undefined ? updates.description.trim() : existing.description;
    const priority = updates.priority !== undefined ? updates.priority : existing.priority;
    const category = updates.category !== undefined ? updates.category : existing.category;
    const dueDate = updates.dueDate !== undefined ? updates.dueDate : existing.dueDate;
    const completed = updates.completed !== undefined ? (updates.completed ? 1 : 0) : (existing.completed ? 1 : 0);
    const isPinned = updates.isPinned !== undefined ? (updates.isPinned ? 1 : 0) : (existing.isPinned ? 1 : 0);

    db.run(
      `UPDATE tasks SET title = ?, description = ?, priority = ?, category = ?, dueDate = ?, completed = ?, isPinned = ?, updatedAt = ?
       WHERE id = ?`,
      [title, description, priority, category, dueDate, completed, isPinned, now, id]
    );

    // If subtasks array is passed, synchronize subtasks
    if (Array.isArray(updates.subtasks)) {
      db.run(`DELETE FROM subtasks WHERE taskId = ?`, [id]);
      for (const sub of updates.subtasks) {
        const subId = sub.id || `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const subTitle = (sub.title || '').trim();
        if (subTitle) {
          const subCompleted = sub.completed ? 1 : 0;
          db.run(
            `INSERT INTO subtasks (id, taskId, title, completed, createdAt)
             VALUES (?, ?, ?, ?, ?)`,
            [subId, id, subTitle, subCompleted, sub.createdAt || now]
          );
        }
      }
    }

    saveDb();
    return taskDb.getById(id);
  },

  delete: (id) => {
    db.run(`DELETE FROM subtasks WHERE taskId = ?`, [id]);
    db.run(`DELETE FROM tasks WHERE id = ?`, [id]);
    saveDb();
    return true;
  },

  toggle: (id) => {
    const task = taskDb.getById(id);
    if (!task) return null;
    const nextCompleted = !task.completed;
    const now = new Date().toISOString();

    db.run(
      `UPDATE tasks SET completed = ?, updatedAt = ? WHERE id = ?`,
      [nextCompleted ? 1 : 0, now, id]
    );

    // If task is marked completed, optionally mark all subtasks as completed
    if (nextCompleted) {
      db.run(`UPDATE subtasks SET completed = 1 WHERE taskId = ?`, [id]);
    }

    saveDb();
    return taskDb.getById(id);
  },

  togglePin: (id) => {
    const task = taskDb.getById(id);
    if (!task) return null;
    const nextPinned = !task.isPinned;
    const now = new Date().toISOString();

    db.run(
      `UPDATE tasks SET isPinned = ?, updatedAt = ? WHERE id = ?`,
      [nextPinned ? 1 : 0, now, id]
    );

    saveDb();
    return taskDb.getById(id);
  },

  addSubtask: (taskId, title) => {
    const task = taskDb.getById(taskId);
    if (!task) return null;

    const subId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();
    const cleanTitle = title.trim();

    db.run(
      `INSERT INTO subtasks (id, taskId, title, completed, createdAt)
       VALUES (?, ?, ?, 0, ?)`,
      [subId, taskId, cleanTitle, now]
    );

    saveDb();
    return {
      id: subId,
      taskId,
      title: cleanTitle,
      completed: false,
      createdAt: now
    };
  },

  toggleSubtask: (subtaskId) => {
    const subs = queryToObjects(db.exec(`SELECT * FROM subtasks WHERE id = ?`, [subtaskId]));
    if (subs.length === 0) return null;
    const sub = subs[0];
    const nextCompleted = sub.completed ? 0 : 1;

    db.run(`UPDATE subtasks SET completed = ? WHERE id = ?`, [nextCompleted, subtaskId]);
    saveDb();

    return {
      ...sub,
      completed: Boolean(nextCompleted)
    };
  },

  deleteSubtask: (subtaskId) => {
    db.run(`DELETE FROM subtasks WHERE id = ?`, [subtaskId]);
    saveDb();
    return true;
  },

  getStats: () => {
    const tasks = taskDb.getAll();
    const todayStr = new Date().toISOString().split('T')[0];

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    const todayTasks = tasks.filter(t => t.dueDate === todayStr);
    const todayTotal = todayTasks.length;
    const todayCompleted = todayTasks.filter(t => t.completed).length;
    const todayRate = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : (total > 0 ? Math.round((completed / total) * 100) : 0);

    const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < todayStr && !t.completed);

    const priorityCounts = {
      Urgent: tasks.filter(t => t.priority === 'Urgent' && !t.completed).length,
      High: tasks.filter(t => t.priority === 'High' && !t.completed).length,
      Medium: tasks.filter(t => t.priority === 'Medium' && !t.completed).length,
      Low: tasks.filter(t => t.priority === 'Low' && !t.completed).length,
    };

    const categoryCounts = {};
    for (const t of tasks) {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }

    return {
      total,
      completed,
      active,
      todayTotal,
      todayCompleted,
      todayRate,
      overdueCount: overdueTasks.length,
      priorityCounts,
      categoryCounts
    };
  },

  clearCompleted: () => {
    db.run(`DELETE FROM subtasks WHERE taskId IN (SELECT id FROM tasks WHERE completed = 1)`);
    db.run(`DELETE FROM tasks WHERE completed = 1`);
    saveDb();
    return true;
  }
};
