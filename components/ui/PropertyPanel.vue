<template>
  <ClientOnly>
    <!-- Data Source Toggle (only visible when nothing is selected) -->
    <div v-if="!selectedObject" class="data-source-panel">
      <div class="panel-header">
        <h3>🔧 Dev Tools</h3>
      </div>
      <div class="property-section">
        <h4>Data Source</h4>
        <div class="data-source-controls">
          <button 
            @click="loadStrapiData" 
            :class="{ active: dataSource === 'strapi' }"
            class="data-source-btn"
          >
            🌐 Strapi Data
          </button>
        </div>
        <div class="data-source-info">
          <small>Current: <strong>{{ dataSource === 'strapi' ? 'Strapi' : `Mock ${mockScenario}` }}</strong></small>
        </div>
      </div>
      
      <div class="property-section">
        <h4>Mock Scenarios</h4>
        <div class="scenario-controls">
          <button 
            @click="loadMockScenario(1)" 
            :class="{ active: dataSource === 'mock' && mockScenario === 1 }"
            class="scenario-btn"
          >
            🏠 Single Floor
          </button>
          <button 
            @click="loadMockScenario(2)" 
            :class="{ active: dataSource === 'mock' && mockScenario === 2 }"
            class="scenario-btn"
          >
            🏢 Two Floors
          </button>
          <button 
            @click="loadMockScenario(3)" 
            :class="{ active: dataSource === 'mock' && mockScenario === 3 }"
            class="scenario-btn"
          >
            🏘️ Attic House
          </button>
        </div>
        <div class="scenario-info">
          <small v-if="dataSource === 'mock'">
            <strong>{{ getScenarioDescription() }}</strong>
          </small>
        </div>
      </div>
    </div>

    <div v-if="selectedObject" class="property-panel">
    <div class="panel-header">
      <h3>{{ getObjectTitle() }}</h3>
      <button @click="clearSelection" class="close-btn">×</button>
    </div>
    
    <!-- Window/Door Properties -->
    <div v-if="isWindowOrDoor" class="property-section">
      <div class="section-header">
        <h4>Size</h4>
        <label class="exceptional-toggle">
          <input 
            type="checkbox" 
            v-model="useExceptionalSizes"
          >
          <span>Exceptional sizes</span>
        </label>
      </div>
      
      <div class="property-group">
        <label>Width:</label>
        <input 
          type="range" 
          :min="getDimensionRange('WIDTH').min" 
          :max="getDimensionRange('WIDTH').max" 
          :step="1"
          :value="selectedObject.object.width"
          @input="updateWidth($event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="getDimensionRange('WIDTH').min"
          :max="getDimensionRange('WIDTH').max"
          :value="selectedObject.object.width"
          @input="updateWidth($event.target.value)"
          class="number-input"
        >
        <span class="unit">cm</span>
      </div>
      
      <div class="property-group">
        <label>Height:</label>
        <input 
          type="range" 
          :min="getDimensionRange('HEIGHT').min" 
          :max="getDimensionRange('HEIGHT').max" 
          :step="1"
          :value="selectedObject.object.height"
          @input="updateHeight($event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="getDimensionRange('HEIGHT').min"
          :max="getDimensionRange('HEIGHT').max"
          :value="selectedObject.object.height"
          @input="updateHeight($event.target.value)"
          class="number-input"
        >
        <span class="unit">cm</span>
      </div>
    </div>

    <!-- Position Controls -->
    <div v-if="isWindowOrDoor" class="property-section">
      <h4>Position</h4>
      
      <div class="property-group">
        <label>X Position:</label>
        <input 
          type="range" 
          :min="0" 
          :max="getMaxXPosition()" 
          :step="1"
          :value="selectedObject.object.position.x"
          @input="updateXPosition($event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="0"
          :max="getMaxXPosition()"
          :value="selectedObject.object.position.x"
          @input="updateXPosition($event.target.value)"
          class="number-input"
        >
        <span class="unit">cm</span>
      </div>
      
      <div class="property-group">
        <label>Y Position:</label>
        <input 
          type="range" 
          :min="0" 
          :max="getMaxYPosition()" 
          :step="1"
          :value="selectedObject.object.position.y"
          @input="updateYPosition($event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="0"
          :max="getMaxYPosition()"
          :value="selectedObject.object.position.y"
          @input="updateYPosition($event.target.value)"
          class="number-input"
        >
        <span class="unit">cm</span>
      </div>
    </div>


    <!-- Floor Properties -->
    <div v-if="selectedObject.type === 'floor'" class="property-section">
      <h4>Floor Settings</h4>
      <div class="property-group">
        <label>Height:</label>
        <input 
          type="range" 
          :min="DIMENSION_RANGES.FLOORS.HEIGHT.min" 
          :max="DIMENSION_RANGES.FLOORS.HEIGHT.max" 
          :step="1"
          :value="selectedObject.object.height"
          @input="updateFloorHeight($event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="DIMENSION_RANGES.FLOORS.HEIGHT.min"
          :max="DIMENSION_RANGES.FLOORS.HEIGHT.max"
          :value="selectedObject.object.height"
          @input="updateFloorHeight($event.target.value)"
          class="number-input"
        >
        <span class="unit">cm</span>
      </div>

      
      <div class="property-group">
        <label>Color:</label>
        <div class="color-options">
          <button 
            v-for="color in floorColors" 
            :key="color.value"
            :style="{ backgroundColor: color.value }"
            :class="{ active: selectedObject.object.color === color.value }"
            @click="updateFloorColor(color.value)"
            class="color-btn"
            :title="color.name"
          ></button>
        </div>
      </div>
    </div>

    <!-- Floor Position -->
    <div v-if="selectedObject.type === 'floor'" class="property-section">
      <h4>Floor Position</h4>
      <div class="property-group">
        <label>X Position:</label>
        <input 
          type="range" 
          :min="-1000" 
          :max="1000" 
          :step="5"
          :value="getFloorPosition('positionX')"
          @input="updateFloorPosition('positionX', $event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="-1000"
          :max="1000"
          :step="5"
          :value="getFloorPosition('positionX')"
          @input="updateFloorPosition('positionX', $event.target.value)"
          class="number-input"
        >
        <span class="unit">cm</span>
      </div>
      
      <div class="property-group">
        <label>Z Position:</label>
        <input 
          type="range" 
          :min="-1000" 
          :max="1000" 
          :step="5"
          :value="getFloorPosition('positionZ')"
          @input="updateFloorPosition('positionZ', $event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="-1000"
          :max="1000"
          :step="5"
          :value="getFloorPosition('positionZ')"
          @input="updateFloorPosition('positionZ', $event.target.value)"
          class="number-input"
        >
        <span class="unit">cm</span>
      </div>
    </div>

    <!-- Floor Dimensions -->
    <div v-if="selectedObject.type === 'floor'" class="property-section">
      <h4>Floor Dimensions</h4>
      <div class="property-group">
        <label>Width:</label>
        <input 
          type="range" 
          :min="500" 
          :max="3000" 
          :step="10"
          :value="getFloorDimension('width')"
          @input="updateFloorDimension('width', $event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="500"
          :max="3000"
          :step="10"
          :value="getFloorDimension('width')"
          @input="updateFloorDimension('width', $event.target.value)"
          class="number-input"
        >
        <span class="unit">cm</span>
      </div>
      
      <div class="property-group">
        <label>Depth:</label>
        <input 
          type="range" 
          :min="500" 
          :max="3000" 
          :step="10"
          :value="getFloorDimension('depth')"
          @input="updateFloorDimension('depth', $event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="500"
          :max="3000"
          :step="10"
          :value="getFloorDimension('depth')"
          @input="updateFloorDimension('depth', $event.target.value)"
          class="number-input"
        >
        <span class="unit">cm</span>
      </div>
    </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { SelectedObject } from '~/composables/useSelection'
import { DIMENSION_RANGES, SIZE_PRESETS } from '~/constants/building-standards'

const { selectedObject, clearSelection } = useSelection()
const { updateProject, currentProject, loadProject } = useProject()

// Data source management
const dataSource = ref<'mock' | 'strapi'>('strapi') // Default to Strapi
const mockScenario = ref<1 | 2 | 3>(2) // Default to scenario 2

const loadMockScenario = async (scenario: 1 | 2 | 3) => {
  dataSource.value = 'mock'
  mockScenario.value = scenario
  await loadProject(undefined, false, scenario) // Load specific mock scenario
}

const loadStrapiData = async () => {
  dataSource.value = 'strapi'
  // TODO: Replace hard-coded documentId with dynamic selection
  // See TECHNICAL_DEBT.md for details
  await loadProject('ca66f5looy2mij5rua9yj987', true)
}

const getScenarioDescription = () => {
  switch (mockScenario.value) {
    case 1: return 'Ground floor + separate roof'
    case 2: return 'Ground + first floor + separate roof'
    case 3: return 'Ground floor + attic (roof integrated)'
    default: return ''
  }
}

// Set up project synchronization
useProjectSync()

const isWindowOrDoor = computed(() => {
  if (!selectedObject.value) return false
  return selectedObject.value.type === 'window' || selectedObject.value.type === 'door'
})

const currentStyle = ref('standard')
const useExceptionalSizes = ref(false)

const floorColors = [
  { name: 'Light Gray', value: '#f0f0f0' },
  { name: 'Concrete', value: '#bebebe' },
  { name: 'White', value: '#ffffff' },
  { name: 'Warm Gray', value: '#e8e8e8' },
]

const getObjectTitle = () => {
  if (!selectedObject.value) return 'No Selection (Testing)'
  
  const type = selectedObject.value.type
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const getDimensionRange = (dimension: 'WIDTH' | 'HEIGHT') => {
  if (!selectedObject.value) return { min: 20, max: 400 }
  
  const type = selectedObject.value.type.toUpperCase() as 'WINDOWS' | 'DOORS'
  const range = DIMENSION_RANGES[type]?.[dimension]
  
  if (useExceptionalSizes.value) {
    // Extended range for exceptional cases
    return {
      min: Math.min(range?.min || 20, selectedObject.value.object[dimension.toLowerCase()] - 50),
      max: Math.max(range?.max || 400, selectedObject.value.object[dimension.toLowerCase()] + 100)
    }
  }
  
  return range || { min: 20, max: 400 }
}

const getMaxXPosition = () => {
  if (!currentProject.value) return 1000
  return currentProject.value.generalAttributes.floorSize.width
}

const getMaxYPosition = () => {
  if (!currentProject.value) return 250
  return currentProject.value.generalAttributes.floorSize.width / 5 // Reasonable height limit
}

const getStyleOptions = () => {
  if (!selectedObject.value) return []
  
  const type = selectedObject.value.type.toUpperCase() as 'WINDOWS' | 'DOORS'
  return SIZE_PRESETS[type] || []
}

const updateWidth = (value: string) => {
  if (!selectedObject.value || !currentProject.value) return
  
  const numValue = parseInt(value)
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  if (selectedObject.value.floorId) {
    const floor = updatedProject.floors[selectedObject.value.floorId]
    if (selectedObject.value.type === 'window' && floor.windows) {
      floor.windows[selectedObject.value.id].width = numValue
    } else if (selectedObject.value.type === 'door' && floor.doors) {
      floor.doors[selectedObject.value.id].width = numValue
    }
  }
  
  updateProject(updatedProject)
}

const updateHeight = (value: string) => {
  if (!selectedObject.value || !currentProject.value) return
  
  const numValue = parseInt(value)
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  if (selectedObject.value.floorId) {
    const floor = updatedProject.floors[selectedObject.value.floorId]
    if (selectedObject.value.type === 'window' && floor.windows) {
      floor.windows[selectedObject.value.id].height = numValue
    } else if (selectedObject.value.type === 'door' && floor.doors) {
      floor.doors[selectedObject.value.id].height = numValue
    }
  }
  
  updateProject(updatedProject)
}

const updateFloorHeight = (value: string) => {
  if (!selectedObject.value || !currentProject.value || selectedObject.value.type !== 'floor') return
  
  const numValue = parseInt(value)
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  updatedProject.floors[selectedObject.value.id].height = numValue
  
  updateProject(updatedProject)
}

const updateFloorColor = (color: string) => {
  if (!selectedObject.value || !currentProject.value || selectedObject.value.type !== 'floor') return
  
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  updatedProject.floors[selectedObject.value.id].color = color
  
  updateProject(updatedProject)
}


const getFloorDimension = (dimension: 'width' | 'depth') => {
  if (!currentProject.value || !selectedObject.value) return 1000
  
  const floor = currentProject.value.floors[selectedObject.value.id]
  // Use floor-specific dimension if available, otherwise fall back to general attributes
  return floor[dimension] || currentProject.value.generalAttributes.floorSize[dimension]
}

const updateFloorDimension = (dimension: 'width' | 'depth', value: string) => {
  if (!currentProject.value || !selectedObject.value) return
  
  const numValue = parseInt(value)
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  // Set the dimension on the specific floor, making it independent
  updatedProject.floors[selectedObject.value.id][dimension] = numValue
  
  updateProject(updatedProject)
}

const getFloorPosition = (position: 'positionX' | 'positionZ') => {
  if (!currentProject.value || !selectedObject.value) return 0
  
  const floor = currentProject.value.floors[selectedObject.value.id]
  // Use floor-specific position if available, otherwise default to 0
  return floor[position] || 0
}

const updateFloorPosition = (position: 'positionX' | 'positionZ', value: string) => {
  if (!currentProject.value || !selectedObject.value) return
  
  const numValue = parseInt(value)
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  // Set the position on the specific floor
  updatedProject.floors[selectedObject.value.id][position] = numValue
  
  updateProject(updatedProject)
}

const updateXPosition = (value: string) => {
  if (!selectedObject.value || !currentProject.value) return
  
  const numValue = parseInt(value)
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  if (selectedObject.value.floorId) {
    const floor = updatedProject.floors[selectedObject.value.floorId]
    if (selectedObject.value.type === 'window' && floor.windows) {
      floor.windows[selectedObject.value.id].position.x = numValue
    } else if (selectedObject.value.type === 'door' && floor.doors) {
      floor.doors[selectedObject.value.id].position.x = numValue
    }
  }
  
  updateProject(updatedProject)
}

const updateYPosition = (value: string) => {
  if (!selectedObject.value || !currentProject.value) return
  
  const numValue = parseInt(value)
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  if (selectedObject.value.floorId) {
    const floor = updatedProject.floors[selectedObject.value.floorId]
    if (selectedObject.value.type === 'window' && floor.windows) {
      floor.windows[selectedObject.value.id].position.y = numValue
    } else if (selectedObject.value.type === 'door' && floor.doors) {
      floor.doors[selectedObject.value.id].position.y = numValue
    }
  }
  
  updateProject(updatedProject)
}

const applyPreset = (preset: { name: string, width: number, height: number }) => {
  if (!selectedObject.value || !currentProject.value) return
  
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  if (selectedObject.value.floorId) {
    const floor = updatedProject.floors[selectedObject.value.floorId]
    if (selectedObject.value.type === 'window' && floor.windows) {
      floor.windows[selectedObject.value.id].width = preset.width
      floor.windows[selectedObject.value.id].height = preset.height
    } else if (selectedObject.value.type === 'door' && floor.doors) {
      floor.doors[selectedObject.value.id].width = preset.width
      floor.doors[selectedObject.value.id].height = preset.height
    }
  }
  
  updateProject(updatedProject)
}
</script>

<style scoped>
.property-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.panel-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f0f0f0;
}

.property-section {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.property-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.property-section h4 {
  margin: 0;
  color: #555;
  font-size: 14px;
  font-weight: 600;
}

.exceptional-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.exceptional-toggle input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.property-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.property-group:last-child {
  margin-bottom: 0;
}

.property-group label {
  min-width: 60px;
  font-size: 14px;
  color: #666;
}

.slider {
  flex: 1;
  min-width: 0;
}

.number-input {
  width: 60px;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.number-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.unit {
  min-width: 25px;
  font-size: 12px;
  color: #888;
  text-align: left;
}

.style-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.style-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 60px;
}

.style-btn:hover {
  border-color: #3b82f6;
  background: #f8faff;
}

.style-btn small {
  font-size: 10px;
  color: #888;
  font-weight: normal;
}

.color-options {
  display: flex;
  gap: 8px;
}

.color-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: #3b82f6;
  border-width: 3px;
}

/* Data Source Panel */
.data-source-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 250px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
}

.data-source-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.data-source-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  text-align: center;
}

.data-source-btn:hover {
  border-color: #3b82f6;
  background: #f8faff;
}

.data-source-btn.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.data-source-info {
  text-align: center;
  color: #666;
}

/* Scenario Selection */
.scenario-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.scenario-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  text-align: left;
  transition: all 0.2s;
}

.scenario-btn:hover {
  border-color: #3b82f6;
  background: #f8faff;
}

.scenario-btn.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.scenario-info {
  text-align: center;
  color: #666;
  margin-top: 8px;
}
</style>