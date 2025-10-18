<template>
  <div class="about-hero">
    <aside class="about-left">
      <nav class="type-menu">
        <h3>About diabetes</h3>
        <ul>
          <li :class="{ active: current === 'what' }" @click="current = 'what'">What is diabetes</li>
          <li :class="{ active: current === 't1' }" @click="current = 't1'">Type 1 diabetes</li>
          <li :class="{ active: current === 't2' }" @click="current = 't2'">Type 2 diabetes</li>
          <li :class="{ active: current === 'pre' }" @click="current = 'pre'">Prediabetes</li>
          <li :class="{ active: current === 'api' }" @click="current = 'api'">API Routes</li>
        </ul>
      </nav>
    </aside>

    <section class="about-right">
      <h1 class="title">{{ sections[current].title }}</h1>
      <div class="content" v-html="sections[current].html"></div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const current = ref('what')
const sections = {
  what: {
    title: 'What is diabetes',
    html: `<p>Diabetes mellitus is a condition where there is too much glucose in the blood. Over time, high glucose levels can damage blood vessels and nerves, resulting in long‑term health complications.</p>
          <p>Diabetes is a serious and chronic condition. You can live an enjoyable life by learning about the condition and effectively managing it.</p>`
  },
  t1: {
    title: 'Type 1 diabetes',
    html: `<p>Type 1 diabetes is an autoimmune condition where the pancreas produces very little or no insulin. It usually appears in childhood or adolescence, but it can develop at any age.</p>`
  },
  t2: {
    title: 'Type 2 diabetes',
    html: `<p>Type 2 diabetes occurs when the body becomes resistant to insulin or doesn't make enough. It is the most common type and can often be managed with lifestyle changes and medications.</p>`
  },
  pre: {
    title: 'Prediabetes',
    html: `<p>Prediabetes means your blood glucose levels are higher than normal, but not high enough to be diagnosed as diabetes. Early intervention can prevent or delay progression to type 2 diabetes.</p>`
  },
  api: {
    title: 'API Routes',
    html: `
      <div class="api-routes">
        <h3>Available API Endpoints</h3>
        <p>Our platform provides REST API access for third-party integration:</p>
        
        <div class="api-endpoint">
          <h4>Glucose Data API</h4>
          <div class="url-container">
            <code class="api-url">https://getglucosedata-k445vgvokq-uc.a.run.app</code>
            <button onclick="navigator.clipboard.writeText('https://getglucosedata-k445vgvokq-uc.a.run.app')" class="copy-btn">Copy</button>
          </div>
          <p><strong>Method:</strong> GET</p>
          <p><strong>Description:</strong> Retrieve all glucose level data</p>
          <p><strong>Response:</strong> JSON format with success status, data array, and count</p>
        </div>
        
        <div class="api-endpoint">
          <h4>Score Data API</h4>
          <div class="url-container">
            <code class="api-url">https://getscoredata-k445vgvokq-uc.a.run.app</code>
            <button onclick="navigator.clipboard.writeText('https://getscoredata-k445vgvokq-uc.a.run.app')" class="copy-btn">Copy</button>
          </div>
          <p><strong>Method:</strong> GET</p>
          <p><strong>Description:</strong> Retrieve all rating/score data</p>
          <p><strong>Response:</strong> JSON format with success status, data array, and count</p>
        </div>
      </div>
    `
  },
}
</script>
<style scoped>
.about-hero {
  display: flex;
  gap: 24px;
  max-width: 1680px;
  margin: 0 auto;
  padding: 16px 10px;
  min-height: calc(100vh - 88px);
}

.about-left {
  flex: 0 0 260px;
}

.type-menu {
  background: #fff;
  border: 1px solid #e6eef9;
  border-radius: 10px;
  overflow: hidden;
  position: sticky;
  top: 96px;
  height: fit-content;
}

.type-menu h3 {
  margin: 0;
  padding: 16px 18px;
  font-weight: 700;
  color: #0b2540;
  border-bottom: 1px solid #e6eef9;
}

.type-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.type-menu li {
  padding: 14px 18px;
  cursor: pointer;
  border-bottom: 1px solid #eef3fb;
  color: #0b2540;
}

.type-menu li.active {
  background: #e9f2ff;
  color: #0d6efd;
  font-weight: 700;
}

.about-right {
  flex: 1 1 900px;
  min-width: 900px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border-left: 5px solid #0d6efd;
  box-shadow: 0 16px 40px rgba(13, 110, 253, .08), 0 2px 6px rgba(0, 0, 0, .06);
}

.about-right .title {
  margin: 0 0 12px 0;
  font-size: clamp(28px, 4.6vw, 56px);
  font-weight: 800;
  color: #0b2540;
}

.about-right .content {
  color: #364a63;
  line-height: 1.7;
  font-size: 16px;
}

:deep(.api-routes) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:deep(.api-endpoint) {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border-left: 4px solid #0d6efd;
}

:deep(.api-endpoint h4) {
  color: #0b2540;
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: 700;
}

:deep(.url-container) {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
  flex-wrap: wrap;
}

:deep(.api-url) {
  background: #e9ecef;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #495057;
  word-break: break-all;
  flex: 1;
  min-width: 300px;
}

:deep(.copy-btn) {
  background: #0d6efd;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s;
}

:deep(.copy-btn:hover) {
  background: #0b5ed7;
}

@media (max-width: 991px) {
  .about-hero {
    flex-direction: column;
  }

  .about-left {
    flex: none;
  }
}
</style>