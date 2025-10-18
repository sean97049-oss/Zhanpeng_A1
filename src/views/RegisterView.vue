<template>
  <div class="register-container">
    <div class="register-wrapper">
      <div class="register-left">
        <div class="register-form-container">
          <h2 class="register-title">Create Account</h2>
          <p class="register-subtitle">Join our diabetes support community</p>

          <form @submit.prevent="onRegister" class="register-form">
            <div class="form-group">
              <label for="email" class="form-label">Email Address</label>
              <input type="email" class="form-input" id="email" v-model="formData.userEmail"
                placeholder="Enter your email" @blur="() => isvaildEmail(true)" @input="() => isvaildEmail(false)"
                required />
              <div v-if="errors.userEmail" class="error-message">{{ errors.userEmail }}</div>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-input" id="password" v-model="formData.password"
                placeholder="Enter your password" @blur="() => isvaildPassword(true)"
                @input="() => isvaildPassword(false)" minlength="8" required />
              <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
            </div>

            <div class="form-group">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input type="password" class="form-input" id="confirmPassword" v-model="formData.confirmPassword"
                placeholder="Confirm your password" @blur="() => validateConfirmPassword(true)"
                @input="() => validateConfirmPassword(false)" minlength="8" required />
              <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
            </div>

            <div class="form-group">
              <label for="userRole" class="form-label">Select Your Role</label>
              <select id="userRole" class="form-select" v-model="formData.role" required>
                <option disabled value="">Select your role</option>
                <option value="As_patient">Patient (Type2 / Pre-diabetes)</option>
                <option value="As_family">Family member</option>
                <option value="As_hcp">Healthcare Professional</option>
              </select>
              <div v-if="errors.role" class="error-message">{{ errors.role }}</div>
            </div>

            <div class="form-group">
              <label for="userGender" class="form-label">Gender</label>
              <select id="userGender" class="form-select" v-model="formData.gender" required>
                <option disabled value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="notSay">Prefer not to say</option>
              </select>
              <div v-if="errors.gender" class="error-message">{{ errors.gender }}</div>
            </div>

            <div v-if="errorMsg" class="error-message main-error">{{ errorMsg }}</div>

            <button type="submit" class="register-btn" :disabled="loadingBtn">
              <span v-if="loadingBtn">Creating Account...</span>
              <span v-else>Create Account</span>
            </button>

            <div class="register-footer">
              <p class="login-text">
                Already have an account?
                <router-link to="/login" class="login-link">Sign In</router-link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <div class="register-right">
        <div class="image-container">
          <img src="@/assets/register.png" alt="Register" class="register-image" />
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
const { register, errorMsg, setUserRoleOnRegister } = useUser()

const LOCAL_ROLES_KEY = 'userEmailToRole'

function readLocalRoles() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ROLES_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeLocalRoles(map) {
  localStorage.setItem(LOCAL_ROLES_KEY, JSON.stringify(map))
}

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

const loadingBtn = ref(false)

const onRegister = async () => {
  clearFormData()
  const okEmail = isvaildEmail(true)
  const okPwd = isvaildPassword(true)
  const okConfirmPwd = validateConfirmPassword(true)

  if (!okEmail || !okPwd || !okConfirmPwd) return

  loadingBtn.value = true
  const res = await register(formData.value.userEmail, formData.value.password)
  loadingBtn.value = false

  if (res.success) {
    const map = readLocalRoles()
    map[formData.value.userEmail] = formData.value.role
    writeLocalRoles(map)

    await setUserRoleOnRegister(formData.value.userEmail, formData.value.role)
    alert('Registration successful! Welcome to our diabetes support community.')
    const redirect = route.query.redirect || '/about'
    router.replace(String(redirect))
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.register-wrapper {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  max-width: 1000px;
  width: 100%;
  min-height: 600px;
}

.register-left {
  flex: 1;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-form-container {
  width: 100%;
  max-width: 400px;
}

.register-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0b2540;
  margin-bottom: 0.5rem;
  text-align: center;
}

.register-subtitle {
  color: #6c757d;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.register-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #0b2540;
  font-size: 0.95rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #0d6efd;
  background: white;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.form-select {
  cursor: pointer;
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

.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3);
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.register-footer {
  text-align: center;
}

.login-text {
  color: #6c757d;
  margin: 0;
  font-size: 0.95rem;
}

.login-link {
  color: #0d6efd;
  text-decoration: none;
  font-weight: 600;
}

.login-link:hover {
  text-decoration: underline;
}

.register-right {
  flex: 1;
  background: #e7f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.image-container {
  text-align: center;
}

.register-image {
  max-width: 100%;
  height: auto;
  max-height: 500px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .register-wrapper {
    flex-direction: column;
    margin: 1rem;
  }

  .register-left {
    padding: 2rem;
  }

  .register-right {
    padding: 1rem;
  }

  .register-title {
    font-size: 2rem;
  }
}
</style>