import { defineStore } from "pinia"

export const useMenuStore = defineStore("menu", {

  state: () => ({
    isOpen: false
  }),

  actions: {
    open() {
      this.isOpen = true
      document.body.classList.add("overflow-mod")
    },

    close() {
      this.isOpen = false
      document.body.classList.remove("overflow-mod")
    },

    toggle() {
      this.isOpen ? this.close() : this.open()
    }
  }
})
