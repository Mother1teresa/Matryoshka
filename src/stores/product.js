// /src/stores/product.js
import { defineStore } from "pinia"
import { ref } from "vue"
import { api } from "/src/api/api.js"

export const useProductStore = defineStore("product", () => {
  const products = ref([])
  const isLoading = ref(false)
  const lastFetchTime = ref(0)

  const fetchAdverts = async (filters = {}, force = false) => {
    const hasFilters = Object.keys(filters).length > 0
    const cacheValid = !force && !hasFilters &&
      products.value.length > 0 && 
      Date.now() - lastFetchTime.value < 60000
    
    if (cacheValid) {
      console.log('Products cache valid, count:', products.value.length)
      return
    }

    isLoading.value = true
    console.log('=== fetchAdverts START ===', filters)

    try {
      const dto = {}
      
      if (filters.query) dto.query = filters.query
      if (filters.category) dto.category = filters.category
      if (filters.subcategory || filters.subCategory || filters.section) {
        dto.subCategory = filters.subcategory || filters.subCategory || filters.section
      }
      if (filters.userId) dto.userId = String(filters.userId)
      if (filters.priceFrom) dto.priceFrom = Number(filters.priceFrom)
      if (filters.priceTo) dto.priceTo = Number(filters.priceTo)
      if (filters.take) dto.take = Number(filters.take)
      if (filters.profession) dto.profession = filters.profession
      if (filters.sphere) dto.sphere = filters.sphere
      if (filters.employment) dto.employment = filters.employment
      if (filters.workFormat) dto.workFormat = filters.workFormat
      if (filters.propertyType) dto.propertyType = filters.propertyType
      if (filters.vehicleKpp) dto.vehicleKpp = filters.vehicleKpp
      if (filters.drive) dto.drive = filters.drive
      if (filters.vesselType) dto.vesselType = filters.vesselType
      if (filters.paymentType) dto.paymentType = filters.paymentType
      if (filters.businessForm) dto.businessForm = filters.businessForm
      if (filters.offerType) dto.offerType = filters.offerType
      if (filters.transactionScope) dto.transactionScope = filters.transactionScope
      if (filters.hasParking != null) dto.hasParking = Boolean(filters.hasParking)
      if (filters.hasElevator != null) dto.hasElevator = Boolean(filters.hasElevator)
      if (filters.hasBalcony != null) dto.hasBalcony = Boolean(filters.hasBalcony)
      if (filters.hasDocuments != null) dto.hasDocuments = Boolean(filters.hasDocuments)
      if (filters.yearOfManufactureFrom) dto.yearOfManufactureFrom = Number(filters.yearOfManufactureFrom)
      if (filters.yearOfManufactureTo) dto.yearOfManufactureTo = Number(filters.yearOfManufactureTo)
      if (filters.engineCapacityFrom) dto.engineCapacityFrom = Number(filters.engineCapacityFrom)
      if (filters.engineCapacityTo) dto.engineCapacityTo = Number(filters.engineCapacityTo)
      if (filters.horsePowerFrom) dto.horsePowerFrom = Number(filters.horsePowerFrom)
      if (filters.horsePowerTo) dto.horsePowerTo = Number(filters.horsePowerTo)
      if (filters.totalAreaFrom) dto.totalAreaFrom = Number(filters.totalAreaFrom)
      if (filters.totalAreaTo) dto.totalAreaTo = Number(filters.totalAreaTo)
      if (filters.vesselLengthFrom) dto.vesselLengthFrom = Number(filters.vesselLengthFrom)
      if (filters.vesselLengthTo) dto.vesselLengthTo = Number(filters.vesselLengthTo)
      if (filters.vesselDraftFrom) dto.vesselDraftFrom = Number(filters.vesselDraftFrom)
      if (filters.vesselDraftTo) dto.vesselDraftTo = Number(filters.vesselDraftTo)
      if (filters.vesselWidthFrom) dto.vesselWidthFrom = Number(filters.vesselWidthFrom)
      if (filters.vesselWidthTo) dto.vesselWidthTo = Number(filters.vesselWidthTo)
      if (filters.maxPassengersFrom) dto.maxPassengersFrom = Number(filters.maxPassengersFrom)
      if (filters.maxPassengersTo) dto.maxPassengersTo = Number(filters.maxPassengersTo)
      if (filters.livingAreaFrom) dto.livingAreaFrom = Number(filters.livingAreaFrom)
      if (filters.livingAreaTo) dto.livingAreaTo = Number(filters.livingAreaTo)
      if (filters.heightFrom) dto.heightFrom = Number(filters.heightFrom)
      if (filters.heightTo) dto.heightTo = Number(filters.heightTo)

      const res = await api.get('/advert', {
        params: Object.keys(dto).length > 0 
          ? { dto: JSON.stringify(dto) } 
          : undefined
      })
      
      const ads = Array.isArray(res.data) ? res.data : res.data?.items || []
      console.log('API returned ads:', ads.length)

      products.value = ads.map(ad => ({
        id: ad.id,
        title: ad.title || 'Без названия',
        price: Number(ad.price) || 0,
        city: ad.address || ad.city || '',
        address: ad.address || '',
        category: ad.category || 'tovary',
        section: ad.subCategory || ad.section || 'default',
        subcategory: ad.subCategory || ad.subcategory || '',
        sellerId: ad.userId || ad.sellerId,
        images: ad.pictures?.map(p => p.pictureUrl || p.url) || [],
        image: ad.pictures?.[0]?.pictureUrl || ad.thumbnailUrl || '/src/assets/img/placeholder.png',
        attributes: buildAttributes(ad),
        description: ad.description || '',
        createdAt: ad.createdAt,
        ...ad
      }))

      lastFetchTime.value = Date.now()
      console.log('Products loaded:', products.value.length)

    } catch (e) {
      console.error("Ошибка загрузки:", e.response?.status, e.response?.data)
      if (force || products.value.length === 0) {
        products.value = []
      }
    } finally {
      isLoading.value = false
    }
  }

  const buildAttributes = (ad) => {
    const attrs = { ...(ad.attributes || {}) }
    
    if (ad.totalArea != null) attrs.area = ad.totalArea
    if (ad.livingArea != null) attrs.livingArea = ad.livingArea
    if (ad.kitchenArea != null) attrs.kitchenArea = ad.kitchenArea
    if (ad.apartmentFloor != null) attrs.floor = ad.apartmentFloor
    if (ad.floorsInHouse != null) attrs.floorsInHouse = ad.floorsInHouse
    if (ad.hasBalcony != null) attrs.hasBalcony = ad.hasBalcony
    if (ad.hasElevator != null) attrs.hasElevator = ad.hasElevator
    if (ad.hasParking != null) attrs.hasParking = ad.hasParking
    if (ad.hasDocuments != null) attrs.hasDocuments = ad.hasDocuments
    if (ad.propertyType) attrs.propertyType = ad.propertyType
    if (ad.houseState) attrs.houseState = ad.houseState
    
    if (ad.yearOfManufacture != null) attrs.year = ad.yearOfManufacture
    if (ad.engineCapacity != null) attrs.engineCapacity = ad.engineCapacity
    if (ad.horsePower != null) attrs.horsePower = ad.horsePower
    if (ad.brand) attrs.brand = ad.brand
    if (ad.model) attrs.model = ad.model
    if (ad.color) attrs.color = ad.color
    if (ad.milage != null) attrs.mileage = ad.milage
    if (ad.vehicleKpp) attrs.transmission = ad.vehicleKpp
    if (ad.drive) attrs.drive = ad.drive
    if (ad.vehicleBodyType) attrs.bodyType = ad.vehicleBodyType
    if (ad.steeringWheel) attrs.steeringWheel = ad.steeringWheel
    
    if (ad.vesselType) attrs.vesselType = ad.vesselType
    if (ad.vesselLength != null) attrs.length = ad.vesselLength
    if (ad.vesselWidth != null) attrs.width = ad.vesselWidth
    if (ad.vesselDraft != null) attrs.draft = ad.vesselDraft
    if (ad.maxPassengers != null) attrs.passengers = ad.maxPassengers
    if (ad.vesselBodyMaterial) attrs.material = ad.vesselBodyMaterial
    
    if (ad.employment) attrs.employment = ad.employment
    if (ad.workFormat) attrs.workFormat = ad.workFormat
    if (ad.profession) attrs.profession = ad.profession
    if (ad.sphere) attrs.sphere = ad.sphere
    if (ad.workExperience != null) attrs.experience = ad.workExperience
    
    if (ad.petBreed) attrs.breed = ad.petBreed
    if (ad.petName) attrs.petName = ad.petName
    if (ad.petColor) attrs.petColor = ad.petColor
    
    if (ad.businessForm) attrs.businessForm = ad.businessForm
    if (ad.isProfitable != null) attrs.isProfitable = ad.isProfitable
    if (ad.payBackPeriod) attrs.payBackPeriod = ad.payBackPeriod
    
    if (ad.offerType) attrs.offerType = ad.offerType
    if (ad.transactionScope) attrs.transactionScope = ad.transactionScope
    
    return attrs
  }
  const getProductsByCategory = (category, section) => {
    return products.value.filter(p => {
      if (category && p.category !== category) return false
      if (section && p.section !== section && p.subcategory !== section) return false
      return true
    })
  }

  const toggleLike = (id) => {
    const product = products.value.find(p => p.id === id)
    if (product) product.isLiked = !product.isLiked
  }

  const resetLikes = () => {
    products.value.forEach(p => p.isLiked = false)
  }

  return {
    products,
    isLoading,
    fetchAdverts,
    getProductsByCategory,
    toggleLike,
    resetLikes,
  }
})