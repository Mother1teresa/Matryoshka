import { defineStore } from "pinia"
const isClient = typeof window !== 'undefined';

export const useRegionModalStore = defineStore("regionModal", {
  state: () => ({
    isOpen: false,
    selectedRegion: isClient ? localStorage.getItem("region") || null : null,
    coordinates: isClient 
      ? JSON.parse(localStorage.getItem("regionCoords")) || [37.6173, 55.7558]
      : [37.6173, 55.7558]
  }),
  actions: {
    open(){
      this.isOpen = true
      document.body.classList.add("overflow-mod")
    },
    close(){
      this.isOpen = false
      document.body.classList.remove("overflow-mod")
    },
    setRegion(name,coords){
      this.selectedRegion = name
      this.coordinates = coords
      localStorage.setItem("region",name)
      localStorage.setItem("regionCoords",JSON.stringify(coords))
      this.close();
    }
  }
})