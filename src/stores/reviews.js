import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { reviewsApi } from '/src/api/reviews.api.js'

export const useReviewStore = defineStore('reviews', () => {
  const allReviews = ref([
    { id: 1, sellerId: '1',author: 'Иван',userAvatar: '/src/assets/img/mask-avatar.png',productTitle: 'Дождевик чугунный', text: 'Отличный товар!', rating: 5,date: '2023-11-15', reply: 'Спасибо за отзыв!' },
    { id: 2, sellerId: '1',author: 'Анна',userAvatar: '/src/assets/img/mask-avatar.png',productTitle: 'Зонт стальной',  text: 'Долго везли', rating: 3,date: '2023-10-25', reply: null },
    { id: 3, sellerId: '2',author: 'Олег',userAvatar: '/src/assets/img/mask-avatar.png',productTitle: 'Дождевик чугунный',  text: 'Все супер', rating: 5,date: '2023-11-15', reply: null }
  ]);
  const reviews = ref([])
  const isLoading = ref(false)

  const averageRating = computed(() => {
    if (reviews.value.length === 0) return 0;
    const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.value.length).toFixed(1);
  });
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    // Самый простой вариант - локальная дата. 
    // Если хочешь именно "X дней назад", лучше взять библиотеку date-fns
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };
   const getRatingById = (id) => {
    if (!id) return 0;
    const items = allReviews.value.filter(r => String(r.sellerId) === String(id));
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, r) => acc + r.rating, 0);
    return (sum / items.length).toFixed(1);
  };
   const renderStars = (rating) => {
    const r = Math.round(Number(rating) || 0);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };

  // Загрузка отзывов по ID продавца
  const fetchReviewsBySeller = async (sellerId) => {
    isLoading.value = true
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
    //   const response = await reviewsApi.getBySellerId(sellerId)
    //   reviews.value = response.data; 
        reviews.value = allReviews.value.filter(r => String(r.sellerId) === String(sellerId));
    } catch (error) {
      console.error('Ошибка при загрузке отзывов:', error)
    } finally {
      isLoading.value = false
    }
  }
  return {
    allReviews,
    reviews,
    isLoading,
    averageRating,
    getRatingById,
    formatDate,
    fetchReviewsBySeller,
    renderStars 
  }
})
