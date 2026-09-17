# 🌟 TaskFlow Pro — Modern Glassmorphic Full-Stack To-Do App

A state-of-the-art, full-stack task manager built with **React (Vite)**, **Tailwind CSS**, **Framer Motion**, and **Node.js (Express + SQLite WebAssembly)**.

Featuring sleek **glassmorphic design**, real-time **daily productivity analytics**, interactive **nested subtasks checklists**, **dual persistence** (SQLite API + offline LocalStorage fallback), and celebratory micro-interactions.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Install Dependencies
From the `modern-todo-app` root directory:
```bash
npm run install:all
```
*(Or navigate to both `server/` and `client/` and run `npm install` in each).*

### 2. Run Both Frontend & Backend (One Command)
```bash
npm run dev
```
- **React Frontend**: [http://localhost:5173](http://localhost:5173)
- **Express & SQLite API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## ✨ Key Features & Capabilities

### 1. 📋 Task & Subtask Management
- **Full CRUD**: Add, edit, delete, and mark tasks complete.
- **Nested Subtasks / Checklists**: Add interactive checklist items inside each task card with real-time progress indicators (e.g., `2/3 Subtasks (67%)`).
- **Priority Levels**: Color-coded badges for **Urgent** (Red glow), **High** (Orange), **Medium** (Amber), and **Low** (Emerald).
- **Categories / Tags**: Built-in categories (*Work*, *Personal*, *Urgent*, *Health*, *Finance*, *Study*) with support for custom user tags.
- **Due Dates & Smart Presets**: Relative date chips (*"Today"*, *"Tomorrow"*, *"In 3 days"*, or highlighted in Red if *"Overdue"*).
- **Pin to Top**: Star important tasks to keep them anchored at the top of your list.

### 2. 🔍 Advanced Filtering, Search & Sorting
- **Instant Search**: Search across task titles, descriptions, categories, and subtasks (hotkey `/`).
- **Status Tabs**: Quick filters for *All*, *Active*, *Completed*, *Today*, and *Overdue*.
- **Priority Filter**: Instant filter by *Urgent*, *High*, *Medium*, or *Low*.
- **Category Filter**: Filter tasks by category chips.
- **Smart Sorting**: Sort by *Newest*, *Due Date (Earliest / Latest)*, *Priority (Highest First)*, or *Alphabetical (A-Z)*.
- **Batch Actions**: One-click "Clear Completed" button.

### 3. 🎨 Modern Glassmorphism UI & Micro-Interactions
- **Glassmorphism Design System**: Frosted glass panels (`backdrop-blur-xl`), subtle illuminated borders, animated gradient background orbs.
- **Dark & Light Mode**: Smooth theme transitions with preference auto-persisted in LocalStorage.
- **Framer Motion Animations**: Spring physics on checkboxes, animated layout shifts on sorting, fade/slide animations on add/delete.
- **Daily Productivity Gauge**: Circular SVG completion ring and linear progress bar showing daily goal completion percentage.
- **Celebration Confetti**: Triggered when finishing all daily tasks or via the celebrate button.
- **Web Audio Sound Cues**: Crisp audio cues on completion, creation, and deletion (toggleable with mute button).
- **Undo Toast System**: Non-blocking toasts with instant "Undo" button on task deletion.

### 4. 🗄️ Full-Stack Architecture & Dual Persistence
- **Express + SQLite (WebAssembly)**: Embedded SQLite database (`tasks.db`) with relational tables for `tasks` and `subtasks`, cascading foreign keys, and fast query execution.
- **Offline LocalStorage Sync**: If the backend is offline or unreachable, the client automatically switches to LocalStorage without interrupting the user.
- **REST API Endpoints**: Clean endpoints for tasks, subtasks, stats, and batch actions.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + N` / `Cmd + N` | Open "Create New Task" modal |
| `/` | Focus instant search bar |
| `?` | Show keyboard shortcuts guide |
| `Esc` | Close any open modal or drawer |

---

## 📂 Project Directory Structure

```
modern-todo-app/
├── package.json                 # Root script runner for concurrent dev
├── start-dev.js                 # Cross-platform concurrent server/client starter
├── server/
│   ├── package.json
│   ├── server.js                # Express REST API routes & controllers
│   ├── db.js                    # SQLite WebAssembly connection & migrations
│   └── tasks.db                 # Persistent SQLite database binary file
├── client/
│   ├── package.json
│   ├── vite.config.js           # Vite dev config with /api reverse proxy
│   ├── tailwind.config.js       # Tailwind CSS design tokens & animations
│   ├── postcss.config.js
│   ├── index.html               # Fonts, meta tags & favicon
│   └── src/
│       ├── main.jsx             # React 19 entry point
│       ├── App.jsx              # Main dashboard layout & shortcut listeners
│       ├── index.css            # Glassmorphic utilities & animated background orbs
│       ├── context/
│       │   ├── TaskContext.jsx  # Task state, CRUD, API sync & LocalStorage fallback
│       │   └── ThemeContext.jsx # Dark/Light theme provider & sound settings
│       ├── components/
│       │   ├── Header.jsx       # App logo, theme/sound toggles, sync status, new task button
│       │   ├── Stats.jsx        # Circular gauge, daily progress bar & summary counters
│       │   ├── FilterBar.jsx    # Search bar, status tabs, priority/category filters, sorting
│       │   ├── TaskItem.jsx     # Glassmorphic task card with animated checkbox & badges
│       │   ├── SubtaskList.jsx  # Nested interactive subtasks checklist
│       │   ├── TaskForm.jsx     # Modal for creating & editing tasks with validation
│       │   ├── TaskDetailModal.jsx # Full-detail viewer & notes editor
│       │   ├── EmptyState.jsx   # Context-aware empty state illustrations
│       │   └── Toast.jsx        # Glassmorphic toasts with Undo action
│       └── utils/
│           ├── dateUtils.js     # Relative formatting ("Today", "Tomorrow", "Overdue")
│           └── sound.js         # Web Audio API audio effects
```
