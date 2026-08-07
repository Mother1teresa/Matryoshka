import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '/src/api/api.js'

export const useReviewStore = defineStore('reviews', () => {
  const allReviews = ref([])
  const currentReviews = ref([])
  const isLoading = ref(false)

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

      const mapped = backendReviews.map((r, index) => ({
        id: r.id || `${r.authorId}-${r.createdAt}-${index}`,
        targetUserId: r.targetUserId,
        authorId: r.authorId,
        author: r.authorName || 'Пользователь',
        userAvatar: r.authorAvatarUrl || '/img/users/mask-avatar.png',
        rating: r.rating || 0,
        text: r.comment || '',
        date: r.createdAt,
        reply: r.ownerReply || null,
        isReplied: r.isReplied || false,
        productId: r.productId || null
      }))

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

  const createReview = async (payload) => {
    const {
      targetUserId,
      authorId,
      rating,
      comment,
      dealStatus,
      finishReason,
      images = []
    } = payload

    const apiPayload = {
      targetUserId,
      authorId,
      ratingValue: rating,
      comment: comment || '',
      dealStatus: dealStatus || null,
      finishReason: finishReason || null
    }

    try {
      await api.post('/profile/reviews', apiPayload)
      await fetchReviewsBySeller(targetUserId)
    } catch (error) {
      console.error('Ошибка создания отзыва:', error)
      throw error
    }
  }

  const addReply = async (reviewId, replyText, productId = null) => {
    try {
      const payload = { replyText }
      if (productId) payload.productId = productId

      await api.patch(
        `/profile/reviews/${reviewId}/reply`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      )

      const review = allReviews.value.find(r => r.id === reviewId)
      if (review) {
        review.reply = replyText
        review.isReplied = true
      }
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