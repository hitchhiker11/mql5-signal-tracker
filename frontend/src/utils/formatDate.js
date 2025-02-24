export function formatDate(date) {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

export function formatDuration(hours) {
  if (hours < 24) {
    return `${hours} ч.`;
  }
  const days = Math.floor(hours / 24);
  return `${days} д.`;
}
