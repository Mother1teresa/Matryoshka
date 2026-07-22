import { api } from "./api.js";

export const favoritesApi = {
  getAdvertFavorites() {
    return api.get("/advert/favorites");
  },

  toggleAdvertFavorite(advertId) {
    return api.post(`/advert/${advertId}/favorite`);
  }
};