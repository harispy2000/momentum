const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function monthShortIndex(month: number): string {
  return MONTHS[Math.max(0, Math.min(11, month))];
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return 'No deadline';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'No deadline';
  return `${monthShortIndex(d.getMonth())} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${monthShortIndex(d.getMonth())} ${d.getDate()}, ${d.getFullYear()} · ${hours}:${minutes} ${ampm}`;
}