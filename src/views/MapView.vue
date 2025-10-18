<template>
  <div class="map-page">
    <div class="search-control-container">
      <input v-model="searchQuery" @keydown.enter="searchLocation" placeholder="Search location..."
        class="search-input" />
      <button @click="searchLocation" class="search-btn">
        <i class="pi pi-search"></i> Search
      </button>
    </div>

    <div class="location-info-control">
      <span class="coordinates">
        Lng: {{ location.center.lng.toFixed(4) }} |
        Lat: {{ location.center.lat.toFixed(4) }} |
        Zoom: {{ location.zoom.toFixed(2) }}
      </span>
      <button @click="resetMap" class="reset-btn">Reset</button>
    </div>

    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2VhbmZ6aG5wIiwiYSI6ImNtZ3Mzams4azM2dXkyanBxYnBkODVieWwifQ.eExhnH-BaVJ_sLV0_9-dmw'

const mapContainer = ref(null)
const map = ref(null)
const searchQuery = ref('')

const initialLocation = {
  center: { lng: 144.9631, lat: -37.8136 },
  zoom: 12
}

const location = reactive({
  center: { lng: 144.9631, lat: -37.8136 },
  zoom: 12
})

const getLocation = () => {
  if (map.value) {
    return {
      center: map.value.getCenter(),
      zoom: map.value.getZoom()
    }
  }
  return location
}

const updateLocation = () => {
  const newLocation = getLocation()
  location.center = newLocation.center
  location.zoom = newLocation.zoom
}

const resetMap = () => {
  location.center = { ...initialLocation.center }
  location.zoom = initialLocation.zoom
  searchQuery.value = ''
}

const searchLocation = async () => {
  if (!searchQuery.value.trim()) return

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery.value)}.json?access_token=${mapboxgl.accessToken}&limit=1`
    )

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const [lng, lat] = feature.center

      location.center = { lng, lat }
      location.zoom = 15

      addSearchMarker(lng, lat, feature.place_name)
    } else {
      alert('No location found, please try other keywords')
    }
  } catch (error) {
    console.error('Search failed:', error)
    alert('Search failed, please check your network connection')
  }
}

const addSearchMarker = (lng, lat, placeName) => {
  if (map.value) {
    if (map.value.searchMarker) {
      map.value.searchMarker.remove()
    }

    const marker = new mapboxgl.Marker({ color: '#0d6efd' })
      .setLngLat([lng, lat])
      .addTo(map.value)

    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`
        <div class="search-popup">
          <h4>${placeName}</h4>
          <p>Longitude: ${lng.toFixed(4)}</p>
          <p>Latitude: ${lat.toFixed(4)}</p>
        </div>
      `)

    marker.setPopup(popup)
    marker.togglePopup()

    map.value.searchMarker = marker
  }
}

onMounted(() => {
  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: location.center,
    zoom: location.zoom
  })

  map.value.on('load', () => {
    map.value.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.value.addControl(new mapboxgl.FullscreenControl(), 'top-right')

    map.value.addControl(new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: 'metric'
    }), 'bottom-left')
  })

  map.value.on('move', updateLocation)
  map.value.on('zoom', updateLocation)
})

watch(location, (newLocation) => {
  if (map.value) {
    const currentLocation = getLocation()

    if (
      currentLocation.center.lng !== newLocation.center.lng ||
      currentLocation.center.lat !== newLocation.center.lat ||
      currentLocation.zoom !== newLocation.zoom
    ) {
      map.value.flyTo({
        center: newLocation.center,
        zoom: newLocation.zoom,
        duration: 2000
      })
    }
  }
}, { deep: true })

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})
</script>

<style scoped>
.map-page {
  padding: 2rem;
  background: linear-gradient(180deg, #f5f9ff 0%, #ffffff 60%);
  min-height: calc(100vh - 88px);
  position: relative;
}

.search-control-container {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 350px;
}

.location-info-control {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(35, 55, 75, 0.9);
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 8px 12px;
  font-size: 14px;
  background: transparent;
  color: #333;
}

.search-input::placeholder {
  color: #666;
}

.search-btn {
  background: #0d6efd;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

.search-btn:hover {
  background: #0b5ed7;
  transform: translateY(-1px);
}

.search-btn i {
  font-size: 14px;
}

.coordinates {
  white-space: nowrap;
}

.reset-btn {
  background: #0d6efd;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: monospace;
}

.reset-btn:hover {
  background: #0b5ed7;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.reset-btn:active {
  transform: translateY(0);
}

:deep(.search-popup) {
  font-family: Arial, sans-serif;
}

:deep(.search-popup h4) {
  margin: 0 0 8px 0;
  color: #0d6efd;
  font-size: 14px;
}

:deep(.search-popup p) {
  margin: 4px 0;
  font-size: 12px;
  color: #666;
}

.map-container {
  width: 100%;
  height: 70vh;
  min-height: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(13, 110, 253, 0.1);
}

:deep(.mapboxgl-ctrl-group) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.mapboxgl-ctrl-group button) {
  border-radius: 8px;
}

:deep(.mapboxgl-ctrl-scale) {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .map-page {
    padding: 1rem;
  }

  .search-control-container {
    position: relative;
    top: auto;
    left: auto;
    margin-bottom: 12px;
    min-width: auto;
    width: 100%;
  }

  .location-info-control {
    position: relative;
    top: auto;
    left: auto;
    transform: none;
    margin-bottom: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .coordinates {
    font-size: 11px;
  }

  .map-container {
    height: 60vh;
  }
}
</style>