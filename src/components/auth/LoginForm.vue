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
      <div class="auth-forgot">Забыли пароль?</div>
    </div>

    <button type="submit" class="auth-btn">Войти</button>

    <div class="form-or">или</div>
    <div class="form-using">
      <div class="form-using__title">Войти с помощью</div>
      <a class="form-using__item">
        <img src="/src/assets/img/form/go-form.svg" alt="" />
        Google
      </a>
      <a class="form-using__item">
        <img src="/src/assets/img/form/vk-form.svg" alt="" />
        Вконтакте
      </a>
      <a class="form-using__item">
        <img src="/src/assets/img/form/max-form.svg" alt="" />
        MAX
      </a>
      <a class="form-using__item">
        <img src="/src/assets/img/form/tg-form.svg" alt="" />
        Telegram
      </a>
    </div>
    <div class="form-noaccount">
      <div class="form-noaccount__text">Нет аккаунта Матрешка?</div>
      <button class="btn-noaccount btn" @click="modal.openRegister()">
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

const auth = useAuthStore();
const modal = useModalStore();

const email = ref("");
const password = ref("");
const errors = ref({
  email: false,
  password: false
})

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
    await auth.loginAPI({
    email: email.value,
    password: password.value
  })
    notify("Вы успешно вошли")
    modal.close()
  }catch(e){
    console.error(e.response?.data)
    notify("Неверный email или пароль");
  }
}
</script>
<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 34.63rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: .5rem;
  text-align: center;
}
.auth-input {
  height: 2.8rem;
  border-radius: 3.375rem;
  border: 1px solid transparent;
  padding: 0 1.625rem;
  color: #000000;
  font-size: 1.15rem;
}
.auth-input__error {
  border-color: #ee3030;
}
.auth-input::placeholder {
  color: #8e8c8c;
}
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
}
.auth-btn:hover,
.auth-btn:focus {
  background: #105965;
  color: white;
}
.form-or {
  text-align: center;
  text-transform: uppercase;
  font-size: 1rem;
}

.auth-forgot {
  cursor: pointer;
}

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
.auth-forgot__check {
  display: flex;
  gap: 0.25rem;
}
.auth-forgot__check input {
  width: 0.938rem !important;
  height: 0.938rem !important;
  border-color: white !important;
  border-radius: 0.313rem !important;
  appearance: none;
  -webkit-appearance: none;
  background-color: white;
}
.auth-forgot__check input:checked {
  background: #105965;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e");
}
.form-noaccount__text{
  font-size: .9rem;
}
</style>
