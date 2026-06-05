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
  const now = new Date();
  
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  // Сегодня — показываем время или "только что"
  if (diffDay === 0) {
    if (diffMin < 1) return 'только что';
    if (diffMin < 60) return `${diffMin} мин назад`;
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `сегодня в ${hours}:${minutes}`;
  }
  
  // Вчера
  if (diffDay === 1) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `вчера в ${hours}:${minutes}`;
  }
  
  // Этот год — "9 дек в 10:56"
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  if (date.getFullYear() === now.getFullYear()) {
    return `${day} ${month} в ${hours}:${minutes}`;
  }
  
  // Прошлые годы — "15 мар 2024 в 10:56"
  const year = date.getFullYear();
  return `${day} ${month} ${year} в ${hours}:${minutes}`;
};
