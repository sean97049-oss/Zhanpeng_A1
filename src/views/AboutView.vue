<template>
  <div class="about">
    <h1>About our website</h1>
    <p>Welcome to the Diabetes Support Website, where we provide comprehensive online resources and personalised advice
      to assist you with any queries regarding diabetes.</p>
  </div>
</template>

<script setup>
import { useAuth } from '@/components/composables/auth'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const { isAuthenticated, userRole } = useAuth()
const router = useRouter()

onMounted(() => {
  if (!isAuthenticated.value || !['As_patient', 'As_hcp'].includes(userRole.value)) {
    router.push('/')
  }
  if (!isAuthenticated.value) {
    alert('please login first')
    router.push('/')
  }
})
</script>
<style></style>