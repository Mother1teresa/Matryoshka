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
    if (!reviews.value.length) return 0
    const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
    return (sum / reviews.value.length).toFixed(1)
  })
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };
  const getRatingById = (id) => {
  if (!id) return 0;
  const sellerReviews = allReviews.value.filter(r => String(r.sellerId) === String(id));
  if (sellerReviews.length === 0) return 0;
  const sum = sellerReviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / sellerReviews.length).toFixed(1);
};
  const renderStars = (rating) => {
    const r = Math.round(Number(rating) || 0);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };
  const getReviewsCountById = (id) => {
  if (!id) return 0;
  // Считаем по всем загруженным в память отзывам
  return allReviews.value.filter(r => String(r.sellerId) === String(id)).length;
};
  // Загрузка отзывов по ID продавца
  const fetchReviewsBySeller = async (sellerId) => {
    isLoading.value = true;
    try {
      // Имитируем запрос к бэку (потом раскомментируете)
      // const res = await reviewsApi.getBySellerId(sellerId).catch(() => ({ data: [] }));
      // const data = res?.data || [];

      if (data.length > 0) {
        // ЕСЛИ ПРИШЕЛ БЭК:
        // Убираем старые данные этого продавца из allReviews и записываем новые
        allReviews.value = [
          ...allReviews.value.filter(r => String(r.sellerId) !== String(sellerId)),
          ...data
        ];
        reviews.value = data;
      } else {
        // ЕСЛИ БЭК ПУСТОЙ: работаем с тем, что есть в allReviews (тестами)
        reviews.value = allReviews.value.filter(r => String(r.sellerId) === String(sellerId));
      }
    } catch (error) {
      console.error('Ошибка:', error);
      reviews.value = allReviews.value.filter(r => String(r.sellerId) === String(sellerId));
    } finally {
      isLoading.value = false;
    }
  };
  const initUserReviews = async (userId) => {
    if (userId) await fetchReviewsBySeller(userId);
  };
  const addReply = async (reviewId, replyText) => {
    try {
      await reviewsApi.replyToReview(reviewId, replyText)
      // Локально обновляем отзыв в списке, чтобы не перезагружать всё
      const review = reviews.value.find(r => r.id === reviewId)
      if (review) review.reply = replyText
    } catch (error) {
      console.error('Ошибка при отправке ответа:', error)
      throw error 
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
    renderStars,
    addReply,
    getReviewsCountById,
    initUserReviews
  }
})
