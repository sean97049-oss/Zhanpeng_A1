<template>
  <div class="container page mx-auto p-4">
    <h2 class="mb-3 text-2xl font-bold">Blood Glucose Records</h2>

    <div class="d-flex justify-content-center gap-4 glucose-center">
      <div class="glucose-card">
        <div class="card">
          <h3 class="mb-2">Fasting Glucose Table</h3>

          <DataTable :tableStyle="{ width: '100%' }" ref="fastingTable" v-model:filters="filters1" :value="fastingLogs"
            paginator :rows="10" filterDisplay="row" :globalFilterFields="['date', 'time', 'fastingLevel', 'status']"
            dataKey="id">
            <template #header>
              <div class="flex justify-content-between align-items-center">
                <Button icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter1()" />
                <span class="p-input-icon-left">
                  <i class="pi pi-search" />
                  <InputText v-model="filters1['global'].value" placeholder="Search keyword" />
                </span>
                <Button label="CSV" icon="pi pi-download" outlined @click="fastingTable?.exportCSV()" />
                <Button label="PDF" icon="pi pi-file-pdf" severity="danger" outlined @click="exportFastingPDF" />
              </div>
            </template>

            <Column field="date" header="Date" sortable filter filterPlaceholder="Search by date"></Column>
            <Column field="time" header="Time" sortable filter filterPlaceholder="Search by time"></Column>
            <Column field="fastingLevel" header="Fasting (mmol/L)" sortable filter filterPlaceholder="Search by value">
            </Column>
            <Column field="status" header="Status" sortable filter :showFilterMenu="false">
              <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model="filterModel.value" :options="statusOptions" placeholder="All" class="w-100" showClear
                  @change="filterCallback()" />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <div class="glucose-card">
        <div class="card">
          <h3 class="mb-2">After-Meal Glucose Table</h3>

          <DataTable :tableStyle="{ width: '100%' }" ref="afterMealTable" v-model:filters="filters2"
            :value="afterMealLogs" paginator :rows="10" filterDisplay="row"
            :globalFilterFields="['date', 'time', 'afterMealLevel', 'status']" dataKey="id">
            <template #header>
              <div class="flex justify-content-between align-items-center">
                <Button icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter2()" />
                <span class="p-input-icon-left">
                  <i class="pi pi-search" />
                  <InputText v-model="filters2['global'].value" placeholder="Search keyword" />
                </span>
                <Button label="CSV" icon="pi pi-download" outlined @click="afterMealTable?.exportCSV()" />
                <Button label="PDF" icon="pi pi-file-pdf" severity="danger" outlined @click="exportAfterPDF" />
              </div>
            </template>

            <Column field="date" header="Date" sortable filter filterPlaceholder="Search by date"></Column>
            <Column field="time" header="Time" sortable filter filterPlaceholder="Search by time"></Column>
            <Column field="afterMealLevel" header="After Meal (mmol/L)" sortable filter
              filterPlaceholder="Search by value">
            </Column>
            <Column field="status" header="Status" sortable filter :showFilterMenu="false">
              <template #filter="{ filterModel, filterCallback }">
                <Dropdown v-model="filterModel.value" :options="statusOptions" placeholder="All" class="w-100" showClear
                  @change="filterCallback()" />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const fastingTable = ref(null)
const afterMealTable = ref(null)
const fastingLogs = ref([])
const afterMealLogs = ref([])

const statusOptions = ['Normal', 'Slightly High', 'High']

function printTable(tableRef, title = 'Table') {
  const tableEl = tableRef?.value?.$el?.querySelector('.p-datatable-table')?.parentElement
  if (!tableEl) return
  const win = window.open('', '_blank')
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body{ font-family: Arial, sans-serif; padding:16px;}
          table{ width:100%; border-collapse: collapse;}
          th,td{ border:1px solid #ddd; padding:8px; }
          th{ background:#f5f5f5; }
        </style>
      </head>
      <body>
        <h3>${title}</h3>
        ${tableEl.innerHTML}
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  win.print()

}

function getRows(tableRef, fallback) {
  const t = tableRef?.value
  return (t && t.filteredValue && t.filteredValue.length ? t.filteredValue : fallback) || []
}

function downloadPDF(filename, headers, rows, headerMap) {
  const doc = new jsPDF('p', 'pt', 'a4')
  autoTable(doc, {
    head: [headers.map(h => headerMap[h] || h)],
    body: rows.map(r => headers.map(h => r[h])),
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [52, 152, 219], textColor: 255 },
    margin: 24
  })
  doc.save(filename)
}

function exportFastingPDF() {
  const headers = ['date', 'time', 'fastingLevel', 'status']
  const rows = getRows(fastingTable, fastingLogs.value)
  downloadPDF('fasting_glucose.pdf', headers, rows, {
    date: 'Date',
    time: 'Time',
    fastingLevel: 'Fasting (mmol/L)',
    status: 'Status'
  })
}

function exportAfterPDF() {
  const headers = ['date', 'time', 'afterMealLevel', 'status']
  const rows = getRows(afterTable, afterMealLogs.value)
  downloadPDF('after_meal_glucose.pdf', headers, rows, {
    date: 'Date',
    time: 'Time',
    afterMealLevel: 'After Meal (mmol/L)',
    status: 'Status'
  })
}

const filters1 = ref({
  global: { value: null, matchMode: 'contains' },
  status: { value: null, matchMode: 'equals' }
})
const filters2 = ref({
  global: { value: null, matchMode: 'contains' },
  status: { value: null, matchMode: 'equals' }
})
function clearFilter1() {
  filters1.value = { global: { value: null, matchMode: 'contains' }, status: { value: null, matchMode: 'equals' } }
}
function clearFilter2() {
  filters2.value = { global: { value: null, matchMode: 'contains' }, status: { value: null, matchMode: 'equals' } }
}
onMounted(() => {
  fastingLogs.value = [
    { id: 1, date: '2025-10-01', time: '07:30', fastingLevel: 5.6, status: 'Normal' },
    { id: 2, date: '2025-10-02', time: '07:45', fastingLevel: 6.3, status: 'Slightly High' },
    { id: 3, date: '2025-10-03', time: '07:20', fastingLevel: 4.9, status: 'Normal' },
    { id: 4, date: '2025-10-04', time: '07:40', fastingLevel: 6.8, status: 'Slightly High' },
    { id: 5, date: '2025-10-05', time: '07:25', fastingLevel: 5.2, status: 'Normal' },
    { id: 6, date: '2025-10-06', time: '07:15', fastingLevel: 4.7, status: 'Normal' },
    { id: 7, date: '2025-10-07', time: '07:35', fastingLevel: 7.1, status: 'High' },
    { id: 8, date: '2025-10-08', time: '07:50', fastingLevel: 5.5, status: 'Normal' },
    { id: 9, date: '2025-10-09', time: '07:10', fastingLevel: 6.1, status: 'Slightly High' },
    { id: 10, date: '2025-10-10', time: '07:30', fastingLevel: 5.0, status: 'Normal' },
    { id: 11, date: '2025-10-11', time: '07:45', fastingLevel: 6.7, status: 'Slightly High' },
    { id: 12, date: '2025-10-12', time: '07:20', fastingLevel: 4.8, status: 'Normal' },
    { id: 13, date: '2025-10-13', time: '07:25', fastingLevel: 5.4, status: 'Normal' },
    { id: 14, date: '2025-10-14', time: '07:15', fastingLevel: 6.5, status: 'Slightly High' },
    { id: 15, date: '2025-10-15', time: '07:40', fastingLevel: 5.1, status: 'Normal' },
    { id: 16, date: '2025-10-16', time: '07:30', fastingLevel: 6.0, status: 'Slightly High' },
    { id: 17, date: '2025-10-17', time: '07:25', fastingLevel: 5.7, status: 'Normal' },
    { id: 18, date: '2025-10-18', time: '07:35', fastingLevel: 7.2, status: 'High' },
    { id: 19, date: '2025-10-19', time: '07:45', fastingLevel: 6.4, status: 'Slightly High' },
    { id: 20, date: '2025-10-20', time: '07:20', fastingLevel: 5.3, status: 'Normal' }
  ]

  afterMealLogs.value = [
    { id: 1, date: '2025-10-01', time: '09:30', afterMealLevel: 8.2, status: 'Normal' },
    { id: 2, date: '2025-10-02', time: '09:45', afterMealLevel: 10.4, status: 'High' },
    { id: 3, date: '2025-10-03', time: '09:25', afterMealLevel: 7.8, status: 'Normal' },
    { id: 4, date: '2025-10-04', time: '09:40', afterMealLevel: 9.2, status: 'Slightly High' },
    { id: 5, date: '2025-10-05', time: '09:35', afterMealLevel: 8.0, status: 'Normal' },
    { id: 6, date: '2025-10-06', time: '09:50', afterMealLevel: 6.9, status: 'Normal' },
    { id: 7, date: '2025-10-07', time: '09:20', afterMealLevel: 11.1, status: 'High' },
    { id: 8, date: '2025-10-08', time: '09:55', afterMealLevel: 7.5, status: 'Normal' },
    { id: 9, date: '2025-10-09', time: '09:30', afterMealLevel: 9.0, status: 'Slightly High' },
    { id: 10, date: '2025-10-10', time: '09:40', afterMealLevel: 7.2, status: 'Normal' },
    { id: 11, date: '2025-10-11', time: '09:50', afterMealLevel: 10.5, status: 'High' },
    { id: 12, date: '2025-10-12', time: '09:25', afterMealLevel: 8.1, status: 'Normal' },
    { id: 13, date: '2025-10-13', time: '09:45', afterMealLevel: 9.8, status: 'Slightly High' },
    { id: 14, date: '2025-10-14', time: '09:35', afterMealLevel: 7.9, status: 'Normal' },
    { id: 15, date: '2025-10-15', time: '09:30', afterMealLevel: 8.3, status: 'Normal' },
    { id: 16, date: '2025-10-16', time: '09:40', afterMealLevel: 9.1, status: 'Slightly High' },
    { id: 17, date: '2025-10-17', time: '09:45', afterMealLevel: 7.6, status: 'Normal' },
    { id: 18, date: '2025-10-18', time: '09:20', afterMealLevel: 11.0, status: 'High' },
    { id: 19, date: '2025-10-19', time: '09:50', afterMealLevel: 8.4, status: 'Normal' },
    { id: 20, date: '2025-10-20', time: '09:30', afterMealLevel: 10.0, status: 'High' }
  ]
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page {
  margin-top: 120px;
}

.card {
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 16px;
  width: 100%;
}

:deep(.p-datatable-table) {
  width: 100%;
}

.glucose-center {
  width: 100%;
  margin: 0 auto;
}

.glucose-card {
  flex: 1 1 0;
  min-width: 720px;
}
</style>
