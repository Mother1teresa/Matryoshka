import { api } from "./api.js";

export const favoritesApi = {
  getAll() {
    return api.get("/favorites");
  },

  add(productId) {
    return api.post("/favorites", { product_id: productId });
  },

  remove(productId) {
    return api.delete(`/favorites/${productId}`);
  }
};