import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '/src/api/api.js'

export const useReviewStore = defineStore('reviews', () => {
  const allReviews = ref([])    // Все загруженные отзывы (аккумулируем)
  const currentReviews = ref([]) // Отзывы текущего просматриваемого продавца
  const isLoading = ref(false)

  // === GETTERS ===
  const averageRating = computed(() => {
    if (!currentReviews.value.length) return 0
    const sum = currentReviews.value.reduce((acc, r) => acc + r.rating, 0)
    return (sum / currentReviews.value.length).toFixed(1)
  })

  const getRatingById = (id) => {
    if (!id) return 0
    const sellerReviews = allReviews.value.filter(r => String(r.targetUserId) === String(id))
    if (sellerReviews.length === 0) return 0
    const sum = sellerReviews.reduce((acc, r) => acc + r.rating, 0)
    return (sum / sellerReviews.length).toFixed(1)
  }

  const getReviewsCountById = (id) => {
    if (!id) return 0
    return allReviews.value.filter(r => String(r.targetUserId) === String(id)).length
  }

  const renderStars = (rating) => {
    const r = Math.round(Number(rating) || 0)
    return '★'.repeat(r) + '☆'.repeat(5 - r)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // === ACTIONS ===
  // Загрузка отзывов через профиль продавца
  const fetchReviewsBySeller = async (sellerId) => {
    if (!sellerId) {
      currentReviews.value = []
      return
    }
    isLoading.value = true
    try {
      const res = await api.get(`/profile/${sellerId}`)
      const profileData = res.data || {}
      const backendReviews = profileData.reviews || []
      
      // Маппим в наш формат
      const mapped = backendReviews.map((r, index) => ({
        id: r.id || `${r.authorId}-${r.createdAt}-${index}`,
        targetUserId: r.targetUserId,
        authorId: r.authorId,
        author: r.authorName || 'Пользователь',
        userAvatar: r.authorAvatarUrl || '/src/assets/img/mask-avatar.png',
        rating: r.rating || 0,
        text: r.comment || '',
        date: r.createdAt,
        reply: r.ownerReply || null,
        isReplied: r.isReplied || false
      }))
      
      // Добавляем в allReviews, НЕ удаляя старые (фильтруем дубликаты по id)
      const existingIds = new Set(allReviews.value.map(r => r.id))
      const newReviews = mapped.filter(r => !existingIds.has(r.id))
      allReviews.value = [...allReviews.value, ...newReviews]
      
      currentReviews.value = mapped
      
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error)
      currentReviews.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Создание отзыва
  const createReview = async (payload) => {
    const { targetUserId, authorId, rating, comment, images = [] } = payload
    
    const apiPayload = {
      targetUserId,
      authorId,
      ratingValue: rating,
      comment: comment || ''
    }
    
    try {
      await api.post('/reviews', apiPayload)
      
      // Перезагружаем отзывы продавца, чтобы получить актуальные данные с бэка
      await fetchReviewsBySeller(targetUserId)
      
    } catch (error) {
      console.error('Ошибка создания отзыва:', error)
      throw error
    }
  }

  // Ответ на отзыв
  const addReply = async (reviewId, replyText, currentUserId) => {
    try {
      await api.patch(`/reviews/${reviewId}/reply?currentUserId=${currentUserId}`, replyText)
      
      // Обновляем локально в allReviews
      const review = allReviews.value.find(r => r.id === reviewId)
      if (review) {
        review.reply = replyText
        review.isReplied = true
      }
      // И в currentReviews
      const current = currentReviews.value.find(r => r.id === reviewId)
      if (current) {
        current.reply = replyText
        current.isReplied = true
      }
    } catch (error) {
      console.error('Ошибка при отправке ответа:', error)
      throw error
    }
  }
  // Инициализация
  const initUserReviews = async (userId) => {
    if (userId) await fetchReviewsBySeller(userId)
  }

  return {
    allReviews,
    reviews: currentReviews,
    isLoading,
    averageRating,
    getRatingById,
    getReviewsCountById,
    formatDate,
    fetchReviewsBySeller,
    renderStars,
    addReply,
    createReview,
    initUserReviews
  }
})