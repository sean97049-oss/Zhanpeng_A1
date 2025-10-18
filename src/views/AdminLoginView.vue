<template>
  <div class="admin-login-container">
    <div class="admin-login-wrapper">
      <div class="admin-login-left">
        <div class="admin-login-form-container">
          <div class="admin-badge">
            <i class="pi pi-shield"></i>
            <span>Admin Portal</span>
          </div>
          <h2 class="admin-login-title">Administrator Access</h2>
          <p class="admin-login-subtitle">Sign in to manage the system</p>

          <form @submit.prevent="onAdminLogin" class="admin-login-form">
            <div class="form-group">
              <label for="adminEmail" class="form-label">Admin Email</label>
              <input type="email" class="form-input" id="adminEmail" v-model="formData.userEmail"
                placeholder="Enter admin email" @blur="() => isvaildEmail(true)" @input="() => isvaildEmail(false)"
                required />
              <div v-if="errors.userEmail" class="error-message">{{ errors.userEmail }}</div>
            </div>

            <div class="form-group">
              <label for="adminPassword" class="form-label">Admin Password</label>
              <input type="password" class="form-input" id="adminPassword" v-model="formData.password"
                placeholder="Enter admin password" @blur="() => isvaildPassword(true)"
                @input="() => isvaildPassword(false)" minlength="8" required />
              <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
            </div>

            <div v-if="errorMsg" class="error-message main-error">{{ errorMsg }}</div>

            <button type="submit" class="admin-login-btn" :disabled="loadingBtn">
              <span v-if="loadingBtn">Signing in...</span>
              <span v-else>Access Admin Panel</span>
            </button>

            <div class="admin-login-footer">
              <button type="button" class="clear-btn" @click="clearAgain">Clear</button>
              <p class="back-to-login">
                <router-link to="/login" class="back-link">← Back to User Login</router-link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <div class="admin-login-right">
        <div class="image-container">
          <img src="@/assets/adamin.png" alt="Admin Login" class="admin-login-image" />
        </div>

      </div>
    </div>
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
  userEmail: '',
  password: ''
})

const errors = ref({
  userEmail: '',
  password: ''
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
  errors.value.userEmail = ''
  errors.value.password = ''
}

const loadingBtn = ref(false)

const onAdminLogin = async () => {
  clearFormData()
  const okEmail = isvaildEmail(true)
  const okPwd = isvaildPassword(true)
  if (!okEmail || !okPwd) return

  loadingBtn.value = true
  const res = await login(formData.value.userEmail, formData.value.password)
  loadingBtn.value = false

  if (res.success) {
    setTimeout(() => {
      const { isAdmin } = useUser()
      if (isAdmin.value) {
        router.replace('/manage-account')
      } else {
        alert('Access denied. Admin privileges required.')
        const { logout } = useUser()
        logout()
      }
    }, 1000)
  }
}
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.admin-login-wrapper {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  max-width: 1000px;
  width: 100%;
  min-height: 600px;
}

.admin-login-left {
  flex: 1;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-login-form-container {
  width: 100%;
  max-width: 400px;
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.admin-badge i {
  font-size: 1rem;
}

.admin-login-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0d6efd;
  margin-bottom: 0.5rem;
  text-align: center;
}

.admin-login-subtitle {
  color: #6c757d;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.admin-login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #0d6efd;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-input:focus {
  outline: none;
  border-color: #0d6efd;
  background: white;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

.main-error {
  background: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  margin-bottom: 1rem;
}

.admin-login-btn {
  width: 100%;
  background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.admin-login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3);
}

.admin-login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.admin-login-footer {
  text-align: center;
}

.clear-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background: #5a6268;
}

.back-to-login {
  margin: 0;
}

.back-link {
  color: #0d6efd;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
}

.back-link:hover {
  text-decoration: underline;
}

.admin-login-right {
  flex: 1;
  background: #e7f3ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

.image-container {
  text-align: center;
  margin-bottom: 2rem;
}

.admin-login-image {
  max-width: 100%;
  height: auto;
  max-height: 500px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.admin-features {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.admin-features h3 {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
}

.admin-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.admin-features li {
  color: white;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
}

.admin-features li i {
  color: #e74c3c;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .admin-login-wrapper {
    flex-direction: column;
    margin: 1rem;
  }

  .admin-login-left {
    padding: 2rem;
  }

  .admin-login-right {
    padding: 1rem;
  }

  .admin-login-title {
    font-size: 2rem;
  }

  .admin-features {
    padding: 1rem;
  }
}
</style>
