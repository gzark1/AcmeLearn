/**
 * Format a date string or Date object to a readable format
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

/**
 * Format course duration in hours to a readable string
 * e.g., 40 → "40 hours", 1 → "1 hour"
 */
export function formatDuration(hours: number): string {
  if (hours === 1) {
    return '1 hour'
  }
  return `${hours} hours`
}

/**
 * Format a date with time
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}
