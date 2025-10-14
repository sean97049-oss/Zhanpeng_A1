<template>
  <div class="container mt-5" style="max-width:520px">
    <h2 class="mb-3">register</h2>

    <form @submit.prevent="onRegister" class="card p-3">

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


      <div class="mb-3">
        <label class="form-label">confirm password</label>
        <input v-model="formData.confirmPassword" type="password" class="form-control"
          @blur="() => validateConfirmPassword(true)" @input="() => validateConfirmPassword(false)" minlength="8"
          required />
        <div v-if="errors.confirmPassword" class="text-danger mt-1">{{ errors.confirmPassword }}</div>
      </div>


      <div class="mb-3">
        <label for="userRole" class="form-label">please select your login role</label>
        <select id="userRole" class="form-select" v-model="formData.role" required>
          <option disabled value="">Select one</option>
          <option value="As_patient">Patient (Type2 / Pre-diabetes)</option>
          <option value="As_family">Family member</option>
          <option value="As_hcp">Healthcare Professional</option>
        </select>
        <div v-if="errors.role" class="text-danger mt-1">{{ errors.role }}</div>
      </div>

      <div class="mb-3">
        <label for="userGender" class="form-label">Gender</label>
        <select id="userGender" class="form-select" v-model="formData.gender" required>
          <option disabled value="">please select your gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="notSay">Prefer not to say</option>
        </select>
        <div v-if="errors.gender" class="text-danger mt-1">{{ errors.gender }}</div>
      </div>

      <p v-if="errorMsg" class="text-danger mb-2">{{ errorMsg }}</p>

      <div class="d-flex gap-2">
        <button class="btn btn-primary" type="submit" :disabled="loadingBtn">register</button>
        <button class="btn btn-outline-secondary" type="button" @click="clearAgain">clear</button>
        <router-link class="btn btn-outline-secondary" to="/login">go to login</router-link>
      </div>
    </form>

    <div v-if="successMsg" class="alert alert-success mt-3" role="alert">
      {{ successMsg }}
      <router-link class="ms-2" :to="{ path: '/login', query: { email: formData.userEmail } }">go to login</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUser } from '@/Firebase/user'

const route = useRoute()
const { register, errorMsg } = useUser()


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
const successMsg = ref('')

const onRegister = async () => {
  clearFormData()

  const okEmail = isvaildEmail(true)
  const okPwd = isvaildPassword(true)
  const okConfirm = validateConfirmPassword(true)
  if (!okEmail || !okPwd || !okConfirm) return

  loadingBtn.value = true
  const res = await register(formData.value.userEmail, formData.value.password)
  loadingBtn.value = false

  if (res.success) {
    successMsg.value = 'register success, now you can login with this email'
    formData.value.password = ''
    formData.value.confirmPassword = ''
  }
}
</script>
