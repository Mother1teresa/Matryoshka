import { defineStore } from "pinia"
import { ref } from "vue"

export const useProductStore = defineStore("product", () => {

  const products = ref([
  {
    id: 1,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: "./src/assets/img/product/img-prod.jpg",
    isLiked: false
  },
  {
    id: 2,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: "./src/assets/img/product/img-prod.jpg",
    isLiked: false
  },
  {
    id: 3,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: "./src/assets/img/product/img-prod.jpg",
    isLiked: false
  },
  {
    id: 4,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: "./src/assets/img/product/img-prod.jpg",
    isLiked: false
  },
  {
    id: 5,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: "./src/assets/img/product/img-prod.jpg",
    isLiked: false
  },
  {
    id: 6,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: "./src/assets/img/product/img-prod.jpg",
    isLiked: false
  },
  {
    id: 7,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: "./src/assets/img/product/img-prod.jpg",
    isLiked: false
  },
  {
    id: 8,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: "./src/assets/img/product/img-prod.jpg",
    isLiked: false
  },
])

  const toggleLike = (id) => {
    const product = products.value.find(p => p.id === id)
    if (product) {
      product.isLiked = !product.isLiked
    }
  }

  const resetLikes = () => {
    products.value.forEach(product => {
      product.isLiked = false
    })
  }
  return {
    products,
    toggleLike,
    resetLikes
  }
})