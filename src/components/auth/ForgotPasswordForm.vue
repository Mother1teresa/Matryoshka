<template>
<form class="auth-form" @submit.prevent="submitForgot">
  <div class="auth-title">Восстановление пароля</div>
  <input v-model="email" type="email" placeholder="Введите свой адрес электронной почты" required class="auth-input"/>
  <div class="auth-btn__box">
    <button type="submit" class="auth-btn">Отправить код</button>
  </div>

  <div class="auth-bottom">
    <span @click="modal.openLogin()">Назад</span>
  </div>
</form>
</template>

<script setup>
import { ref } from "vue"
import { useModalStore } from "/src/stores/modal.js"
import { notify } from "../../utils/notify"
import { api } from "/src/api/api.js"

const modal = useModalStore()
const email = ref("")
const errors = ref({
  email: false
})

async function submitForgot(){
  errors.value.email = !email.value

  if(errors.value.email){
    notify("Введите email")
    return
  }

  try{
    await api.post("/auth/send-email-code", {
      email: email.value
    })
    modal.email = email.value
    modal.openEmail()
    notify("Код отправлен на email")
  }catch(e){
    notify("Ошибка отправки")
  }
}
</script>
<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 34.313rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 2.563rem;
  text-align: center;
}
.auth-input {
  height: 3.5rem;
  border-radius: 3.375rem;
  border: 1px solid transparent;
  padding: 0 1.625rem;
  color: #000000;
  font-size: 1.25rem;
}
.auth-input__error {
  border-color: #ee3030;
}
.auth-input::placeholder {
  color: #8e8c8c;
}
.auth-btn__box{
  display: flex;
  justify-content: right;
}
.auth-btn {
  width: fit-content;
  height: 3rem;
  border-radius: 0.938rem;
  padding: 0.713rem 1.563rem 0.75rem 1.563rem;
  border: none;
  background: white;
  color: #9e9e9e;
  font-weight: 400;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
}
.auth-btn:hover {
  background: #105965;
  color: white;
}

.auth-bottom{
  text-align: center;
}
.auth-bottom span{
  cursor: pointer;
}
</style>