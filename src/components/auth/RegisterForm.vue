<template>
  <form class="auth-form" @submit.prevent="submitRegister">
    <div class="auth-title">Регистрация</div>
    <input v-model="name" placeholder="Имя" required class="auth-input" :class="{ 'auth-input__error': errors.name }"/>
    <input
      v-model="phone"
      v-mask="'+7 (###) ###-##-##'"
      type="tel"
      placeholder="Номер телефона"
      required
      class="auth-input"
      :class="{ 'auth-input__error': errors.phone }"
    />
    <input
      v-model="password"
      type="password"
      placeholder="Пароль"
      required
      class="auth-input"
      :class="{ 'auth-input__error': errors.password }"
    />
    <input
      v-model="password2"
      type="password"
      placeholder="Повторить пароль"
      required
      class="auth-input"
      :class="{ 'auth-input__error': errors.password2 }"
    />

    <div class="form-or">или</div>
    <div class="form-using">
      <div class="form-using__title">Продолжить через</div>
      <button type="button" class="vk-btn" @click="redirectToVK">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.19 1.365 1.26 2.18 1.817.616.422 1.084.33 1.084.33l2.177-.03s1.14-.071.599-.97c-.044-.073-.314-.66-1.617-1.866-1.364-1.261-1.182-1.057.462-3.236.998-1.332 1.397-2.145 1.272-2.494-.12-.333-.86-.245-.86-.245l-2.45.015s-.182-.025-.316.056c-.132.08-.216.266-.216.266s-.39 1.037-.91 1.92c-1.096 1.86-1.534 1.96-1.713 1.842-.418-.27-.314-1.085-.314-1.663 0-1.808.274-2.562-.534-2.758-.268-.065-.465-.108-1.148-.115-.876-.01-1.618.003-2.038.208-.28.138-.495.444-.364.462.163.022.532.1.728.363.253.34.244 1.103.244 1.103s.145 1.063-.34 1.195c-.333.09-.704-.093-1.576-.93-1.116-1.074-1.575-2.145-1.575-2.145s-.13-.284-.363-.437c-.284-.19-.68-.249-.68-.249l-2.33.015s-.35.01-.478.162c-.115.137-.01.42-.01.42s1.827 4.273 3.897 6.43c1.898 1.977 4.054 1.85 4.054 1.85h.977z" fill="#fff"/>
        </svg>
        <span>ВКонтакте</span>
      </button>
    </div> 
    <div class="form-noaccount">
      <button type="submit" class="auth-btn">Зарегистрироваться</button>
      <div class="form-noaccount__text">
        Нажимая на кнопку “Зарегистрироваться”, вы принимаете условия
        пользовательского соглашения.
      </div>
    </div>
    <div class="auth-bottom">
      Уже есть аккаунт?
      <span @click="modal.openLogin()">Войти</span>
    </div>
  </form>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "/src/stores/authStore.js"
import { useModalStore } from "/src/stores/modal.js";
import { notify } from "../../utils/notify";

const modal = useModalStore();
const auth = useAuthStore();

const name = ref("");
const phone = ref(""); 
const password = ref("");
const password2 = ref("");
const errors = ref({
  name: false,
  phone: false,
  password: false,
  password2: false
});
const cleanPhone = computed(() => {
  return phone.value.replace(/\D/g, '');
});

async function submitRegister() {
  errors.value = {
    name: !name.value,
    phone: cleanPhone.value.length !== 11,
    password: !password.value,
    password2: !password2.value
  };

  if (Object.values(errors.value).some(Boolean)) {
    notify("Заполните все поля");
    return;
  }
  if (password.value.length < 6 && password2.value.length < 6) { 
    errors.value.password = true; 
    errors.value.password2 = true;
    notify("Пароль минимум 6 символов");
    return;
  }
  if (password.value !== password2.value) {
    errors.value.password = true;
    errors.value.password2 = true;
    notify("Пароли не совпадают");
    return;
  }

  modal.registrationData = {
    name: name.value,
    phone: cleanPhone.value,
    password: password.value,
  };
  modal.phone = cleanPhone.value;
  modal.name = name.value;
  modal.password = password.value;
  modal.openEmail();
  notify("Данные сохранены, введите Email");
}

async function redirectToVK() {
  try {
    const url = await auth.getVKAuthUrl();
    window.location.href = url;
  } catch (e) {
    notify("Не удалось получить ссылку для регистрации через ВКонтакте");
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
  margin-bottom: 1rem;
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
.auth-input__error {
  border-color: #ee3030;
}
.auth-input::placeholder {
  color: #8e8c8c;
}
.auth-btn {
  width: fit-content;
  height: 2.5rem;
  border-radius: 0.75rem;
  padding: 0 1rem;
  border: none;
  background: white;
  color: #9e9e9e;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
  font-size: 1rem;
  margin-bottom: 0.313rem;
}
/* .auth-form:not(:has(.form-or)) .form-noaccount {
  margin-bottom: 2rem;
} */
.auth-form:not(:has(.form-or)) .form-noaccount { margin-top: 2rem; }
.auth-btn:hover, .auth-btn:focus { opacity: 80%; }
.form-or {
  text-align: center;
  text-transform: uppercase;
  font-size: 1rem;
}

.auth-bottom {
  text-align: center;
  font-size: .9rem;
}

.auth-bottom span {
  cursor: pointer;
  text-decoration: underline;
}

.form-using {
  display: grid;
  justify-items: start;
  justify-content: start;
  gap: 0.313rem;
}
/* .form-using div {
  display: flex;
  align-items: center;
  gap: 0.625rem;
} */
.form-using__title {
  font-size: 0.9rem;
  color: #fff;
}
.vk-btn {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: #0077ff;
  color: #fff;
  border: none;
  border-radius: 0.75rem;
  padding: 0.5rem 1.25rem;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.3s;
}
.vk-btn:hover { opacity: 0.85; }
.btn-noaccount {
  color: #6e6e6e;
  background: white;
  padding: 0.563rem 0.938rem 0.625rem 0.938rem;
  border-radius: 0.938rem;
  margin-top: 0.313rem;
  margin-bottom: 0.75rem;
  border: none;
  cursor: pointer;
}
.form-noaccount__text { font-size: .9rem; }
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
  padding: 0.563rem 0.938rem 0.625rem 0.938rem;
  border-radius: 0.938rem;
  margin-top: 0.313rem;
  margin-bottom: 0.75rem;
}
/* .vk-auth-container {
  display: flex;
  justify-content: center;
  margin: 8px 0;
}
.vk-auth-container :deep(iframe) {
  max-width: 100% !important;
}
.vk-wrapper {
  width: 20%;
  display: block;
}
#hoezgo .VkIdWebSdk__button_hoezgo{
  width: 2.5rem !important;
  height: 2.5rem !;
  padding: 0.375rem !important;
  border-radius: 0.75rem !important;
}
#xekcyg .VkIdWebSdk__button_xekcyg{
  width: 2.5rem !important;
  height: 2.5rem !;
  padding: 0.375rem !important;
  border-radius: 0.75rem !important;
} */
</style>
