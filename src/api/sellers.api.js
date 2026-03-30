import { api } from "./api.js";

export const sellersApi = {
  getAll() {
    return api.get("/sellers");
  },

  getById(id) {
    return api.get(`/sellers/${id}`);
  }
};