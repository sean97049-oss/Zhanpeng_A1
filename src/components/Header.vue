<template>
  <header class="site-header">
    <div class="container d-flex align-items-center justify-content-between">

      <ul class="nav nav-pills py-0">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active" aria-current="page">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active">About</router-link>
        </li>
        <li class="nav-item" v-if="!isAdmin">
          <router-link to="/score" class="nav-link" active-class="active">Score</router-link>
        </li>
        <li class="nav-item" v-if="!isAdmin">
          <router-link to="/glucose" class="nav-link" active-class="active">Glucose</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/map" class="nav-link" active-class="active">Map</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/openai" class="nav-link" active-class="active">AI Assistant</router-link>
        </li>
        <li class="nav-item" v-if="isAdmin">
          <router-link to="/manage-account" class="nav-link" active-class="active">Manage</router-link>
        </li>
      </ul>


      <div class="d-flex align-items-center gap-2 ms-auto" v-if="userAuthenticated">
        <span class="text-muted small">{{ userState }}</span>
        <button class="btn btn-sm btn-outline-danger" @click="onLogout">Logout</button>
      </div>

      <div v-else class="ms-auto d-flex gap-2">
        <router-link class="btn btn-sm btn-outline-primary" to="/login">Login</router-link>
        <router-link class="btn btn-sm btn-outline-danger" to="/admin-login">Admin</router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useUser } from '@/Firebase/user'
import { useRouter } from 'vue-router'

const { userAuthenticated, userState, isAdmin } = useUser()

const router = useRouter()

const onLogout = async () => {
  const { logout } = useUser()
  const res = await logout()
  router.push({ path: '/login' })
}
</script>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88px;
  background: #fff;
  display: flex;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}


.nav {
  margin: 0;
}
</style>