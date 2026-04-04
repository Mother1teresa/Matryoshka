<template>
<div class="sms-overlay">
  <div class="sms-card">
    <div class="sms-title">{{ title }}</div>
    <p class="sms-subtitle">{{ subtitle }}</p>
    <!-- CODE INPUTS -->
    <div class="code-wrapper">
      <input
        v-for="(digit, index) in code"
        :key="index"
        ref="inputs"
        maxlength="1"
        type="text"
        inputmode="numeric"
        class="code-input"
        :class="{ error: showError }"
        v-model="code[index]"
        @input="handleInput(index)"
        @keydown.backspace="handleBackspace(index)"
      />
    </div>
    <p class="resend">
      <span v-if="timer > 0">
        повторить через {{ timer }} сек
      </span>
      <span v-else @click="resendCode" class="resend-link">
        Отправить код снова
      </span>
    </p>
  </div>
</div>
</template>
<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted  } from "vue"
import { useModalStore } from "/src/stores/modal.js"
import { useAuthStore } from "/src/stores/authStore.js";
import { notify } from "../../utils/notify";
import { api } from "/src/api/api.js"

const modal = useModalStore()
const auth = useAuthStore()
const inputs = ref([])
const code = ref(["","","","","",""])
const showError = ref(false)
const timer = ref(60)
let interval = null

const title = computed(() => 
  modal.smsMode === "phone" ? "Введите код из СМС" : "Введите код из почты"
)
const subtitle = computed(() => {
  if (modal.smsMode === "phone" && modal.phone) {
    return "+7 ***** " + modal.phone.slice(-5)
  }
  if (modal.smsMode === "email" && modal.email) {
    const parts = modal.email.split("@")
    if (parts.length < 2) return modal.email
    const [name, domain] = parts
    return name.slice(0, 2) + "***@" + domain
  }
  return ""
})

const fullCode = computed(() => code.value.join(""))
function handleInput(index) {
  if (code.value[index] && index < 5) {
    inputs.value[index + 1].focus()
  }
  if (fullCode.value.length === 6) {
    verifyCode()
  }
}
function handleBackspace(index){
  if(!code.value[index] && index > 0){
    inputs.value[index - 1].focus()
  }
}
async function verifyCode(){
  if(fullCode.value.length !== 6){
    showErrorState()
    return
  }
  //  try {
  //   await auth.verifyCodeAPI({
  //     code: fullCode.value,
  //     phone: modal.phone,
  //     email: modal.smsMode === "email" ? modal.email : undefined
  //   })
  //   if (modal.smsMode === "phone") {
  //     notify("Телефон подтвержден")
  //     modal.openEmail() // Это форма ввода Email (EmailForm.vue)
  //   } else {
  //     // 3. Если подтвержден Email — ПРОВОДИМ РЕГИСТРАЦИЮ
  //     // Теперь у нас есть и телефон, и почта, и пароль
  //     await auth.registerAPI({
  //       name: modal.name,
  //       phone: modal.phone,
  //       email: modal.email,
  //       password: modal.password
  //     })
  //     notify("Регистрация завершена успешно!")
  //     modal.close()
  //   }
  // } 
  try {
    // Проверяем код (теперь это всегда код из Email)
    const payload = {
      userId: modal.email, 
      code: fullCode.value,
      type: modal.smsMode,
      value: modal.email         
    };

    console.log("Отправка на /check-code:", payload);
    await auth.verifyCodeAPI(payload);
    // Если код прошел, вызываем регистрацию
    const res = await auth.registerAPI({
      name: modal.name,
      email: modal.email,
      phone: modal.phone,
      password: modal.password
    });
    if (res && res.user) {
      auth.login(res.user); 
      notify("Регистрация завершена успешно!");
      modal.close();
    }
  }
  catch (e) {
    showErrorState()
    const errorMsg = e.response?.data?.message || "Неверный код"
    notify(errorMsg)
    console.error("Ошибка при проверке:", e.response?.data || e.message);
  }
}
function showErrorState(){
  showError.value = true
  setTimeout(()=>{
    showError.value = false
    code.value = ["","","","","",""]
    inputs.value[0].focus()
  },1000)
}

function startTimer() {
  clearInterval(interval)
  timer.value = 60
  interval = setInterval(() => {
    if (timer.value > 0) timer.value--
    else clearInterval(interval)
  }, 1000)
}
async function resendCode() {
  try {
    if (modal.smsMode === "phone") {
      await api.post("/auth/sendsms", { phone: modal.phone })
    } else {
      await api.post("/auth/sendmail", { email: modal.email })
    }
    startTimer()
    notify("Код отправлен повторно")
  } catch (e) {
    notify("Ошибка при повторной отправке")
  }
}
onMounted(() => {
  startTimer()
  nextTick(() => {
    if (inputs.value[0]) inputs.value[0].focus()
  })
})
onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped>
.sms-overlay{
  position:absolute;
  inset:0;
  background:#FFFFFF33;
  display:flex;
  justify-content:center;
  align-items:center;
  border-radius: 2.125rem;
}
.sms-card{
  background:#ffffff;
  padding: 1.2rem 2rem;
  border-radius: 2rem;
  box-shadow:0 4px 4px rgba(0, 0, 0, 0.221);
  text-align:center;
}
.sms-title{
  color: #404040;
  font-size: 1.45rem;
  font-weight:400;
  margin-bottom:5px;
}

.sms-subtitle{
  font-size: 1rem;
  color:#9F9F9F;
  margin-bottom: 0.8rem;
}
.code-wrapper{
  display:flex;
  justify-content:center;
  gap:1.5rem;
  margin-bottom:1.25rem;
}
.code-input{
  width:2.4rem;
  height:3.6rem;
  border-radius: 0.8rem;
  border:none;
  background:#E1E1E1;
  text-align:center;
  font-size: 1.375rem;
  color: #105965;
}
.code-input.error{
  outline:1px solid #EE3030;
}
.resend{
  font-size: 1rem;
  color:#333333;
}
.resend-link{
  cursor:pointer;
  color:#105965;
  font-weight:500;
}

</style>