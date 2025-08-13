<template>
  <div class="region-selector">
    <h4>Building Standards</h4>
    <div class="region-controls">
      <label for="region-select">Region:</label>
      <select 
        id="region-select"
        :value="currentRegion" 
        @change="handleRegionChange"
        class="region-dropdown"
      >
        <option value="BE">🇧🇪 Belgium</option>
        <option value="NL">🇳🇱 Netherlands</option>
        <option value="DE">🇩🇪 Germany</option>
        <option value="FR">🇫🇷 France</option>
        <option value="UK">🇬🇧 United Kingdom</option>
        <option value="US">🇺🇸 United States</option>
      </select>
    </div>
    
    <div class="region-info">
      <div class="info-row">
        <span class="label">Units:</span>
        <span class="value">{{ displayUnit }}</span>
      </div>
      <div class="info-row">
        <span class="label">Floor Height:</span>
        <span class="value">{{ formatValue(standardFloorHeight) }}</span>
      </div>
      <div class="info-row">
        <span class="label">System:</span>
        <span class="value">{{ measurementSystem }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Region } from '~/constants/regional-standards'

const { 
  getCurrentRegion, 
  setRegion, 
  getDisplayUnit, 
  formatValue, 
  getStandardFloorHeight,
  getMeasurementSystem,
  regionalConfig
} = useBuildingStandards()

// Debug logging
console.log('RegionSelector mounted, current region:', getCurrentRegion())

const currentRegion = computed(() => getCurrentRegion())
const displayUnit = computed(() => getDisplayUnit())
const standardFloorHeight = computed(() => getStandardFloorHeight())
const measurementSystem = computed(() => getMeasurementSystem())

const handleRegionChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newRegion = target.value as Region
  console.log('Region changing from', getCurrentRegion(), 'to', newRegion)
  setRegion(newRegion)
  console.log('Region changed, new region:', getCurrentRegion())
}
</script>

<style scoped>
.region-selector {
  padding: 12px;
  border: 2px solid #3b82f6;
  border-radius: 6px;
  background: #f0f9ff;
  margin-bottom: 16px;
}

.region-selector h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.region-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.region-controls label {
  font-size: 12px;
  color: #6b7280;
  min-width: 50px;
}

.region-dropdown {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  background: white;
}

.region-dropdown:focus {
  outline: none;
  border-color: #3b82f6;
}

.region-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.label {
  color: #6b7280;
}

.value {
  color: #374151;
  font-weight: 500;
}
</style>