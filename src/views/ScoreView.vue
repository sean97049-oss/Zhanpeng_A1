<template>
  <div class="container mt-5" style="max-width:860px">
    <h3 class="mb-3">Score system</h3>

    <div class="card p-3 mb-3">
      <div class="d-flex flex-column gap-2">
        <div class="d-flex align-items-center justify-content-between">
          <span class="fw-semibold">Difficulty</span>
          <Rating v-model="score.difficulty" :cancel="false" />
        </div>
        <div class="d-flex align-items-center justify-content-between">
          <span class="fw-semibold">Helpfulness</span>
          <Rating v-model="score.helpfulness" :cancel="false" />
        </div>
        <div class="d-flex align-items-center justify-content-between">
          <span class="fw-semibold">Guidance</span>
          <Rating v-model="score.guidance" :cancel="false" />
        </div>
        <div class="d-flex align-items-center justify-content-between">
          <span class="fw-semibold">Design</span>
          <Rating v-model="score.design" :cancel="false" />
        </div>
        <div class="d-flex align-items-center gap-2 mt-2">
          <Button label="Submit" icon="pi pi-check" @click="finalRate" :disabled="!isComplete" />
          <Button label="Clear all" icon="pi pi-trash" severity="secondary" outlined @click="reset" />
          <span class="ms-auto">Overall score: <strong>{{ averageOverall }}</strong>（{{ list.length }}）</span>
        </div>
      </div>
      <div class="mt-2 small text-muted">
        overall score: {{ avgDifficulty }} ｜ helpful {{ avgHelpfulness }} ｜ guidance {{ avgGuidance }} ｜ design {{
          avgDesign }}
      </div>
    </div>

    <div class="card p-3">
      <DataTable :value="rows" tableStyle="min-width: 40rem">
        <template #header>
          <div class="d-flex align-items-center justify-content-between w-100">
            <span class="fs-5 fw-bold">Ratings</span>
            <Button icon="pi pi-refresh" rounded text @click="reload" />
          </div>
        </template>

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
          overallScore: <strong>{{ averageOverall }}</strong> ｜ total <strong>{{ list.length }}</strong> items
        </template>
      </DataTable>
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