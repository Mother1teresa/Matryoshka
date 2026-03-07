import { defineStore } from "pinia"
import { ref } from "vue"
import imgProd from "../assets/img/product/img-prod.jpg"
export const useProductStore = defineStore("product", () => {

  const products = ref([
  {
    id: 1,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: imgProd,
    isLiked: false,
    category: "tovary"
  },
  {
    id: 2,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: imgProd,
    isLiked: false,
    category: "tovary"
  },
  {
    id: 3,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: imgProd,
    isLiked: false,
    category: "tovary"
  },
  {
    id: 4,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: imgProd,
    isLiked: false,
    category: "tovary"
  },
  {
    id: 5,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: imgProd,
    isLiked: false,
    category: "tovary"
  },
  {
    id: 6,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: imgProd,
    isLiked: false,
    category: "biznes"
  },
  {
    id: 7,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    image: imgProd,
    isLiked: false,
    category: "tovary",
    description:"B cтабильную компaнию требуются агент-менеджeры для oбщения c клиeнтaми. Работа c тёплoй и xoлoднoй базой, консультации и прoдажи финанcoвых пpoдуктoв. Условия:"
  },
  {
    id: 8,
    title: "Тур в Турцию",
    price: 75000,
    city: "г.Краснодар",
    image: imgProd,
    isLiked: false,
    category: "travel",
    description:"B cтабильную компaнию требуются агент-менеджeры для oбщения c клиeнтaми. Работа c тёплoй и xoлoднoй базой, консультации и прoдажи финанcoвых пpoдуктoв. Условия:"
  },
  {
    id: 9,
    title: "Квартира 2к",
    price: 5000000,
    city: "г.Краснодар",
    image: imgProd,
    isLiked: false,
    category: "nedvizhimost"
  },
  {
    id: 10,
    title: "Автомобиль BMW",
    price: 1200000,
    city: "г.Краснодар",
    image: imgProd,
    category: "transport"
  },
  {
    id: 11,
    title: "Щенок хаски",
    price: 30000,
    city: "г.Краснодар",
    image: imgProd,
    category: "animals"
  },
  {
    id: 12,
    title: "Мытья окон",
    price: 1200,
    city: "г.Краснодар",
    image: imgProd,
    category: "uslugi",
    description:"B cтабильную компaнию требуются агент-менеджeры для oбщения c клиeнтaми. Работа c тёплoй и xoлoднoй базой, консультации и прoдажи финанcoвых пpoдуктoв. Условия:"
  },
  {
    id: 13,
    title:"Агент менеджер", 
    salary:"70 000 - 90 000",
    price:"70 000 - 90 000", 
    city:"Краснодар",
    image: imgProd,
    category: "rabota",
    type:"vacancy",
    description:"B cтабильную компaнию требуются агент-менеджeры для oбщения c клиeнтaми. Работа c тёплoй и xoлoднoй базой, консультации и прoдажи финанcoвых пpoдуктoв. Условия:"
  },
  {
    id: 14,
    name:"Анна", 
    title:"Менеджер", 
    city:"Краснодар",
    image: imgProd,
    category: "rabota",
    type:"resume",
    description:"B cтабильную компaнию требуются агент-менеджeры для oбщения c клиeнтaми. Работа c тёплoй и xoлoднoй базой, консультации и прoдажи финанcoвых пpoдуктoв. Условия:"
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