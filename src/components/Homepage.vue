<template>
  <div class="container mt-5">
    <div class='row'>
      <div class='col-md-8 offset-md-2'>
        <h2 class='text-center'>Diabetes Support</h2>

        <!-- login function -->
        <form @submit.prevent="submitForm">
          <div class='row mb-3'>
            <label for="userEmail" class='form-label'>
              Email
            </label>
            <input type="email" id="userEmail" class="form-control" :class="{ 'is-invalid': errors.userEmail }"
              v-model="formData.userEmail" @blur="isvaildEmail(true)" @input="isvaildEmail(false)" required
              placeholder="useremail@gmail.com" />
            <div v-if="errors.userEmail" class="invalid-feedback">
              {{ errors.userEmail }}
            </div>
          </div>
          <!-- input password -->
          <div class="row mb-3">
            <label for="inputPassword" class="form-label">Password</label>
            <input type="password" id="inputPassword" class="form-control" :class="{ 'is-invalid': errors.password }"
              required v-model="formData.password" @blur="isvaildPassword(true)" @input="isvaildPassword(false)"
              minlength="8" placeholder="please enter your password" />
            <div v-if="errors.password" class="invalid-feedback">
              {{ errors.password }}
            </div>
          </div>

          <div class="row mb-3">
            <label for="confirmPassword" class="form-label">confirm Password</label>
            <input type="password" id="confirmPassword" class="form-control" v-model="formData.confirmPassword"
              @blur="validateConfirmPassword(true)" placeholder="please confirm your password" />
            <div v-if="errors.confirmPassword" class="text-danger">
              {{ errors.confirmPassword }}
            </div>
          </div>



          <div class="row mb-3">
            <label for="userRole" class="form-label">please select your login role</label>
            <select id="userRole" class="form-select" v-model="formData.role" required>
              <option disabled value="">Select one</option>
              <option value="As_patient">Patient (Type2 / Pre-diabetes)</option>
              <option value="As_family">Family member</option>
              <option value="As_hcp">Healthcare Professional</option>
            </select>
          </div>

          <div class="row mb-3">
            <label for="userGender" class="form-label">Gender</label>
            <select id="userGender" class="form-select" v-model="formData.gender" required>
              <option disabled value="">please select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="notSay">Prefer not to say</option>
            </select>
          </div>

          <div class="text-center">
            <button type="submit" class="btn btn-primary me-2">Login/register</button>
            <button type="button" class="btn btn-secondary" @click="clearAgain">Clear</button>
          </div>
        </form>


        <div class="row mt-5" v-if="submittedCards.length">
          <div class="col-12">
            <h4>User List</h4>
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Confirm Password</th>
                  <th>Role</th>
                  <th>Gender</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(card, index) in submittedCards" :key="index">
                  <td>{{ card.userEmail }}</td>
                  <td>{{ card.password }}</td>
                  <td>{{ card.confirmPassword }}</td>
                  <td>{{ card.role }}</td>
                  <td>{{ card.gender }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { useAuth } from '@/components/composables/auth'

const router = useRouter()
const { login } = useAuth()

const formData = ref({
  userEmail: '',
  password: '',
  role: '',
  confirmPassword: '',
  gender: ''
});

const submittedCards = ref([]);





const errors = ref({
  userEmail: '',
  password: '',
  role: '',
  confirmPassword: '',
  gender: ''
});


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
  const password = formData.value.password;
  const confirm = formData.value.confirmPassword;

  errors.value.confirmPassword = '';
  if (showError && confirm !== password) {
    errors.value.confirmPassword = 'Passwords do not match';
    return false;
  }
  return true;
};

const isvaildPassword = (blur) => {
  const password = formData.value.password;
  const minLength = 8;

  errors.value.password = '';

  if (password.length < minLength) {
    if (blur) {
      errors.value.password = `Password must be at least ${minLength} characters long.`;
    }
    return false;
  }



  if (!/[A-Z]/.test(password)) {
    if (blur) {
      errors.value.password = 'Password must contain at least one uppercase letter.';
    }
    return false;
  }

  if (!/[a-z]/.test(password)) {
    if (blur) {
      errors.value.password = 'Password must contain at least one lowercase letter.';
    }
    return false;
  }

  if (!/\d/.test(password)) {
    if (blur) {
      errors.value.password = 'Password must contain at least one number.';
    }
    return false;
  }


  errors.value.password = '';
  return true;
}


const submitForm = () => {
  const okEmail = isvaildEmail(true)
  const okPwd = isvaildPassword(true)
  const okConfirm = validateConfirmPassword(true)
  if (!okEmail || !okPwd || !okConfirm) return

  const { ok, msg } = login(formData.value.userEmail, formData.value.password)
  if (!ok) {
    errors.value.password = msg || 'Invalid email or password'
    return
  }

  submittedCards.value.push({
    userEmail: formData.value.userEmail,
    password: '********',
    confirmPassword: '********',
    role: formData.value.role,
    gender: formData.value.gender
  })

  formData.value.password = ''
  formData.value.confirmPassword = ''

  router.push('/about')
}


const clearAgain = () => {
  formData.value.userEmail = '';
  formData.value.password = '';
  formData.value.role = '';
  formData.value.confirmPassword = '';
  formData.value.gender = '';

  errors.value.userEmail = '';
  errors.value.password = '';
  errors.value.role = '';
  errors.value.confirmPassword = '';
  errors.value.gender = '';
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-label {
  font-weight: 480;
  margin-bottom: 5px;
}

.btn {
  padding: 15px 25px;
  margin: 20px;
}

.form-control,
.form-select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-control:focus,
.form-select:focus {
  outline: none;
  border-color: #b3d8ff;

}


.is-invalid {
  border-color: #dc3545 !important;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #ea3f50;
}
</style>