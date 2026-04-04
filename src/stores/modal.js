import { defineStore } from "pinia"
export const useModalStore = defineStore("modal", {
  state: () => ({
    isOpen: false,
    userId: null,
    type: "login",
    // type: "register",
    overlay: false,
    phone: "",
    email: "",
    name: "",
    password: "",
    smsMode: "phone", // phone | email
  }),

  actions: {
    openLogin() {
      this.type = "login"
      this.isOpen = true
      this.overlay = false
    },
    openRegister() {
      this.type = "register"
      this.isOpen = true
      this.overlay = false
    },
    openSms(phone) {
      if (phone) this.phone = phone
      // this.smsMode = "phone"
      this.isOpen = true
      this.overlay = true
    },
    openEmail(email) {
      if (email) this.email = email
      this.type = "email"
      this.overlay = false   // СКРЫВАЕТ плашку с вводом кода 
      this.isOpen = true
    },
    openForgot() { 
      this.type = "forgot" 
      this.smsMode = "email"
      this.isOpen = true 
      this.overlay = false
    },
    closeOverlay(){
      this.overlay = false
    },
    close() {
      this.isOpen = false
      this.overlay = false
      this.phone = ""; this.email = "";
    }
  }
})