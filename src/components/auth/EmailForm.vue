<template>
<form @submit.prevent="submit" class="auth-form">
  <div class="auth-title">Осталось еще чуть-чуть!</div>
  <input
    v-model="email"
    @input="errors.email = false" 
    type="email"
    placeholder="Введите свой адрес электронной почты"
    class="auth-input"
    :class="{ 'auth-input__error': errors.email }"
  />
  <div class="auth-btn__box">
    <button type="submit" class="auth-btn">
    Далее
    </button>
  </div>
</form>
</template>
<script setup>
import { ref } from "vue"
import { useModalStore } from "/src/stores/modal.js"
import { notify } from "../../utils/notify"
import { api } from "/src/api/api.js"

const modal = useModalStore()
const email = ref("");
const errors = ref({
  email: false
})
async function submit(){
  if (!email.value) return notify("Введите email")
  try{
    await api.post("/auth/sendmail", {
      email: email.value,
    })   
    modal.email = email.value;
    modal.smsMode = "email";
    
    notify("Код отправлен на почту");
    modal.openSms();
  }catch(e){
    errors.value.email = true; // Теперь инпут подсветится красным
    // Выводим только текст ошибки, если сервер его прислал
    const errorMessage = e.response?.data?.message || "Ошибка сервера (500)";
    notify(errorMessage);
    console.error("Ошибка при отправке:", e.message);
    notify("Ошибка отправки");
}}
</script>
<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 34.313rem;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 400;
  margin-bottom: 2.25rem;
  margin-top: .75rem;
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
.auth-btn__box{
  display: flex;
  justify-content: right;
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

</style>