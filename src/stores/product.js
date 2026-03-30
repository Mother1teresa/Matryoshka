import { defineStore } from "pinia"
import { ref } from "vue"
import axios from "axios";
export const useProductStore = defineStore("product", () => {
  const allProducts = ref([{
      id: 1,
      title: "Voyager 850 Cadin",
      price: 53333000,
      city: "г.Краснодар",
      category: "transport",
      section: "water",
      subcategory: "yachts",
      sellerId: "1",
      images: [
        "/img/products/voyager.png",
        "/img/products/voyager2.png",
        "/img/products/voyager3.png",
        "/img/products/voyager4.png",
        "/img/products/voyager5.png",
        "/img/products/voyager6.png",
        "/img/products/voyager7.png",
        "/img/products/voyager8.png",
        "/img/products/voyager9.png",
      ],
      attributes: {
        brand: "Vboats",
        year: 2009,
        length: 8.9,
        width: 2.5,
        draft: 1.5,
        material: "Алюминий",
        passengers: 8},
      description: "Катер стоит своих денег. Места полно, летит жестко, новый."},{
      id: 2,
      title: "Автомобиль BMW",
      price: 1200000,
      city: "г.Краснодар",
      category: "transport",
      section: "cars",
      subcategory: "sedan",
      sellerId: "2",
      images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],
      attributes: {
        brand: "BMW",
        model: "X5",
        year: 2018,
        mileage: 120000,
        fuel: "Бензин"},
      description: "Отличное состояние, не битая."},{
      id: 3,
      title: "Квартира 2к",
      price: 5000000,
      city: "г.Краснодар",
      category: "nedvizhimost",
      section: "apartments",
      subcategory:"rent",
      sellerId: "1",
      images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],
      attributes: {
        rooms: 2,
        area: 65,
        floor: 5},
      description: "Уютная квартира в центре."},{
      id: 4,
      title: "Щенок хаски",
      price: 30000,
      city: "г.Краснодар",
      category: "animals",
      section:"pets",
      sellerId: "2",
      images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],
      attributes: {
        breed: "Хаски",
        age: "3 месяца",
        color: "Серый"},
      description: "Очень активный и дружелюбный щенок."},{
    id: 5,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],
    isLiked: false,
    category: "tovary",
    section:"fashin",
    sellerId: "1",
  },{
    id: 6,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],
    isLiked: false,
    category: "biznes",
    section:"ready_business",
    sellerId: "1",
  },{
    id: 7,
    title: "Коробки 600*400*300 мм К-51 оптом",
    price: 79,
    city: "г.Краснодар",
    images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],
    isLiked: false,
    category: "tovary",
    section: "beauty-health",
    sellerId: "1",
    description:"B cтабильную компaнию требуются агент-менеджeры для oбщения c клиeнтaми. Работа c тёплoй и xoлoднoй базой, консультации и прoдажи финанcoвых пpoдуктoв. Условия:"},{
    id: 8,
    title: "Тур в Турцию",
    price: 75000,
    city: "г.Краснодар",
    images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],
    isLiked: false,
    category: "travel",
    section:"tours",
    sellerId: "1",
    description:"B cтабильную компaнию требуются агент-менеджeры для oбщения c клиeнтaми. Работа c тёплoй и xoлoднoй базой, консультации и прoдажи финанcoвых пpoдуктoв. Условия:"},{
    id: 9,
    title: "Квартира 2к",
    price: 5000000,
    city: "г.Краснодар",
    category: "nedvizhimost",
    section: "apartments",
    subcategory:"rent",
    sellerId: "2",
    images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],
    isLiked: false,
    attributes: {
        rooms: 2,
        area: 65,
        floor: 5},
      description: "Уютная квартира в центре."
    },{
    id: 10,
    title: "Автомобиль BMW",
    price: 1200000,
    city: "г.Краснодар",
    images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],
    category: "transport",
    section: "moto",
    sellerId: "1",
},{
    id: 11,
    title: "Щенок хаски",
    price: 30000,
    city: "г.Краснодар",
    category: "animals",
    section:"pets",
    sellerId: "1",
    images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],},{
    id: 12,
    title: "Мытья окон",
    price: 1200,
    city: "г.Краснодар",
    images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],
    category: "uslugi",
    section:"all_services",
    sellerId: "2",
    description:"B cтабильную компaнию требуются агент-менеджeры для oбщения c клиeнтaми. Работа c тёплoй и xoлoднoй базой, консультации и прoдажи финанcoвых пpoдуктoв. Условия:"},{
    id: 13,
    title:"Агент менеджер", 
    salary:"70 000 - 90 000",
    price:"70 000 - 90 000", 
    city:"Краснодар",
    images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],
    category: "rabota",
    section:"jobs",
    subcategory: "office",
    sellerId: "2",
    description:"B cтабильную компaнию требуются агент-менеджeры для oбщения c клиeнтaми. Работа c тёплoй и xoлoднoй базой, консультации и прoдажи финанcoвых пpoдуктoв. Условия:"},{
    id: 14,
    name:"Анна", 
    price: 1200000,
    title:"Менеджер", 
    city:"Краснодар",
    images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],
    category: "rabota",
    section:"resume",
    sellerId: "1",
    subcategory: "resume-management",
    description:"B cтабильную компaнию требуются агент-менеджeры для oбщения c клиeнтaми. Работа c тёплoй и xoлoднoй базой, консультации и прoдажи финанcoвых пpoдуктoв. Условия:"},{
    id: 15,
    title: "Автомобиль BMW",
    price: 1200000,
    city: "г.Краснодар",
    images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],
    category: "transport",
    section:"car",
    sellerId: "1",
    },{
    id: 16,
    title: "Убор для хаски",
    price: 30000,
    city: "г.Краснодар",
    category: "animals",
    section:"pet_products",
    sellerId: "2",
    images: [
        "/img/products/img-prod.jpg",
        "/img/products/img-prod2.jpg"],},{
    id: 17,
    title: "Квартира 2к",
    price: 5000000,
    city: "г.Краснодар",
    category: "nedvizhimost",
    section: "apartments",
    subcategory:"buy",
    sellerId: "1",
    images: [
      "/img/products/img-prod.jpg",
      "/img/products/img-prod2.jpg"],
    attributes: {
      rooms: 2,
      area: 65,
      floor: 5},
    description: "Уютная квартира в центре."},
]);
  const products = ref([]);
  const isLoading = ref(false);
    const fetchAdverts = async (filters = {}) => {
    // isLoading.value = true;
    // try {
    //   const response = await axios.get('/api/adverts', { params: filters });
    //   if (response.data && response.data.length > 0) {
    //     products.value = response.data;
    //     isLoading.value = false;
    //     return;}
    // } catch (error) {
    //   console.warn("Бэк не отвечает — используем локальную фильтрацию");
    // }
    products.value = allProducts.value.filter(p => {
      if (filters.category && p.category !== filters.category) return false;
      
      // Добавьте эту строку для фильтрации по секциям (cars, water, moto и т.д.)
      if (filters.section && p.section !== filters.section) return false;

      if (filters.subcategory && p.subcategory !== filters.subcategory) return false;
      if (filters.priceFrom && Number(p.price) < filters.priceFrom) return false;
      if (filters.priceTo && p.price > filters.priceTo) return false;
      return true;});
    isLoading.value = false;};
  const toggleLike = (id) => {
    const product = products.value.find(p => p.id === id);
    if (product) product.isLiked = !product.isLiked;
  };
  const resetLikes = () => {
    products.value.forEach(p => p.isLiked = false);
  };
  return {
    products,
    allProducts,
    isLoading,
    fetchAdverts,
    toggleLike,
    resetLikes
  };
});