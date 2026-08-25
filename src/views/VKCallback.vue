<template>
  <div class="vk-callback">
    <p>Выполняется вход через ВКонтакте...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '/src/stores/authStore.js';
import { notify } from '/src/utils/notify.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

onMounted(async () => {
  const { code, device_id, state, error, error_description } = route.query;

  // VK вернул ошибку
  if (error) {
    notify(`Ошибка ВК: ${error_description || error}`);
    router.replace('/');
    return;
  }

  if (!code || !device_id || !state) {
    notify('Некорректный ответ от ВКонтакте');
    router.replace('/');
    return;
  }

  try {
    const success = await auth.authenticateVKCallback({
      code,
      deviceId: device_id,
      state
    });

    if (success) {
      notify('Успешный вход через ВКонтакте');
      router.replace('/profile');   // или '/'
    } else {
      notify('Не удалось авторизоваться');
      router.replace('/');
    }
  } catch (e) {
    notify(e.response?.data?.message || 'Ошибка авторизации через ВК');
    router.replace('/');
  }
});
</script>

<style scoped>
.vk-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #333;
}
</style>