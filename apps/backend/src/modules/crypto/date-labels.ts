const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
const pad = (n: number): string => n.toString().padStart(2, '0');

export function formatTimeLabel(d: Date, range: '1D' | '7D' | '1M'): string {
  if (range === '1D') return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (range === '7D') return `${SHORT_WEEKDAYS[d.getDay()]}, ${d.getDate()}`;
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
}
