import { defineStore } from "pinia";
import { ref } from "vue";
import { sellersApi } from "/src/api/sellers.api.js";
export const useSellerStore = defineStore("seller", () => {
const sellers = ref([
  {
    id: "1",
    name: "Мария",
    avatar: "/src/assets/img/mask-avatar.png",
    rating: 4.8,
    type: "private",
    description: "Описание продавца. Переходите на наш сайт https//ooo’dsadda Описание продавца. Переходите на наш сайт https//ooo’dsadda Описание продавца. Переходите на наш сайт https//ooo’dsadda Описание продавца. Переходите на наш сайт https//ooo’dsadda Описание продавца. Переходите на наш сайт https//ooo’dsadda",
    // website: "https://example.com"
  },
  {
    id: "2",
    name: "ООО Рога и Копыта",
    avatar: "/src/assets/img/mask-avatar.png",
    rating: 4.9,
    type: "company"
  }
]);const isLoading = ref(false);
const isLoaded = ref(false);
const lastFetch = ref(null);
  const fetchSellers = async () => {
    if (isLoaded.value) return; 
    isLoading.value = true;
    try {
      const now = Date.now();
      if (lastFetch.value && now - lastFetch.value < 5 * 60 * 1000) {
        return; // кеш 5 минут
      }
      const res = await sellersApi.getAll();
      sellers.value = res.data;
      isLoaded.value = true; 
    } catch (e) {
      console.warn("Ошибка загрузки sellers", e);
    } finally {
      isLoading.value = false;
    }
  };
  const getSellerById = (id) => {
    return sellers.value.find(s => String(s.id) === String(id));
  };
  const ensureSellers = async () => {
    if (sellers.value.length === 0) {
      await fetchSellers();
    }
  };
  return {
    sellers,
    isLoading,
    fetchSellers,
    getSellerById,
    ensureSellers
  };
});