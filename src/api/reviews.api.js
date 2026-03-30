import { api } from "./api.js";

export const reviewsApi = {
  getBySellerId(sellerId) {
    return api.get(`/reviews`, { params: { seller_id: sellerId } });
  },

  // Новый метод для ответа продавца
  replyToReview(reviewId, text) {
    return api.post(`/reviews/${reviewId}/reply`, { text });
  }
};