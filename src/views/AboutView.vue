<template>
  <div class="about">
    <h1>About our website</h1>
    <p>Welcome to the Diabetes Support Website, where we provide comprehensive online resources and personalised advice
      to assist you with any queries regarding diabetes.</p>
  </div>
</template>

<script setup>
import { useUser } from '@/Firebase/user'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const { userAuthenticated } = useUser()
const router = useRouter()

onMounted(() => {
  if (!userAuthenticated.value) {
    alert('please login first')
    router.push('/')
  }
})
</script>
<style></style>