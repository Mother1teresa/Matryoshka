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

export const formatDate = (dateStr) => { 
  if (!dateStr) return 'недавно';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMonths = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 30));
  
  if (diffInMonths === 0) return 'в этом месяце';
  if (diffInMonths < 12) return `${diffInMonths} мес. назад`;
  return `${Math.floor(diffInMonths / 12)} г. назад`;
};
