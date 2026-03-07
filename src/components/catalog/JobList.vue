<script setup>
import { computed } from "vue"
import { useProductStore } from "/src/stores/product.js"
import HorizontalList from "./HorizontalList.vue"

const props = defineProps({
  tab: String
})

const store = useProductStore()

const jobs = computed(() => {
  return store.products.filter(p => {
    if (p.category !== "rabota") return false
    if (props.tab === "all") return true
    return p.type === props.tab
  })
})

</script>

<template>

<HorizontalList :items="jobs" />

</template>