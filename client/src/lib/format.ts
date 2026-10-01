/** Small formatting helpers shared by several components. */

/**
 * Turns an ISO date from the API into something readable, e.g.
 * "3 Oct 2026". Falls back to the raw string if it cannot be parsed.
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Like `formatDate`, but also shows the time. Used when a post is edited. */
export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Cuts text down to `maxLength` characters for a preview. */
export function truncate(text: string, maxLength = 180): string {
  const clean = text.replace(/\s+/g, ' ').trim();

  if (clean.length <= maxLength) {
    return clean;
  }

  return `${clean.slice(0, maxLength).trimEnd()}...`;
}

/** "Alice Johnson" -> "AJ" - used for the avatar circle. */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}