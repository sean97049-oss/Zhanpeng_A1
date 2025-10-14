<template>
  <div class="container mt-5" style="max-width:520px">
    <h2 class="mb-3">login</h2>

    <form @submit.prevent="onLogin" class="card p-3">

      <div class="mb-3">
        <label class="form-label">email</label>
        <input v-model="formData.userEmail" type="email" class="form-control" @blur="() => isvaildEmail(true)"
          @input="() => isvaildEmail(false)" required />
        <div v-if="errors.userEmail" class="text-danger mt-1">{{ errors.userEmail }}</div>
      </div>


      <div class="mb-3">
        <label class="form-label">password</label>
        <input v-model="formData.password" type="password" class="form-control" @blur="() => isvaildPassword(true)"
          @input="() => isvaildPassword(false)" minlength="8" required />
        <div v-if="errors.password" class="text-danger mt-1">{{ errors.password }}</div>
      </div>


      <p v-if="errorMsg" class="text-danger mb-2">{{ errorMsg }}</p>

      <div v-if="showGoRegister" class="mb-2">
        <router-link class="btn btn-sm btn-outline-primary"
          :to="{ path: '/register', query: { email: formData.userEmail } }">
          Account not exist, go to register
        </router-link>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-primary" type="submit" :disabled="loadingBtn">login</button>
        <button class="btn btn-outline-secondary" type="button" @click="clearAgain">clear</button>
        <router-link class="btn btn-outline-secondary" to="/register">go to register</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@/Firebase/user'

const route = useRoute()
const router = useRouter()
const { login, errorMsg } = useUser()


const formData = ref({
  userEmail: (route.query.email ? String(route.query.email) : ''),
  password: '',
  confirmPassword: '',
  role: '',
  gender: ''
})

const errors = ref({
  userEmail: '',
  password: '',
  confirmPassword: '',
  role: '',
  gender: ''
})

const clearInput = (input) => {
  if (typeof input !== 'string') return input
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

const clearFormData = () => {
  formData.value.userEmail = clearInput(formData.value.userEmail)
  formData.value.password = clearInput(formData.value.password)
  formData.value.confirmPassword = clearInput(formData.value.confirmPassword)
  formData.value.role = clearInput(formData.value.role)
  formData.value.gender = clearInput(formData.value.gender)
}

const isvaildEmail = (blur) => {
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.userEmail)
  if (!ok && blur) {
    errors.value.userEmail = 'Please enter a valid email'
  } else if (ok) {
    errors.value.userEmail = ''
  }
  return ok
}

const validateConfirmPassword = (showError = false) => {
  const password = formData.value.password
  const confirm = formData.value.confirmPassword
  errors.value.confirmPassword = ''
  if (showError && confirm !== password) {
    errors.value.confirmPassword = 'Passwords do not match'
    return false
  }
  return true
}

const isvaildPassword = (blur) => {
  const password = formData.value.password
  const minLength = 8
  errors.value.password = ''

  if (password.length < minLength) {
    if (blur) errors.value.password = `Password must be at least ${minLength} characters long.`
    return false
  }
  if (!/[A-Z]/.test(password)) {
    if (blur) errors.value.password = 'Password must contain at least one uppercase letter.'
    return false
  }
  if (!/[a-z]/.test(password)) {
    if (blur) errors.value.password = 'Password must contain at least one lowercase letter.'
    return false
  }
  if (!/\d/.test(password)) {
    if (blur) errors.value.password = 'Password must contain at least one number.'
    return false
  }
  errors.value.password = ''
  return true
}

const clearAgain = () => {
  formData.value.userEmail = ''
  formData.value.password = ''
  formData.value.role = ''
  formData.value.confirmPassword = ''
  formData.value.gender = ''

  errors.value.userEmail = ''
  errors.value.password = ''
  errors.value.role = ''
  errors.value.confirmPassword = ''
  errors.value.gender = ''
}

const loadingBtn = ref(false)
const showGoRegister = computed(() => errorMsg.value.includes('email not exit') || errorMsg.value.includes('invalid email'))

const onLogin = async () => {
  clearFormData()
  const okEmail = isvaildEmail(true)
  const okPwd = isvaildPassword(true)
  if (!okEmail || !okPwd) return

  loadingBtn.value = true
  const res = await login(formData.value.userEmail, formData.value.password)
  loadingBtn.value = false

  if (res.success) {
    const redirect = route.query.redirect || '/about'
    router.replace(String(redirect))
  }
}
</script>
