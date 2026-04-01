<template>
  <transition name="fade">
    <div v-if="modal.isOpen" class="auth-modal" @click.self="modal.close()">
      <div class="auth-box">

        <LoginForm v-if="modal.type === 'login'" />
        <RegisterForm v-if="modal.type === 'register'" />
        <EmailForm v-if="modal.type === 'email'" />
        <ForgotPasswordForm v-if="modal.type === 'forgot'" />

        <div v-if="modal.overlay" class="overlay">
          <SmsForm />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { watch, onUnmounted } from "vue"
import { useModalStore } from "/src/stores/modal.js"

import LoginForm from "../components/auth/LoginForm.vue"
import RegisterForm from "../components/auth/RegisterForm.vue"
import SmsForm from "../components/auth/SmsForm.vue"
import EmailForm from "../components/auth/EmailForm.vue"
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm.vue"

const modal = useModalStore()
watch(
  () => modal.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.classList.add("overflow-mod")
    } else {
      document.body.classList.remove("overflow-mod")
    }
  },
  { immediate: true }
)

// на случай если компонент уничтожится, а модалка была открыта
onUnmounted(() => {
  document.body.classList.remove("overflow-mod")
})
</script>

<style scoped>
.auth-box {
  position: relative;
  max-width: 40.263rem;
  width: 100%;
  padding: 1.5rem 2.8rem 2rem 2.8rem;
  border-radius: 2.125rem;
  background: linear-gradient(
    122.41deg,
    #64A07A 27.12%,
    rgba(16, 89, 101, 1) 101.84%
  );
  color: white;
  z-index: 6;
}

.fade-enter-active,
.fade-leave-active {
  transition: .2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.overlay {
  position: absolute;
  inset: 0;
  z-index: 7;
}
</style>