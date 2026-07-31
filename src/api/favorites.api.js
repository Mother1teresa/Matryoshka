import { api } from "./api.js";

export const favoritesApi = {
  getAdvertFavorites() {
    return api.get("/adverts/favorites");
  },
  addAdvertFavorite(advertId) {
    return api.post(`/adverts/${advertId}/favorite`);
  },
  removeAdvertFavorite(advertId) {
    return api.delete(`/adverts/${advertId}/favorite`);
  }
};