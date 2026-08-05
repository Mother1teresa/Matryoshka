import { defineStore } from "pinia"
import { ref } from "vue"
import { api } from "/src/api/api.js"
import { categories } from "/src/data/categories.js"

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
    // console.log('=== fetchAdverts START ===', filters)
    const parseBool = (val) => {
      if (typeof val === 'boolean') return val
      if (typeof val === 'string') return val === 'true' || val === '1'
      return Boolean(val)
    }

    try {
      const dto = {}
      
      if (filters.query) dto.query = filters.query
      if (filters.category) dto.category = filters.category
      if (filters.subcategory || filters.subCategory) {
        dto.subCategory = filters.subCategory || filters.subcategory
      }
      if (filters.userId) dto.userId = String(filters.userId)
      if (filters.priceFrom != null) dto.priceFrom = Number(filters.priceFrom)
      if (filters.priceTo != null) dto.priceTo = Number(filters.priceTo)
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
      if (filters.hasParking != null) dto.hasParking = parseBool(filters.hasParking)
      if (filters.hasElevator != null) dto.hasElevator = parseBool(filters.hasElevator)
      if (filters.hasBalcony != null) dto.hasBalcony = parseBool(filters.hasBalcony)
      if (filters.hasDocuments != null) dto.hasDocuments = parseBool(filters.hasDocuments)
      if (filters.yearOfManufactureFrom != null) dto.yearOfManufactureFrom = Number(filters.yearOfManufactureFrom)
      if (filters.yearOfManufactureTo != null) dto.yearOfManufactureTo = Number(filters.yearOfManufactureTo)
      if (filters.engineCapacityFrom != null) dto.engineCapacityFrom = Number(filters.engineCapacityFrom)
      if (filters.engineCapacityTo != null) dto.engineCapacityTo = Number(filters.engineCapacityTo)
      if (filters.horsePowerFrom != null) dto.horsePowerFrom = Number(filters.horsePowerFrom)
      if (filters.horsePowerTo != null) dto.horsePowerTo = Number(filters.horsePowerTo)
      if (filters.totalAreaFrom != null) dto.totalAreaFrom = Number(filters.totalAreaFrom)
      if (filters.totalAreaTo != null) dto.totalAreaTo = Number(filters.totalAreaTo)
      if (filters.vesselLengthFrom != null) dto.vesselLengthFrom = Number(filters.vesselLengthFrom)
      if (filters.vesselLengthTo != null) dto.vesselLengthTo = Number(filters.vesselLengthTo)
      if (filters.vesselDraftFrom != null) dto.vesselDraftFrom = Number(filters.vesselDraftFrom)
      if (filters.vesselDraftTo != null) dto.vesselDraftTo = Number(filters.vesselDraftTo)
      if (filters.vesselWidthFrom != null) dto.vesselWidthFrom = Number(filters.vesselWidthFrom)
      if (filters.vesselWidthTo != null) dto.vesselWidthTo = Number(filters.vesselWidthTo)
      if (filters.maxPassengersFrom != null) dto.maxPassengersFrom = Number(filters.maxPassengersFrom)
      if (filters.maxPassengersTo != null) dto.maxPassengersTo = Number(filters.maxPassengersTo)
      if (filters.livingAreaFrom != null) dto.livingAreaFrom = Number(filters.livingAreaFrom)
      if (filters.livingAreaTo != null) dto.livingAreaTo = Number(filters.livingAreaTo)
      if (filters.heightFrom != null) dto.heightFrom = Number(filters.heightFrom)
      if (filters.heightTo != null) dto.heightTo = Number(filters.heightTo)
      if (filters.address) dto.address = filters.address

      if (!dto.take) dto.take = 50
      const res = await api.post('/adverts/search', dto)

      const ads = Array.isArray(res.data) ? res.data : res.data?.items || []
      console.log('API returned ads:', ads.length)

      products.value = ads.map(ad => {
        const pics = Array.isArray(ad.pictureUrls) 
          ? ad.pictureUrls 
          : ad.pictureUrls 
            ? [ad.pictureUrls] 
            : []

        return {
          id: ad.id,
          title: ad.title || 'Без названия',
          price: Number(ad.price) || 0,
          city: ad.address || ad.city || '',
          address: ad.address || '',
          category: ad.category || 'tovary',
          section: ad.subCategory || ad.section || 'default',
          subcategory: ad.subCategory || ad.subcategory || '',
          sellerId: ad.userId || ad.sellerId,
          images: pics,
          image: pics[0] || '/src/assets/img/placeholder.png',
          attributes: buildAttributes(ad),
          description: ad.description || '',
          createdAt: ad.createdAt,
          ...ad
        }
      })

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
  const getProductsBySection = (category, sectionSlug) => {
    const cat = categories.find(c => c.slug === category)
    const sec = cat?.sections.find(s => s.slug === sectionSlug)
    const allowedSlugs = sec?.links.map(l => l.slug) || []
    return products.value.filter(p => {
      if (category && p.category !== category) return false
      if (sectionSlug && !allowedSlugs.includes(p.subcategory)) return false
      return true
    })
  }

  return {
    products,
    isLoading,
    fetchAdverts,
    getProductsByCategory,
    getProductsBySection,
    toggleLike,
    resetLikes,
    buildAttributes
  }
})