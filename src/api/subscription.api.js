import { api } from "./api.js";

export const subscriptionApi = {
  subscribe(sellerId) {
    return api.post("/subscriptions", { seller_id: sellerId });
  },

  unsubscribe(sellerId) {
    return api.delete(`/subscriptions/${sellerId}`);
  }
};