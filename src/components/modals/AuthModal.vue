<template>
  <div
    v-if="modalStore.isAuthModalOpen"
    class="modal-overlay"
    @click="modalStore.closeAuthModal"
  >
    <div class="modal" @click.stop>
      <h2>Вход или регистрация</h2>
      <div class="header__right-true">
        <button @click="login" class="btn-primary btn">Войти</button>

        <button @click="modalStore.closeAuthModal" class="btn-light">
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useModalStore } from "/src/stores/modal.js";
import { useAuthStore } from "/src/stores/authStore.js";

const modalStore = useModalStore();
const authStore = useAuthStore();

const login = () => {
  authStore.login();
  modalStore.closeAuthModal();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 300px;
}

.modal h2 {
  margin-bottom: 1rem;
}

.header__right-true {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.7rem;
}

</style>
