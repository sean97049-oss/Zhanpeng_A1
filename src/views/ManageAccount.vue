<template>
  <div class="manage-account">
    <div class="container">
      <h2 class="page-title">Manage Accounts</h2>
      <p class="page-subtitle">Manage user accounts and roles</p>

      <div class="account-controls">
        <div class="search-section">
          <div class="search-box">
            <i class="pi pi-search"></i>
            <input v-model="searchQuery" @input="filterUsers" placeholder="Search users by email..."
              class="search-input" />
          </div>
          <button @click="refreshUsers" class="refresh-btn">
            <i class="pi pi-refresh"></i>
            Refresh
          </button>
        </div>

        <div class="bulk-actions">
          <button @click="selectAll" class="action-btn secondary">
            <i class="pi pi-check-square"></i>
            Select All
          </button>
          <button @click="clearSelection" class="action-btn secondary">
            <i class="pi pi-square"></i>
            Clear Selection
          </button>
          <button @click="openEmailModal" class="action-btn primary" :disabled="allSelectedUsers.length === 0">
            <i class="pi pi-envelope"></i>
            Send Email ({{ allSelectedUsers.length }})
          </button>
        </div>
      </div>

      <!-- Tables Container - Left and Right Layout -->
      <div class="tables-container">
        <!-- Left Table - Administrators -->
        <div class="table-section left-table">
          <h3 class="table-title">
            <i class="pi pi-shield"></i>
            Administrators ({{ adminUsers.length }})
          </h3>
          <div class="users-table-container">
            <DataTable :value="adminUsers" v-model:selection="selectedAdminUsers" selectionMode="multiple" dataKey="uid"
              :paginator="true" :rows="8" :rowsPerPageOptions="[5, 8, 10]"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} administrators"
              class="users-table admin-table">
              <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
              <Column field="email" header="Email" sortable>
                <template #body="slotProps">
                  <div class="user-info">
                    <i class="pi pi-user"></i>
                    <span>{{ slotProps.data.email }}</span>
                  </div>
                </template>
              </Column>
              <Column field="role" header="Role" sortable>
                <template #body="slotProps">
                  <span :class="['role-badge', slotProps.data.role]">
                    {{ slotProps.data.role }}
                  </span>
                </template>
              </Column>
              <Column field="createdAt" header="Created" sortable>
                <template #body="slotProps">
                  {{ formatDate(slotProps.data.createdAt) }}
                </template>
              </Column>
            </DataTable>
          </div>
        </div>

        <!-- Right Table - Regular Users -->
        <div class="table-section right-table">
          <h3 class="table-title">
            <i class="pi pi-users"></i>
            Regular Users ({{ regularUsers.length }})
          </h3>
          <div class="users-table-container">
            <DataTable :value="regularUsers" v-model:selection="selectedRegularUsers" selectionMode="multiple"
              dataKey="uid" :paginator="true" :rows="8" :rowsPerPageOptions="[5, 8, 10]"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
              class="users-table regular-table">
              <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
              <Column field="email" header="Email" sortable>
                <template #body="slotProps">
                  <div class="user-info">
                    <i class="pi pi-user"></i>
                    <span>{{ slotProps.data.email }}</span>
                  </div>
                </template>
              </Column>
              <Column field="role" header="Role" sortable>
                <template #body="slotProps">
                  <span :class="['role-badge', slotProps.data.role]">
                    {{ slotProps.data.role }}
                  </span>
                </template>
              </Column>
              <Column field="createdAt" header="Created" sortable>
                <template #body="slotProps">
                  {{ formatDate(slotProps.data.createdAt) }}
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
    </div>

    <!-- Email Modal -->
    <div v-if="showEmailModal" class="modal-overlay" @click="closeEmailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Send Email to Selected Users</h3>
          <button @click="closeEmailModal" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Subject:</label>
            <input v-model="emailSubject" class="form-input" placeholder="Enter email subject" />
          </div>
          <div class="form-group">
            <label>Message:</label>
            <textarea v-model="emailContent" class="form-textarea" placeholder="Enter your message" rows="6"></textarea>
          </div>
          <div class="recipients-info">
            <strong>Recipients ({{ allSelectedUsers.length }}):</strong>
            <div class="recipients-list">
              <span v-for="user in allSelectedUsers" :key="user.uid" class="recipient-tag">
                {{ user.email }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeEmailModal" class="btn btn-secondary">Cancel</button>
          <button @click="sendBulkEmail" class="btn btn-primary" :disabled="!emailSubject || !emailContent">
            Send Email
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { collection, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '@/Firebase/firebase.js'
import { useUser } from '@/Firebase/user'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const { isAdmin } = useUser()

const users = ref([])
const filteredUsers = ref([])
const selectedUsers = ref([])
const selectedAdminUsers = ref([])
const selectedRegularUsers = ref([])
const searchQuery = ref('')
const showEmailModal = ref(false)
const emailSubject = ref('')
const emailContent = ref('')

const loadUsers = async () => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    users.value = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))
    filteredUsers.value = [...users.value]
  } catch (error) {
    console.error('Error loading users:', error)
    alert('Failed to load users')
  }
}

const adminUsers = computed(() => {
  return users.value.filter(user => user.role === 'As_hcp')
})

const regularUsers = computed(() => {
  return users.value.filter(user => user.role !== 'As_hcp')
})

const allSelectedUsers = computed(() => {
  return [...selectedAdminUsers.value, ...selectedRegularUsers.value]
})

const filterUsers = () => {
  if (!searchQuery.value) {
    filteredUsers.value = [...users.value]
  } else {
    filteredUsers.value = users.value.filter(user =>
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
}

const selectAll = () => {
  selectedUsers.value = [...filteredUsers.value]
  selectedAdminUsers.value = [...adminUsers.value]
  selectedRegularUsers.value = [...regularUsers.value]
}

const clearSelection = () => {
  selectedUsers.value = []
  selectedAdminUsers.value = []
  selectedRegularUsers.value = []
}

const refreshUsers = () => {
  loadUsers()
  clearSelection()
}

const editUser = (user) => {
  // Implement edit functionality
  console.log('Edit user:', user)
}

const deleteUser = async (user) => {
  if (confirm(`Are you sure you want to delete ${user.email}?`)) {
    try {
      await deleteDoc(doc(db, 'users', user.uid))
      await loadUsers()
      alert('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }
}

const openEmailModal = () => {
  if (allSelectedUsers.value.length === 0) return
  showEmailModal.value = true
  emailSubject.value = ''
  emailContent.value = ''
}

const closeEmailModal = () => {
  showEmailModal.value = false
  emailSubject.value = ''
  emailContent.value = ''
}

const sendBulkEmail = async () => {
  if (!emailSubject.value || !emailContent.value) return

  try {
    const recipients = allSelectedUsers.value.map(user => ({ email: user.email }))

    const response = await fetch('https://sendbulkemail-k445vgvokq-uc.a.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipients,
        subject: emailSubject.value,
        content: emailContent.value
      })
    })

    const result = await response.json()

    if (result.success) {
      alert(`Email sent successfully to ${result.recipientCount} users`)
      closeEmailModal()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error sending email:', error)
    alert('Failed to send email: ' + error.message)
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Never'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

onMounted(() => {
  if (!isAdmin.value) {
    alert('Access denied. Admin privileges required.')
    window.history.back()
    return
  }
  loadUsers()
})
</script>

<style scoped>
.manage-account {
  padding: 2rem;
  background: linear-gradient(180deg, #f5f9ff 0%, #ffffff 60%);
  min-height: calc(100vh - 88px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0b2540;
  text-align: center;
  margin-bottom: 1rem;
}

.page-subtitle {
  text-align: center;
  color: #6c757d;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.account-controls {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(13, 110, 253, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: #6c757d;
  z-index: 1;
}

.search-input {
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  width: 300px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #0d6efd;
}

.refresh-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background: #5a6268;
}

.bulk-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #0d6efd;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #0b5ed7;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #6c757d;
  color: white;
}

.action-btn.secondary:hover {
  background: #5a6268;
}

.action-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.tables-container {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.table-section {
  flex: 1;
  min-width: 0;
}

.left-table {
  margin-right: 1rem;
}

.right-table {
  margin-left: 1rem;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border-left: 4px solid #0d6efd;
}

.table-title i {
  color: #0d6efd;
  font-size: 1.1rem;
}

.users-table-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(13, 110, 253, 0.1);
  overflow: hidden;
}

.admin-table {
  border-left: 4px solid #dc3545;
}

.regular-table {
  border-left: 4px solid #28a745;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .tables-container {
    flex-direction: column;
    gap: 1.5rem;
  }

  .left-table,
  .right-table {
    margin: 0;
  }
}

@media (max-width: 768px) {
  .tables-container {
    gap: 1rem;
  }

  .table-title {
    font-size: 1.1rem;
    padding: 0.5rem 0.75rem;
  }

  .users-table-container {
    padding: 1rem;
  }
}

.users-table {
  width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info i {
  color: #0d6efd;
  font-size: 1.1rem;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.As_hcp {
  background: #d4edda;
  color: #155724;
}

.role-badge.As_patient {
  background: #cce5ff;
  color: #004085;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.edit-btn,
.delete-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.edit-btn {
  background: #ffc107;
  color: #000;
}

.edit-btn:hover {
  background: #e0a800;
  transform: translateY(-1px);
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #0b2540;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #0b2540;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #0d6efd;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.recipients-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.recipients-list {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.recipient-tag {
  background: #e7f3ff;
  color: #0d6efd;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary {
  background: #0d6efd;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0b5ed7;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .manage-account {
    padding: 1rem;
  }

  .account-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .bulk-actions {
    justify-content: center;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
