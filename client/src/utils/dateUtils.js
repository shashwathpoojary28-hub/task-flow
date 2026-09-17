/**
 * Date utility functions for task management
 */

export function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `${Math.abs(diffDays)}d overdue`,
      status: 'overdue',
      formatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  } else if (diffDays === 0) {
    return {
      text: 'Today',
      status: 'today',
      formatted: 'Today'
    };
  } else if (diffDays === 1) {
    return {
      text: 'Tomorrow',
      status: 'tomorrow',
      formatted: 'Tomorrow'
    };
  } else if (diffDays <= 7) {
    return {
      text: `In ${diffDays} days`,
      status: 'upcoming',
      formatted: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };
  } else {
    return {
      text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'future',
      formatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  }
}

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNextWeekDateString() {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const year = nextWeek.getFullYear();
  const month = String(nextWeek.getMonth() + 1).padStart(2, '0');
  const day = String(nextWeek.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
