<template>
  <div class="container mt-5" style="max-width:520px">
    <h3 class="mb-3">Score system</h3>

    <div class="card p-3">
      <div class="d-flex gap-2">
        <select v-model.number="score" class="form-select" style="max-width:140px">
          <option disabled value="0">1–5</option>
          <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
        </select>
        <button class="btn btn-primary" @click="finalRate">give score</button>
        <button class="btn btn-outline-secondary" @click="reset" title="clear all">Reset</button>
      </div>

      <hr class="my-3" />

      <p class="mb-1">Average: <strong>{{ average }}</strong></p>
      <p class="mb-0">Total ratings: <strong>{{ list.length }}</strong></p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'


const KEY = 'date_ratings'
const list = ref(JSON.parse(localStorage.getItem(KEY) || '[]'))
const score = ref(0)

const average = computed(() => {
  const date = list.value
  if (!date.length) return 0
  const sum = date.reduce((acc, v) => acc + v, 0)
  return Math.round((sum / date.length) * 10) / 10
})

function finalRate() {
  if (!score.value) return
  list.value.push(score.value)
  localStorage.setItem(KEY, JSON.stringify(list.value))
  score.value = 0
}

function reset() {
  list.value = []
  localStorage.setItem(KEY, '[]')
}
</script>