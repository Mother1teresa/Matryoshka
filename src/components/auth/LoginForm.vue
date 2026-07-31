<template>
  <form class="auth-form" @submit.prevent="submitLogin">
    <div class="auth-title">Вход</div>
    <input
      v-model="email"
      type="email"
      placeholder="Email"
      required
      class="auth-input"
      :class="{ 'auth-input__error': errors.email }"
    />
    <input
      v-model="password"
      type="password"
      placeholder="Пароль"
      required
      class="auth-input"
      :class="{ 'auth-input__error': errors.password }"
    />
    <div class="auth-forgot__box">
      <label class="auth-forgot__check">
        <input type="checkbox" name="" id="" />
        <span>Запомнить пароль</span>
      </label>
      <!-- @click="modal.openForgot()" -->
      <div @click="modal.openForgot()" class="auth-forgot">Забыли пароль?</div>
    </div>

    <button type="submit" class="auth-btn">Войти</button>

    <div class="form-or">или</div>
    <div class="form-using">
      <div class="form-using__title">Войти с помощью</div>
      <!-- Контейнер для VK OneTap -->
      <div class="vk-wrapper">
        <div ref="vkContainer" class="vk-auth-container"></div>
      </div>
    </div>
    <div class="form-noaccount">
      <div class="form-noaccount__text">Нет аккаунта Матрешка?</div>
      <button type="button" class="btn-noaccount btn" @click="modal.openRegister()">
        Зарегистрироваться
      </button>
      <div class="form-noaccount__text">
        Нажимая на кнопку “Зарегистрироваться”, вы принимаете условия
        пользовательского соглашения.
      </div>
    </div>
  </form>
</template>
<script setup>
import { ref } from "vue";
import { useAuthStore } from "/src/stores/authStore.js";
import { useModalStore } from "/src/stores/modal.js";
import { notify } from "../../utils/notify";
import { useVKAuth } from "/src/stores/useVKAuth.js";

const auth = useAuthStore();
const modal = useModalStore();

const email = ref("");
const password = ref("");
const errors = ref({ email: false, password: false})
const vkContainer = ref(null);

// watch([email, password], () => {
//   errors.value.email = false;
//   errors.value.password = false;
// });

useVKAuth(vkContainer, {
  appId: import.meta.env.VITE_VK_APP_ID,
  redirectUrl: window.location.origin,
  onSuccess: async (vkData) => {
    try {
      await auth.loginWithVK(vkData);
      notify("Успешный вход через ВКонтакте");
      modal.close();
    } catch (e) {
      notify(e.response?.data?.message || "Ошибка входа через ВК");
    }
  },
  onError: () => notify("Ошибка авторизации ВКонтакте"),
});
async function submitLogin(){
  errors.value = {
    email: !email.value,
    password: !password.value
  }
  if(Object.values(errors.value).some(Boolean)){
    notify("Введите email или пароль")
    return
  }
  try{
    const success = await auth.loginAPI({
      email: email.value,
      password: password.value
    });
    if (success) {
      notify("Вы успешно вошли в систему");
      modal.close();
      email.value = "";
      password.value = "";
    }
  }catch(e){
    const serverMessage = e.response?.data?.message;
    notify(serverMessage || "Неверный email или пароль");
    errors.value.email = true;
    errors.value.password = true;
  }
}
</script>
<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  width: 34.63rem;
}
.auth-title {
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: .5rem;
  text-align: center;
  color: #fff;
}
.auth-input {
  height: 2.8rem;
  border-radius: 3.375rem;
  border: 1px solid transparent;
  padding: 0 1.625rem;
  color: #000000;
  font-size: 1.15rem;
}
.auth-input__error {border-color: #ee3030;}
.auth-input::placeholder {color: #8e8c8c;}
.auth-btn {
  width: 7.063rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  border: none;
  background: white;
  color: #9e9e9e;
  font-weight: 400;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.auth-form:not(:has(.form-or)) .auth-btn {margin-bottom: 2rem;}
.auth-btn:hover,
.auth-btn:focus {
  opacity: 80%;
}
.form-or {
  text-align: center;
  text-transform: uppercase;
  font-size: 1rem;
}
.auth-forgot {cursor: pointer;}
.form-using {
  display: grid;
  justify-items: start;
  justify-content: start;
  gap: 0.313rem;
}
.form-using__item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}
.form-using__item img {
  width: 1.875rem;
  height: 1.875rem;
  border-radius: 50%;
}
.btn-noaccount {
  color: #6e6e6e;
  background: white;
  padding: 0.563rem 0.938rem;
  border-radius: 0.938rem;
  margin-top: 0.313rem;
  margin-bottom: 0.75rem;
  font-size: .9rem;
}
.auth-forgot__box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -1.3rem;
  font-size: 0.813rem;
  height: 2.875rem;
}
.form-noaccount__text{
  font-size: .9rem;
}
.vk-auth-container {
  display: flex;
  justify-content: center;
  margin: 8px 0;
}
.vk-auth-container :deep(iframe) {
  max-width: 100% !important;
}
.vk-wrapper {
  width: 100%;
  display: block;
}
</style>
