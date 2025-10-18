<template>
  <div class="score-page">
    <div class="score-container">
      <h2 class="page-title">Score System</h2>
      <p class="page-subtitle">Rate and track your experience with our diabetes management system</p>

      <div class="rating-card">
        <div class="rating-form">
          <div class="rating-item">
            <span class="rating-label">Difficulty</span>
            <Rating v-model="score.difficulty" :cancel="false" />
          </div>
          <div class="rating-item">
            <span class="rating-label">Helpfulness</span>
            <Rating v-model="score.helpfulness" :cancel="false" />
          </div>
          <div class="rating-item">
            <span class="rating-label">Guidance</span>
            <Rating v-model="score.guidance" :cancel="false" />
          </div>
          <div class="rating-item">
            <span class="rating-label">Design</span>
            <Rating v-model="score.design" :cancel="false" />
          </div>
          <div class="rating-actions">
            <Button label="Submit" icon="pi pi-check" @click="finalRate" :disabled="!isComplete" class="submit-btn" />
            <Button label="Clear all" icon="pi pi-trash" severity="secondary" outlined @click="reset"
              class="clear-btn" />
          </div>
        </div>
        <div class="rating-summary">
          <div class="summary-item">
            <span class="summary-label">Overall Score:</span>
            <span class="summary-value">{{ averageOverall }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Ratings:</span>
            <span class="summary-value">{{ list.length }}</span>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <h3 class="table-title">
            <i class="pi pi-star"></i>
            Rating History
          </h3>
          <Button icon="pi pi-refresh" rounded text @click="reload" class="refresh-btn" />
        </div>

        <DataTable :value="rows" tableStyle="min-width: 40rem" class="rating-table">
          <Column field="index" header="#" style="width: 80px" />
          <Column header="Difficulty">
            <template #body="slotProps">
              <Rating :modelValue="slotProps.data.difficulty" readonly :cancel="false" />
            </template>
          </Column>
          <Column header="Helpfulness">
            <template #body="slotProps">
              <Rating :modelValue="slotProps.data.helpfulness" readonly :cancel="false" />
            </template>
          </Column>
          <Column header="Guidance">
            <template #body="slotProps">
              <Rating :modelValue="slotProps.data.guidance" readonly :cancel="false" />
            </template>
          </Column>
          <Column header="Design">
            <template #body="slotProps">
              <Rating :modelValue="slotProps.data.design" readonly :cancel="false" />
            </template>
          </Column>
          <Column field="overall" header="Overall" style="width:120px" />
          <Column field="at" header="Time">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.at) }}
            </template>
          </Column>
          <Column header="Status" style="width:140px">
            <template #body="slotProps">
              <Tag :value="statusLabel(slotProps.data.overall)" :severity="statusSeverity(slotProps.data.overall)" />
            </template>
          </Column>

          <template #footer>
            <div class="table-footer">
              Overall Score: <strong>{{ averageOverall }}</strong> | Total <strong>{{ list.length }}</strong> items
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Rating from 'primevue/rating'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

const KEY = 'date_ratings'

const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
const list = ref(Array.isArray(raw) ? raw.map((item, i) => {
  const ts = Date.now() - (raw.length - i) * 60000
  if (typeof item === 'number') {
    return { difficulty: item, helpfulness: item, guidance: item, design: item, at: ts }
  }
  if (item && typeof item === 'object') {
    if ('value' in item) {
      return { difficulty: item.value, helpfulness: item.value, guidance: item.value, design: item.value, at: item.at ?? ts }
    }
    return item
  }
  return { difficulty: 3, helpfulness: 3, guidance: 3, design: 3, at: ts }
}) : [])

const score = ref({ difficulty: 0, helpfulness: 0, guidance: 0, design: 0 })
const isComplete = computed(() => Object.values(score.value).every(v => v > 0))

function calcOverall(r) {
  return (Number(r.difficulty) + Number(r.helpfulness) + Number(r.guidance) + Number(r.design)) / 4
}

const avgDifficulty = computed(() => averageOf(list.value.map(r => r.difficulty)))
const avgHelpfulness = computed(() => averageOf(list.value.map(r => r.helpfulness)))
const avgGuidance = computed(() => averageOf(list.value.map(r => r.guidance)))
const avgDesign = computed(() => averageOf(list.value.map(r => r.design)))
const averageOverall = computed(() => averageOf(list.value.map(r => calcOverall(r))))

const rows = computed(() => list.value.map((r, idx) => ({
  index: idx + 1,
  difficulty: r.difficulty,
  helpfulness: r.helpfulness,
  guidance: r.guidance,
  design: r.design,
  overall: Math.round(calcOverall(r) * 10) / 10,
  at: r.at,
})))

function persist() {
  localStorage.setItem(KEY, JSON.stringify(list.value))
}

function finalRate() {
  if (!isComplete.value) return
  list.value.push({
    difficulty: score.value.difficulty,
    helpfulness: score.value.helpfulness,
    guidance: score.value.guidance,
    design: score.value.design,
    at: Date.now(),
  })
  persist()
  score.value = { difficulty: 0, helpfulness: 0, guidance: 0, design: 0 }
}

function reset() {
  list.value = []
  persist()
}

function reload() {
  const latest = JSON.parse(localStorage.getItem(KEY) || '[]')
  list.value = latest
}

function formatDate(ts) {
  const d = new Date(ts)
  return d.toLocaleString()
}

function statusLabel(v) {
  if (v >= 4) return 'Positive'
  if (v >= 3) return 'Neutral'
  return 'Negative'
}

function statusSeverity(v) {
  if (v >= 4) return 'success'
  if (v >= 3) return 'warn'
  return 'danger'
}

function averageOf(arr) {
  if (!arr.length) return 0
  const sum = arr.reduce((a, b) => a + Number(b || 0), 0)
  return Math.round((sum / arr.length) * 10) / 10
}
</script>

<style scoped>
.score-page {
  padding: 2rem;
  background: linear-gradient(180deg, #f5f9ff 0%, #ffffff 60%);
  min-height: calc(100vh - 88px);
}

.score-container {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0b2540;
  margin-bottom: 0.5rem;
  text-align: center;
}

.page-subtitle {
  color: #6c757d;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.rating-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(13, 110, 253, 0.1);
  border: 1px solid #e9ecef;
}

.rating-form {
  margin-bottom: 2rem;
}

.rating-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.rating-item:last-of-type {
  border-bottom: none;
}

.rating-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.rating-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
}

.submit-btn {
  background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3);
}

.clear-btn {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
}

.rating-summary {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-around;
  gap: 2rem;
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0d6efd;
}

.table-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(13, 110, 253, 0.1);
  border: 1px solid #e9ecef;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #0d6efd;
}

.table-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0b2540;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-title i {
  color: #0d6efd;
  font-size: 1.2rem;
}

.refresh-btn {
  color: #0d6efd;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: #0d6efd;
  color: white;
}

.table-footer {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-weight: 600;
  color: #2c3e50;
  margin-top: 1rem;
}

:deep(.p-datatable) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.p-datatable-header) {
  background: #0d6efd;
  color: white;
  border: none;
}

:deep(.p-datatable-thead > tr > th) {
  background: #0d6efd;
  color: white;
  border: none;
  font-weight: 600;
  padding: 1rem;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 1rem;
  border-bottom: 1px solid #f8f9fa;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: #f8f9fa;
}

:deep(.p-datatable-footer) {
  background: #f8f9fa;
  border: none;
  padding: 1rem;
}

@media (max-width: 768px) {
  .score-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .rating-summary {
    flex-direction: column;
    gap: 1rem;
  }

  .rating-actions {
    flex-direction: column;
    align-items: center;
  }

  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>