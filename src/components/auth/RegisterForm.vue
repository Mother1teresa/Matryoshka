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
      <div>
        <a class="form-using__item">
          <img src="/src/assets/img/form/go-form.svg" alt="" />
        </a>
        <a class="form-using__item">
          <img src="/src/assets/img/form/vk-form.svg" alt="" />
        </a>
        <a class="form-using__item">
          <img src="/src/assets/img/form/max-form.svg" alt="" />
        </a>
        <a class="form-using__item">
          <img src="/src/assets/img/form/tg-form.svg" alt="" />
        </a>
      </div>
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
import { ref,computed  } from "vue";
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
})
const cleanPhone = computed(() => {
  return phone.value.replace(/\D/g, '')
})
async function submitRegister(){
  errors.value = {
    name: !name.value,
    phone: cleanPhone.value.length !== 11,
    password: !password.value,
    password2: !password2.value
  }

  if(Object.values(errors.value).some(Boolean)){
    notify("Заполните все поля")
    return
  }
  if (password.value.length < 6 && password2.value.length < 6) { 
    errors.value.password = true; 
    errors.value.password2 = true;
     notify("Пароль минимум 6 символов") ;
     return 
  }
  if(password.value !== password2.value){
    errors.value.password = true;
     errors.value.password2 = true;
    notify("Пароли не совпадают")
    return
  }

  // try{
  //   await api.post("/sendsms", { phone: cleanPhone.value }) 
  //   modal.phone = cleanPhone.value
  //   modal.name = name.value
  //   modal.password = password.value
  //   modal.smsMode = "phone"

  //   modal.openSms() 
  //   notify("Код отправлен на телефон")
  // }catch(e){
  //   console.error(e)
  //   notify("Ошибка отправки SMS")
  // }
  modal.registrationData = {
    name: name.value,
    phone: cleanPhone.value,
    password: password.value,
  };
  modal.phone = cleanPhone.value
  modal.name = name.value
  modal.password = password.value
  modal.openEmail();
  notify("Данные сохранены, введите Email")
}
</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 34.63rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 1rem;
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
.form-using div {
  display: flex;
  align-items: center;
  gap: 0.625rem;
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
  padding: 0.563rem 0.938rem 0.625rem 0.938rem;
  border-radius: 0.938rem;
  margin-top: 0.313rem;
  margin-bottom: 0.75rem;
}

.form-noaccount__text{
  font-size: .9rem;
}
</style>
