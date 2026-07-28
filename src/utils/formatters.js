export const formatNumber = (num) => {
  if (!num) return 0;
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'к';
  }
  return num;
};

export const formatFullNumber = (num) => {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};
const MONTHS = [
  'янв', 'фев', 'мар', 'апр', 'мая', 'июн', 
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
];

export const formatDate = (dateStr) => {
  if (!dateStr) return 'недавно';
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'недавно';
  
  const now = new Date();
  
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 1000 / 60);
  
  // Сравниваем календарные дни (без времени) — корректно при переходе через полночь
  const stripTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((stripTime(now) - stripTime(date)) / (1000 * 60 * 60 * 24));
  
  // Сегодня
  if (diffDays === 0) {
    if (diffMin < 1) return 'только что';
    if (diffMin < 60) return `${diffMin} мин назад`;
    
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `сегодня в ${h}:${m}`;
  }
  
  // Вчера
  if (diffDays === 1) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `вчера в ${h}:${m}`;
  }
  
  // Этот год — "9 дек в 10:56"
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  
  if (date.getFullYear() === now.getFullYear()) {
    return `${day} ${month} в ${h}:${m}`;
  }
  
  // Прошлые годы — "15 мар 2024 в 10:56"
  return `${day} ${month} ${date.getFullYear()} в ${h}:${m}`;
};