import { defineStore } from "pinia";
import { ref } from "vue";
import { subscriptionApi } from "/src/api/subscription.api.js";

export const useSubscriptionStore = defineStore("subscription", () => {
  const subscriptions = ref([]);

  const isSubscribed = (sellerId) => {
    return subscriptions.value.includes(sellerId);
  };

  const toggle = async (sellerId) => {
    const index = subscriptions.value.indexOf(sellerId);
    const isAdding = index === -1;

    // 🔥 оптимистично
    if (isAdding) {
      subscriptions.value.push(sellerId);
    } else {
      subscriptions.value.splice(index, 1);
    }

    try {
      if (isAdding) {
        await subscriptionApi.subscribe(sellerId);
      } else {
        await subscriptionApi.unsubscribe(sellerId);
      }
    } catch (e) {
      console.warn("Ошибка подписки", e);
    }

    return isAdding;
  };

  return {
    subscriptions,
    toggle,
    isSubscribed
  };
});