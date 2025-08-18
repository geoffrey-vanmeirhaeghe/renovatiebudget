<template>
  <ClientOnly>
    <!-- Main Control Panel (only visible when nothing is selected) -->
    <div v-if="!selectedObject" class="data-source-panel">
      <div class="panel-header">
        <h3>📐 Project Controls</h3>
      </div>
      
      <!-- Project Management -->
      <div class="property-section compact">
        <h4>Project</h4>
        <div class="property-group compact">
          <input 
            v-model="projectTitle"
            @input="updateProjectTitle"
            type="text"
            class="title-input"
            placeholder="Project name"
          >
        </div>
        <div class="compact-buttons">
          <button 
            @click="saveCurrentProject" 
            :disabled="!canSave || isSaving"
            class="compact-btn save-btn"
            :title="isSaving ? 'Saving...' : 'Save Project'"
          >
            {{ isSaving ? '⏳' : '💾' }}
          </button>
          <button 
            @click="createNewProject" 
            class="compact-btn"
            title="New Project"
          >
            ✨
          </button>
          <button 
            @click="loadStrapiData" 
            :class="{ active: dataSource === 'strapi' }"
            class="compact-btn"
            title="Load from Strapi"
          >
            🌐
          </button>
        </div>
        <div class="status-info" v-if="saveStatus">
          <small :class="{ error: saveStatus.includes('Error'), success: saveStatus.includes('Saved') }">
            {{ saveStatus }}
          </small>
        </div>
      </div>

      <!-- Building Tools -->
      <div class="property-section compact">
        <h4>Building Tools</h4>
        <div class="compact-buttons">
          <button 
            @click="quickAddFloor"
            class="compact-btn"
            title="Add Floor"
          >
            🏢 Add Floor
          </button>
          <button 
            @click="showClearHouseConfirmation"
            class="compact-btn clear-house-btn"
            title="Clear entire house (remove all floors)"
          >
            🧹 Clear House
          </button>
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
          :value="convertToDisplay(currentObject?.width || 0)"
          @input="updateWidth($event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="getDimensionRange('WIDTH').min"
          :max="getDimensionRange('WIDTH').max"
          :value="convertToDisplay(currentObject?.width || 0)"
          @input="updateWidth($event.target.value)"
          class="number-input"
        >
        <span class="unit">{{ getDisplayUnit() }}</span>
      </div>
      
      <div class="property-group">
        <label>Height:</label>
        <input 
          type="range" 
          :min="getDimensionRange('HEIGHT').min" 
          :max="getDimensionRange('HEIGHT').max" 
          :step="1"
          :value="convertToDisplay(currentObject?.height || 0)"
          @input="updateHeight($event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="getDimensionRange('HEIGHT').min"
          :max="getDimensionRange('HEIGHT').max"
          :value="convertToDisplay(currentObject?.height || 0)"
          @input="updateHeight($event.target.value)"
          class="number-input"
        >
        <span class="unit">{{ getDisplayUnit() }}</span>
      </div>
    </div>

    <!-- Wall Orientation Controls -->
    <div v-if="isWindowOrDoor" class="property-section">
      <h4>Wall Position</h4>
      
      <div class="property-group">
        <label>Wall:</label>
        <select 
          :value="currentObject?.position?.orientation || 'front'"
          @change="updateOrientation($event.target.value)"
          class="orientation-select"
        >
          <option value="front">Front Wall</option>
          <option value="back">Back Wall</option>
          <option value="left">Left Wall</option>
          <option value="right">Right Wall</option>
        </select>
      </div>
      
      <div class="orientation-info">
        <small>{{ getOrientationDescription() }}</small>
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
          :value="convertToDisplay(currentObject?.position?.x || 0)"
          @input="updateXPosition($event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="0"
          :max="getMaxXPosition()"
          :value="convertToDisplay(currentObject?.position?.x || 0)"
          @input="updateXPosition($event.target.value)"
          class="number-input"
        >
        <span class="unit">{{ getDisplayUnit() }}</span>
      </div>
      
      <div class="property-group">
        <label>Y Position:</label>
        <input 
          type="range" 
          :min="0" 
          :max="getMaxYPosition()" 
          :step="1"
          :value="convertToDisplay(currentObject?.position?.y || 0)"
          @input="updateYPosition($event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="0"
          :max="getMaxYPosition()"
          :value="convertToDisplay(currentObject?.position?.y || 0)"
          @input="updateYPosition($event.target.value)"
          class="number-input"
        >
        <span class="unit">{{ getDisplayUnit() }}</span>
      </div>
    </div>


    <!-- Element Actions (when any element is selected) -->
    <div v-if="selectedObject" class="property-section">
      <h4>Actions</h4>
      <div class="action-buttons">
        <!-- Delete button for all elements except roof -->
        <button 
          v-if="selectedObject.type !== 'roof'"
          @click="deleteSelectedElement"
          class="action-btn delete-btn"
          title="Delete this element"
        >
          🗑️ Delete
        </button>
        
        <!-- Duplicate button for all elements except roof -->
        <button 
          v-if="selectedObject.type !== 'roof'"
          @click="duplicateSelectedElement"
          class="action-btn duplicate-btn"
          title="Duplicate this element"
        >
          📋 Duplicate
        </button>
        
        <!-- Convert buttons for windows and doors -->
        <button 
          v-if="selectedObject.type === 'window'"
          @click="transformToDoor"
          class="action-btn transform-btn"
          title="Convert to door"
        >
          🚪 Convert to Door
        </button>
        
        <button 
          v-if="selectedObject.type === 'door'"
          @click="transformToWindow"
          class="action-btn transform-btn"
          title="Convert to window"
        >
          🪟 Convert to Window
        </button>
        
        <!-- Clear floor button when floor is selected -->
        <button 
          v-if="selectedObject.type === 'floor'"
          @click="showClearFloorConfirmation"
          class="action-btn clear-btn"
          title="Remove all windows and doors from this floor"
        >
          🧹 Clear Floor
        </button>
      </div>
    </div>

    <!-- Element Creation (when floor is selected) -->
    <div v-if="selectedObject?.type === 'floor'" class="property-section">
      <h4>Add Elements</h4>
      <div class="add-buttons">
        <button 
          @click="quickAddWindow"
          class="add-btn window-btn"
        >
          🪟 Add Window
        </button>
        <button 
          @click="quickAddDoor"
          class="add-btn door-btn"
        >
          🚪 Add Door
        </button>
      </div>
      <div class="add-info">
        <small>Elements will be placed on the front wall and can be repositioned</small>
      </div>
    </div>

    <!-- Floor Properties -->
    <div v-if="selectedObject.type === 'floor'" class="property-section">
      <h4>Floor Settings</h4>
      <div class="property-group">
        <label>Height:</label>
        <input 
          type="range" 
          :min="Math.round(convertToDisplay(DIMENSION_RANGES.FLOORS.HEIGHT.min))" 
          :max="Math.round(convertToDisplay(DIMENSION_RANGES.FLOORS.HEIGHT.max))" 
          :step="1"
          :value="convertToDisplay(currentObject?.height || 0)"
          @input="updateFloorHeight($event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="Math.round(convertToDisplay(DIMENSION_RANGES.FLOORS.HEIGHT.min))"
          :max="Math.round(convertToDisplay(DIMENSION_RANGES.FLOORS.HEIGHT.max))"
          :value="convertToDisplay(currentObject?.height || 0)"
          @input="updateFloorHeight($event.target.value)"
          class="number-input"
        >
        <span class="unit">{{ getDisplayUnit() }}</span>
      </div>

      
      <div class="property-group">
        <label>Color:</label>
        <div class="color-options">
          <button 
            v-for="color in floorColors" 
            :key="color.value"
            :style="{ backgroundColor: color.value }"
            :class="{ active: currentObject?.color === color.value }"
            @click="updateFloorColor(color.value)"
            class="color-btn"
            :title="color.name"
          ></button>
        </div>
      </div>
      
      <!-- Floor Movement Controls -->
      <div class="property-group">
        <label>Floor Level:</label>
        <div class="floor-movement-controls">
          <button 
            @click="moveFloorUp"
            :disabled="!canMoveFloorUp"
            class="action-btn floor-move-btn"
            title="Move floor up"
          >
            ⬆️ Move Up
          </button>
          <button 
            @click="moveFloorDown"
            :disabled="!canMoveFloorDown"
            class="action-btn floor-move-btn"
            title="Move floor down"
          >
            ⬇️ Move Down
          </button>
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
          :min="Math.round(convertToDisplay(-1000))" 
          :max="Math.round(convertToDisplay(1000))" 
          :step="Math.round(convertToDisplay(5))"
          :value="getFloorPosition('positionX')"
          @input="updateFloorPosition('positionX', $event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="Math.round(convertToDisplay(-1000))"
          :max="Math.round(convertToDisplay(1000))"
          :step="Math.round(convertToDisplay(5))"
          :value="getFloorPosition('positionX')"
          @input="updateFloorPosition('positionX', $event.target.value)"
          class="number-input"
        >
        <span class="unit">{{ getDisplayUnit() }}</span>
      </div>
      
      <div class="property-group">
        <label>Z Position:</label>
        <input 
          type="range" 
          :min="Math.round(convertToDisplay(-1000))" 
          :max="Math.round(convertToDisplay(1000))" 
          :step="Math.round(convertToDisplay(5))"
          :value="getFloorPosition('positionZ')"
          @input="updateFloorPosition('positionZ', $event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="Math.round(convertToDisplay(-1000))"
          :max="Math.round(convertToDisplay(1000))"
          :step="Math.round(convertToDisplay(5))"
          :value="getFloorPosition('positionZ')"
          @input="updateFloorPosition('positionZ', $event.target.value)"
          class="number-input"
        >
        <span class="unit">{{ getDisplayUnit() }}</span>
      </div>
    </div>

    <!-- Roof Type -->
    <div v-if="selectedObject.type === 'roof'" class="property-section">
      <h4>Roof Type</h4>
      <div class="property-group">
        <label>Type:</label>
        <select 
          :value="getCurrentRoofStrapiType"
          @change="updateRoofType($event.target.value)"
          class="roof-type-select"
        >
          <option 
            v-for="option in roofTypeOptions" 
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Roof Position -->
    <div v-if="selectedObject.type === 'roof'" class="property-section">
      <h4>Roof Position</h4>
      <div class="property-group">
        <label>X Position:</label>
        <input 
          type="range" 
          :min="Math.round(convertToDisplay(-1000))" 
          :max="Math.round(convertToDisplay(1000))" 
          :step="Math.round(convertToDisplay(5))"
          :value="getRoofPosition('positionX')"
          @input="updateRoofHorizontalPosition('positionX', $event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="Math.round(convertToDisplay(-1000))"
          :max="Math.round(convertToDisplay(1000))"
          :step="Math.round(convertToDisplay(5))"
          :value="getRoofPosition('positionX')"
          @input="updateRoofHorizontalPosition('positionX', $event.target.value)"
          class="number-input"
        >
        <span class="unit">{{ getDisplayUnit() }}</span>
      </div>
      
      <div class="property-group">
        <label>Z Position:</label>
        <input 
          type="range" 
          :min="Math.round(convertToDisplay(-1000))" 
          :max="Math.round(convertToDisplay(1000))" 
          :step="Math.round(convertToDisplay(5))"
          :value="getRoofPosition('positionZ')"
          @input="updateRoofHorizontalPosition('positionZ', $event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="Math.round(convertToDisplay(-1000))"
          :max="Math.round(convertToDisplay(1000))"
          :step="Math.round(convertToDisplay(5))"
          :value="getRoofPosition('positionZ')"
          @input="updateRoofHorizontalPosition('positionZ', $event.target.value)"
          class="number-input"
        >
        <span class="unit">{{ getDisplayUnit() }}</span>
      </div>
    </div>

    <!-- Floor Dimensions -->
    <div v-if="selectedObject.type === 'floor'" class="property-section">
      <h4>Floor Dimensions</h4>
      <div class="property-group">
        <label>Width:</label>
        <input 
          type="range" 
          :min="Math.round(convertToDisplay(500))" 
          :max="Math.round(convertToDisplay(3000))" 
          :step="Math.round(convertToDisplay(10))"
          :value="getFloorDimension('width')"
          @input="updateFloorDimension('width', $event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="Math.round(convertToDisplay(500))"
          :max="Math.round(convertToDisplay(3000))"
          :step="Math.round(convertToDisplay(10))"
          :value="getFloorDimension('width')"
          @input="updateFloorDimension('width', $event.target.value)"
          class="number-input"
        >
        <span class="unit">{{ getDisplayUnit() }}</span>
      </div>
      
      <div class="property-group">
        <label>Depth:</label>
        <input 
          type="range" 
          :min="Math.round(convertToDisplay(500))" 
          :max="Math.round(convertToDisplay(3000))" 
          :step="Math.round(convertToDisplay(10))"
          :value="getFloorDimension('depth')"
          @input="updateFloorDimension('depth', $event.target.value)"
          class="slider"
        >
        <input 
          type="number"
          :min="Math.round(convertToDisplay(500))"
          :max="Math.round(convertToDisplay(3000))"
          :step="Math.round(convertToDisplay(10))"
          :value="getFloorDimension('depth')"
          @input="updateFloorDimension('depth', $event.target.value)"
          class="number-input"
        >
        <span class="unit">{{ getDisplayUnit() }}</span>
      </div>
    </div>
    </div>

    <!-- Confirmation Modals -->
    <Teleport to="body">
      <!-- Clear Floor Confirmation Modal -->
      <div v-if="showClearFloorModal" class="modal-overlay" @click="showClearFloorModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Clear Floor</h3>
            <button @click="showClearFloorModal = false" class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to clear all windows and doors from this floor?</p>
            <p class="modal-warning">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button @click="showClearFloorModal = false" class="modal-btn cancel">Cancel</button>
            <button @click="clearFloor" class="modal-btn danger">Clear Floor</button>
          </div>
        </div>
      </div>

      <!-- Clear House Confirmation Modal -->
      <div v-if="showClearHouseModal" class="modal-overlay" @click="showClearHouseModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Clear Entire House</h3>
            <button @click="showClearHouseModal = false" class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to clear the entire house?</p>
            <p>This will remove all floors except the ground floor, and clear all windows and doors.</p>
            <p class="modal-warning">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button @click="showClearHouseModal = false" class="modal-btn cancel">Cancel</button>
            <button @click="clearHouse" class="modal-btn danger">Clear House</button>
          </div>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
/**
 * PropertyPanel Component - Main UI for 3D House Editor
 * 
 * DEBUG FUNCTIONALITY ACCESS:
 * All debug and testing functions are still available in this component but hidden from the UI.
 * You can access them by calling these functions directly in the browser console:
 * 
 * - loadMockScenario(1|2|3) - Load different mock project scenarios
 * - runApiTests() - Test Strapi API endpoints
 * - runPermissionCheck() - Check API permissions
 * - loadStrapiData() - Load from Strapi backend
 * 
 * The functions remain in the code for easy debugging and development.
 */
import type { SelectedObject } from '~/composables/useSelection'
import { DIMENSION_RANGES, SIZE_PRESETS } from '~/constants/building-standards'

const { selectedObject, clearSelection } = useSelection()
const { updateProject, currentProject, loadProject } = useProject()
const { getDisplayUnit, formatValue, convertToDisplay, convertFromDisplay } = useBuildingStandards()
const { quickCreateElement, startCreating } = useElementCreation()
const { saveProject, createProject, updateProject: updateStrapiProject, testApiEndpoints, checkPermissions, getRoofTypeOptions } = useStrapi()

// Computed properties for current object values (always fresh from project data)
const currentObject = computed(() => {
  if (!selectedObject.value || !currentProject.value) return null
  
  const { type, id, floorId } = selectedObject.value
  
  if (type === 'floor') {
    return currentProject.value.floors[id]
  }
  
  if (type === 'roof') {
    return currentProject.value.roof
  }
  
  if ((type === 'window' || type === 'door') && floorId) {
    const floor = currentProject.value.floors[floorId]
    const objects = type === 'window' ? floor?.windows : floor?.doors
    return objects?.[id]
  }
  
  return null
})

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

// Save/Create functionality
const isSaving = ref(false)
const saveStatus = ref('')

// Debug functionality
const isTestingApi = ref(false)
const isCheckingPermissions = ref(false)
const debugResults = ref('')

const runApiTests = async () => {
  if (isTestingApi.value) return
  
  isTestingApi.value = true
  debugResults.value = ''
  
  try {
    console.log('🧪 Starting comprehensive API endpoint testing...')
    const results = await testApiEndpoints()
    
    // Format results for display
    const summary = [
      `Projects: ${results.projects?.success ? 'OK' : 'FAILED'}`,
      `Buildings: ${results.buildings?.success ? 'OK' : 'FAILED'}`,
      `Populate: ${results.projectsWithPopulate?.success ? 'OK' : 'FAILED'}`,
      `Create: ${results.buildingsCreate?.success ? 'OK' : 'FAILED'}`
    ].join(', ')
    
    debugResults.value = `API Tests: ${summary}`
    
    // Show detailed console message
    console.log('✅ API testing completed! Check console for full details.')
  } catch (error) {
    console.error('❌ API testing failed:', error)
    debugResults.value = `API Tests Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
  } finally {
    isTestingApi.value = false
  }
}

const runPermissionCheck = async () => {
  if (isCheckingPermissions.value) return
  
  isCheckingPermissions.value = true
  debugResults.value = ''
  
  try {
    console.log('🔐 Starting permission check...')
    const permissions = await checkPermissions()
    
    // Format permissions for display
    const permissionSummary = [
      `Read Projects: ${permissions.canReadProjects ? 'YES' : 'NO'}`,
      `Read Buildings: ${permissions.canReadBuildings ? 'YES' : 'NO'}`,
      `Create Buildings: ${permissions.canCreateBuildings ? 'YES' : 'NO'}`,
      `Update Buildings: ${permissions.canUpdateBuildings ? 'YES' : 'NO'}`,
      `Populate Relations: ${permissions.canPopulateRelations ? 'YES' : 'NO'}`
    ].join(', ')
    
    debugResults.value = `Permissions: ${permissionSummary}`
    
    console.log('✅ Permission check completed! Check console for full details.')
  } catch (error) {
    console.error('❌ Permission check failed:', error)
    debugResults.value = `Permission Check Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
  } finally {
    isCheckingPermissions.value = false
  }
}

// Project title editing
const projectTitle = ref('')

// Watch for project changes to update the title input
watch(() => currentProject.value?.name, (newName) => {
  if (newName && newName !== projectTitle.value) {
    projectTitle.value = newName
  }
}, { immediate: true })

const canSave = computed(() => {
  return currentProject.value && !currentProject.value.id.startsWith('mock-')
})

const saveCurrentProject = async () => {
  if (!currentProject.value || isSaving.value) return

  isSaving.value = true
  saveStatus.value = ''
  
  console.log('🔍 DEBUG: Starting save process...')
  console.log('📦 Current project before save:', JSON.stringify(currentProject.value, null, 2))
  
  try {
    console.log('💾 Calling saveProject...')
    const savedProject = await saveProject(currentProject.value)
    console.log('✅ SaveProject returned:', JSON.stringify(savedProject, null, 2))
    
    console.log('🔄 Reloading project from server...')
    await loadProject(savedProject.id, true)
    console.log('✅ Project reloaded, current project now:', JSON.stringify(currentProject.value, null, 2))
    
    saveStatus.value = '✅ Project saved successfully!'
    setTimeout(() => { saveStatus.value = '' }, 5000)
  } catch (error) {
    console.error('❌ Save failed:', error)
    saveStatus.value = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    setTimeout(() => { saveStatus.value = '' }, 5000)
  } finally {
    isSaving.value = false
  }
}

const createNewProject = async () => {
  const defaultProject = {
    name: `New Project ${new Date().toLocaleDateString()}`,
    generalAttributes: {
      propertySize: { width: 2000, depth: 2000 },
      floorSize: { width: 1150, depth: 1050 }
    },
    floors: {
      '0': {
        storey: 0,
        height: 250,
        heightPosition: 0,
        color: '#f8f9fa',
        windows: {},
        doors: {}
      }
    },
    roof: {
      type: 'gable' as const,
      width: 1150,
      depth: 1050,
      height: 280,
      heightPosition: 250
    }
  }

  isSaving.value = true
  saveStatus.value = ''
  
  try {
    const newProject = await createProject(defaultProject)
    
    // Load the new project
    await loadProject(newProject.id, true)
    dataSource.value = 'strapi'
    
    saveStatus.value = '✅ New project created!'
    setTimeout(() => { saveStatus.value = '' }, 3000)
  } catch (error) {
    console.error('Create failed:', error)
    saveStatus.value = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    setTimeout(() => { saveStatus.value = '' }, 5000)
  } finally {
    isSaving.value = false
  }
}

const updateProjectTitle = () => {
  if (!currentProject.value || !projectTitle.value.trim()) return
  
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  updatedProject.name = projectTitle.value.trim()
  
  updateProject(updatedProject)
}

// Confirmation modals state
const showClearFloorModal = ref(false)
const showClearHouseModal = ref(false)

// Show confirmation modals
const showClearFloorConfirmation = () => {
  showClearFloorModal.value = true
}

const showClearHouseConfirmation = () => {
  showClearHouseModal.value = true
}

// Delete selected element
const deleteSelectedElement = () => {
  if (!selectedObject.value || !currentProject.value) return
  
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  const { type, id, floorId } = selectedObject.value
  
  if (type === 'floor') {
    // Delete entire floor
    delete updatedProject.floors[id]
    
    // Update roof position to sit on top of remaining floors
    updateRoofPosition(updatedProject)
  } else if (type === 'window' && floorId) {
    // Delete window from specific floor
    const floor = updatedProject.floors[floorId]
    if (floor?.windows) {
      delete floor.windows[id]
    }
  } else if (type === 'door' && floorId) {
    // Delete door from specific floor
    const floor = updatedProject.floors[floorId]
    if (floor?.doors) {
      delete floor.doors[id]
    }
  } else if (type === 'roof') {
    // Delete roof (set to undefined)
    updatedProject.roof = undefined
  }
  
  // Clear selection and update project
  clearSelection()
  updateProject(updatedProject)
}

// Duplicate selected element
const duplicateSelectedElement = () => {
  if (!selectedObject.value || !currentProject.value) return
  
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  const { type, id, floorId } = selectedObject.value
  
  if (type === 'floor') {
    // Duplicate entire floor
    const originalFloor = updatedProject.floors[id]
    const newFloorId = generateFloorId(updatedProject.floors)
    const heightPosition = calculateFloorHeightPosition(updatedProject.floors)
    
    const duplicatedFloor = {
      ...originalFloor,
      storey: parseInt(newFloorId),
      heightPosition: heightPosition,
      // Duplicate all windows and doors with new IDs
      windows: Object.fromEntries(
        Object.entries(originalFloor.windows || {}).map(([_, window], index) => [
          String(index + 1), { ...window }
        ])
      ),
      doors: Object.fromEntries(
        Object.entries(originalFloor.doors || {}).map(([_, door], index) => [
          String(index + 1), { ...door }
        ])
      )
    }
    
    updatedProject.floors[newFloorId] = duplicatedFloor
    updateRoofPosition(updatedProject)
    
    // Select the new floor
    const { selectObject } = useSelection()
    nextTick(() => {
      selectObject({ type: 'floor', id: newFloorId, object: duplicatedFloor })
    })
  } else if ((type === 'window' || type === 'door') && floorId) {
    // Duplicate window or door on the same floor
    const floor = updatedProject.floors[floorId]
    const elements = type === 'window' ? floor?.windows : floor?.doors
    
    if (elements && elements[id]) {
      const originalElement = elements[id]
      
      // Find next available ID
      const existingIds = Object.keys(elements).map(k => parseInt(k)).filter(n => !isNaN(n))
      const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
      
      // Create duplicate with slight position offset
      const duplicatedElement = {
        ...originalElement,
        position: {
          ...originalElement.position,
          x: originalElement.position.x + 50 // Offset by 50cm
        }
      }
      
      elements[String(nextId)] = duplicatedElement
      
      // Select the new element
      const { selectObject } = useSelection()
      nextTick(() => {
        selectObject({ type, id: String(nextId), object: duplicatedElement, floorId })
      })
    }
  } else if (type === 'roof') {
    // For roof, we can't really duplicate, but we could create a copy with offset
    // For now, just show a message
    saveStatus.value = 'ℹ️ Roof duplication not implemented - only one roof per building'
    setTimeout(() => { saveStatus.value = '' }, 3000)
    return
  }
  
  updateProject(updatedProject)
}

// Transform window to door
const transformToDoor = () => {
  if (!selectedObject.value || selectedObject.value.type !== 'window' || !currentProject.value) return
  
  const { id, floorId } = selectedObject.value
  if (!floorId) return
  
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  const floor = updatedProject.floors[floorId]
  
  if (floor?.windows?.[id]) {
    const window = floor.windows[id]
    
    // Find next available door ID
    const existingDoorIds = Object.keys(floor.doors || {}).map(k => parseInt(k)).filter(n => !isNaN(n))
    const nextDoorId = existingDoorIds.length > 0 ? Math.max(...existingDoorIds) + 1 : 1
    
    // Create door with exact window dimensions (no resizing)
    const newDoor = {
      width: window.width, // Preserve original width
      height: window.height, // Preserve original height
      position: { ...window.position }
    }
    
    // Remove window and add door
    delete floor.windows[id]
    if (!floor.doors) floor.doors = {}
    floor.doors[String(nextDoorId)] = newDoor
    
    // Select the new door
    const { selectObject } = useSelection()
    nextTick(() => {
      selectObject({ type: 'door', id: String(nextDoorId), object: newDoor, floorId })
    })
    
    updateProject(updatedProject)
  }
}

// Transform door to window
const transformToWindow = () => {
  if (!selectedObject.value || selectedObject.value.type !== 'door' || !currentProject.value) return
  
  const { id, floorId } = selectedObject.value
  if (!floorId) return
  
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  const floor = updatedProject.floors[floorId]
  
  if (floor?.doors?.[id]) {
    const door = floor.doors[id]
    
    // Find next available window ID
    const existingWindowIds = Object.keys(floor.windows || {}).map(k => parseInt(k)).filter(n => !isNaN(n))
    const nextWindowId = existingWindowIds.length > 0 ? Math.max(...existingWindowIds) + 1 : 1
    
    // Create window with exact door dimensions (no resizing)
    const newWindow = {
      width: door.width, // Preserve original width
      height: door.height, // Preserve original height
      position: { ...door.position }
    }
    
    // Remove door and add window
    delete floor.doors[id]
    if (!floor.windows) floor.windows = {}
    floor.windows[String(nextWindowId)] = newWindow
    
    // Select the new window
    const { selectObject } = useSelection()
    nextTick(() => {
      selectObject({ type: 'window', id: String(nextWindowId), object: newWindow, floorId })
    })
    
    updateProject(updatedProject)
  }
}

// Clear all elements from selected floor
const clearFloor = () => {
  if (!selectedObject.value || selectedObject.value.type !== 'floor' || !currentProject.value) return
  
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  const floor = updatedProject.floors[selectedObject.value.id]
  
  if (floor) {
    // Clear all windows and doors
    floor.windows = {}
    floor.doors = {}
    
    updateProject(updatedProject)
    saveStatus.value = '✅ Floor cleared successfully'
    setTimeout(() => { saveStatus.value = '' }, 3000)
  }
  
  showClearFloorModal.value = false
}

// Clear entire house (remove all floors)
const clearHouse = () => {
  if (!currentProject.value) return
  
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  // Keep only one ground floor with default settings
  updatedProject.floors = {
    '0': {
      storey: 0,
      height: 250,
      heightPosition: 0,
      color: '#f8f9fa',
      windows: {},
      doors: {}
    }
  }
  
  // Reset roof position
  if (updatedProject.roof) {
    updatedProject.roof.heightPosition = 250
  }
  
  clearSelection()
  updateProject(updatedProject)
  
  saveStatus.value = '✅ House cleared - reset to ground floor only'
  setTimeout(() => { saveStatus.value = '' }, 3000)
  
  showClearHouseModal.value = false
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

// Element creation functions
const quickAddWindow = () => {
  if (!selectedObject.value || selectedObject.value.type !== 'floor') return
  
  startCreating('window', selectedObject.value.id)
  quickCreateElement('front') // Default to front wall
}

const quickAddDoor = () => {
  if (!selectedObject.value || selectedObject.value.type !== 'floor') return
  
  startCreating('door', selectedObject.value.id)
  quickCreateElement('front') // Default to front wall
}

/**
 * Generate a unique floor ID based on existing floors
 */
const generateFloorId = (floors: Record<string, any>): string => {
  const existingStoreys = Object.values(floors).map((floor: any) => floor.storey)
  const maxStorey = existingStoreys.length > 0 ? Math.max(...existingStoreys) : -1
  return (maxStorey + 1).toString()
}

/**
 * Calculate the height position for a new floor
 */
const calculateFloorHeightPosition = (floors: Record<string, any>): number => {
  if (Object.keys(floors).length === 0) return 0
  
  // Find the highest positioned floor and add its height
  let maxPosition = 0
  for (const floor of Object.values(floors) as any[]) {
    const topPosition = floor.heightPosition + floor.height
    if (topPosition > maxPosition) {
      maxPosition = topPosition
    }
  }
  
  return maxPosition
}

/**
 * Calculate the new roof position based on all floors
 * The roof should sit on top of the highest floor (floor.heightPosition + floor.height)
 */
const calculateRoofHeightPosition = (floors: Record<string, any>): number => {
  let maxPosition = 0
  
  // Find the highest point of all floors
  for (const floor of Object.values(floors) as any[]) {
    const topPosition = floor.heightPosition + floor.height
    if (topPosition > maxPosition) {
      maxPosition = topPosition
    }
  }
  
  return maxPosition
}

/**
 * Update roof position to sit on top of highest floor
 * Call this whenever floors are added, removed, or their heights change
 */
const updateRoofPosition = (project: any): void => {
  if (project.roof) {
    project.roof.heightPosition = calculateRoofHeightPosition(project.floors)
  }
}

/**
 * Quick add a new floor to the project
 */
const quickAddFloor = () => {
  if (!currentProject.value) return
  
  // Create a deep copy for reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  // Generate new floor properties
  const newFloorId = generateFloorId(updatedProject.floors)
  const heightPosition = calculateFloorHeightPosition(updatedProject.floors)
  const storeyNumber = parseInt(newFloorId)
  
  // Default floor properties (matching Belgian building standards)
  const newFloor = {
    storey: storeyNumber,
    height: 250, // 2.5m standard ceiling height
    heightPosition: heightPosition,
    color: storeyNumber % 2 === 0 ? '#f8f9fa' : '#e9ecef', // Alternate colors
    windows: {},
    doors: {}
    // width and depth will fall back to generalAttributes.floorSize
  }
  
  // Add the new floor
  updatedProject.floors[newFloorId] = newFloor
  
  // CRITICAL: Update roof position to sit on top of highest floor
  // This fixes the issue where roof could end up inside or below floors
  updateRoofPosition(updatedProject)
  
  // Update the project
  updateProject(updatedProject)
  
  // Auto-select the new floor for immediate editing
  const { selectObject } = useSelection()
  selectObject({ type: 'floor', id: newFloorId, object: newFloor })
}


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
  if (!selectedObject.value) return { 
    min: Math.round(convertToDisplay(20)), 
    max: Math.round(convertToDisplay(400)) 
  }
  
  const type = selectedObject.value.type.toUpperCase() as 'WINDOWS' | 'DOORS'
  const range = DIMENSION_RANGES[type]?.[dimension]
  
  if (useExceptionalSizes.value) {
    // Extended range for exceptional cases - convert to display units
    const currentValue = currentObject.value?.[dimension.toLowerCase()] || 0
    return {
      min: Math.round(convertToDisplay(Math.min(range?.min || 20, currentValue - 50))),
      max: Math.round(convertToDisplay(Math.max(range?.max || 400, currentValue + 100)))
    }
  }
  
  // Convert range to display units
  return {
    min: Math.round(convertToDisplay(range?.min || 20)),
    max: Math.round(convertToDisplay(range?.max || 400))
  }
}

const getMaxXPosition = () => {
  if (!currentProject.value || !selectedObject.value?.floorId) return Math.round(convertToDisplay(1000))
  
  // Get the current object's width to prevent positioning outside bounds
  const elementWidth = currentObject.value?.width || 0
  const orientation = currentObject.value?.position?.orientation
  
  // Get floor dimensions (individual floor dimensions or fall back to general attributes)
  const floor = currentProject.value.floors[selectedObject.value.floorId]
  const floorWidth = floor?.width || currentProject.value.generalAttributes.floorSize.width
  const floorDepth = floor?.depth || currentProject.value.generalAttributes.floorSize.depth
  
  let maxDimension = 0
  if (orientation === 'front' || orientation === 'back') {
    // For front/back walls, position along floor width
    maxDimension = floorWidth
  } else if (orientation === 'left' || orientation === 'right') {
    // For left/right walls, position along floor depth
    maxDimension = floorDepth
  }
  
  // Max position should be dimension minus element width to keep element fully inside
  // Using front-left origin: position 0 = left/front edge, so max = dimension - width
  const maxPosition = Math.max(0, maxDimension - elementWidth)
  return Math.round(convertToDisplay(maxPosition))
}

const getMaxYPosition = () => {
  if (!currentProject.value) return Math.round(convertToDisplay(250))
  return Math.round(convertToDisplay(currentProject.value.generalAttributes.floorSize.width / 5)) // Reasonable height limit
}

const getStyleOptions = () => {
  if (!selectedObject.value) return []
  
  const type = selectedObject.value.type.toUpperCase() as 'WINDOWS' | 'DOORS'
  return SIZE_PRESETS[type] || []
}

const updateWidth = (value: string) => {
  if (!selectedObject.value || !currentProject.value) return
  
  const displayValue = parseInt(value)
  const cmValue = convertFromDisplay(displayValue) // Convert from display unit to cm
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  if (selectedObject.value.floorId) {
    const floor = updatedProject.floors[selectedObject.value.floorId]
    if (selectedObject.value.type === 'window' && floor.windows) {
      floor.windows[selectedObject.value.id].width = cmValue
    } else if (selectedObject.value.type === 'door' && floor.doors) {
      floor.doors[selectedObject.value.id].width = cmValue
    }
  }
  
  updateProject(updatedProject)
}

const updateHeight = (value: string) => {
  if (!selectedObject.value || !currentProject.value) return
  
  const displayValue = parseInt(value)
  const cmValue = convertFromDisplay(displayValue)
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  if (selectedObject.value.floorId) {
    const floor = updatedProject.floors[selectedObject.value.floorId]
    if (selectedObject.value.type === 'window' && floor.windows) {
      floor.windows[selectedObject.value.id].height = cmValue
    } else if (selectedObject.value.type === 'door' && floor.doors) {
      floor.doors[selectedObject.value.id].height = cmValue
    }
  }
  
  updateProject(updatedProject)
}

const updateFloorHeight = (value: string) => {
  if (!selectedObject.value || !currentProject.value || selectedObject.value.type !== 'floor') return
  
  const displayValue = parseInt(value)
  const cmValue = convertFromDisplay(displayValue)
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  updatedProject.floors[selectedObject.value.id].height = cmValue
  
  // CRITICAL: Update roof position when floor height changes
  // This ensures roof always sits on top of the highest floor
  updateRoofPosition(updatedProject)
  
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
  if (!currentProject.value || !selectedObject.value) return Math.round(convertToDisplay(1000))
  
  const floor = currentProject.value.floors[selectedObject.value.id]
  // Use floor-specific dimension if available, otherwise fall back to general attributes
  const cmValue = floor[dimension] || currentProject.value.generalAttributes.floorSize[dimension]
  return Math.round(convertToDisplay(cmValue))
}

const updateFloorDimension = (dimension: 'width' | 'depth', value: string) => {
  if (!currentProject.value || !selectedObject.value) return
  
  const displayValue = parseInt(value)
  const cmValue = convertFromDisplay(displayValue)
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  // Set the dimension on the specific floor, making it independent
  updatedProject.floors[selectedObject.value.id][dimension] = cmValue
  
  updateProject(updatedProject)
}

const getFloorPosition = (position: 'positionX' | 'positionZ') => {
  if (!currentProject.value || !selectedObject.value) return 0
  
  const floor = currentProject.value.floors[selectedObject.value.id]
  // Use floor-specific position if available, otherwise default to 0
  const cmValue = floor[position] || 0
  return Math.round(convertToDisplay(cmValue))
}

const updateFloorPosition = (position: 'positionX' | 'positionZ', value: string) => {
  if (!currentProject.value || !selectedObject.value) return
  
  const displayValue = parseInt(value)
  const cmValue = convertFromDisplay(displayValue)
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  // Set the position on the specific floor
  updatedProject.floors[selectedObject.value.id][position] = cmValue
  
  updateProject(updatedProject)
}

const getRoofPosition = (position: 'positionX' | 'positionZ') => {
  if (!currentProject.value || !selectedObject.value || selectedObject.value.type !== 'roof') return 0
  
  const roof = currentProject.value.roof
  // Use roof-specific position if available, otherwise default to 0
  const cmValue = roof[position] || 0
  return Math.round(convertToDisplay(cmValue))
}

const updateRoofHorizontalPosition = (position: 'positionX' | 'positionZ', value: string) => {
  if (!currentProject.value || !selectedObject.value || selectedObject.value.type !== 'roof') return
  
  const displayValue = parseInt(value)
  const cmValue = convertFromDisplay(displayValue)
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  // Set the position on the roof
  updatedProject.roof[position] = cmValue
  
  updateProject(updatedProject)
}

const updateXPosition = (value: string) => {
  if (!selectedObject.value || !currentProject.value) return
  
  const displayValue = parseInt(value)
  const cmValue = convertFromDisplay(displayValue)
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  if (selectedObject.value.floorId) {
    const floor = updatedProject.floors[selectedObject.value.floorId]
    if (selectedObject.value.type === 'window' && floor.windows) {
      floor.windows[selectedObject.value.id].position.x = cmValue
    } else if (selectedObject.value.type === 'door' && floor.doors) {
      floor.doors[selectedObject.value.id].position.x = cmValue
    }
  }
  
  updateProject(updatedProject)
}

const updateYPosition = (value: string) => {
  if (!selectedObject.value || !currentProject.value) return
  
  const displayValue = parseInt(value)
  const cmValue = convertFromDisplay(displayValue)
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  if (selectedObject.value.floorId) {
    const floor = updatedProject.floors[selectedObject.value.floorId]
    if (selectedObject.value.type === 'window' && floor.windows) {
      floor.windows[selectedObject.value.id].position.y = cmValue
    } else if (selectedObject.value.type === 'door' && floor.doors) {
      floor.doors[selectedObject.value.id].position.y = cmValue
    }
  }
  
  updateProject(updatedProject)
}

const updateOrientation = (newOrientation: string) => {
  if (!selectedObject.value || !currentProject.value) return
  
  // Validate orientation value
  if (!['front', 'back', 'left', 'right'].includes(newOrientation)) {
    console.error('Invalid orientation:', newOrientation)
    return
  }
  
  const orientation = newOrientation as 'front' | 'back' | 'left' | 'right'
  
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  if (selectedObject.value.floorId) {
    const floor = updatedProject.floors[selectedObject.value.floorId]
    const elementWidth = currentObject.value?.width || 0
    
    // Get floor dimensions (individual floor dimensions or fall back to general attributes)
    const floorWidth = floor.width || currentProject.value.generalAttributes.floorSize.width
    const floorDepth = floor.depth || currentProject.value.generalAttributes.floorSize.depth
    
    // Calculate new position limits based on the new orientation
    let maxPosition = 0
    if (orientation === 'front' || orientation === 'back') {
      // For front/back walls, element moves along floor width
      maxPosition = Math.max(0, floorWidth - elementWidth)
    } else if (orientation === 'left' || orientation === 'right') {
      // For left/right walls, element moves along floor depth
      maxPosition = Math.max(0, floorDepth - elementWidth)
    }
    
    // Reset position to a safe value within the new wall bounds
    // Place at 25% of the available space to avoid edge cases
    const safePosition = Math.max(0, maxPosition * 0.25)
    
    if (selectedObject.value.type === 'window' && floor.windows) {
      floor.windows[selectedObject.value.id].position.orientation = orientation
      floor.windows[selectedObject.value.id].position.x = safePosition
    } else if (selectedObject.value.type === 'door' && floor.doors) {
      floor.doors[selectedObject.value.id].position.orientation = orientation  
      floor.doors[selectedObject.value.id].position.x = safePosition
    }
  }
  
  updateProject(updatedProject)
}

const getOrientationDescription = () => {
  const orientation = currentObject.value?.position?.orientation
  switch (orientation) {
    case 'front': return 'Street-facing side of the building'
    case 'back': return 'Garden or rear side of the building'  
    case 'left': return 'Left side when facing the building'
    case 'right': return 'Right side when facing the building'
    default: return 'Select a wall orientation'
  }
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

// Roof type management
const roofTypeOptions = computed(() => getRoofTypeOptions())

// Get the current Strapi roof type for display (convert from frontend type back to Strapi type)
const getCurrentRoofStrapiType = computed(() => {
  if (!currentObject.value?.type) return 'Gable' // Default
  
  // Find the Strapi type that maps to our current frontend type
  const option = roofTypeOptions.value.find(opt => opt.frontendType === currentObject.value.type)
  return option?.value || 'Gable'
})

const updateRoofType = (strapiType: string) => {
  if (!selectedObject.value || !currentProject.value || selectedObject.value.type !== 'roof') return
  
  // Find the corresponding frontend type
  const option = roofTypeOptions.value.find(opt => opt.value === strapiType)
  if (!option) return
  
  // Create a deep copy to trigger reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  // Update the roof type (using frontend type)
  if (updatedProject.roof) {
    updatedProject.roof.type = option.frontendType
  }
  
  updateProject(updatedProject)
}

// Floor movement functions
const canMoveFloorUp = computed(() => {
  if (!selectedObject.value || selectedObject.value.type !== 'floor' || !currentProject.value) return false
  
  const currentFloor = currentProject.value.floors[selectedObject.value.id]
  if (!currentFloor) return false
  
  // Check if there's a floor above this one
  const floors = Object.values(currentProject.value.floors)
  const floorsAbove = floors.filter(f => f.storey > currentFloor.storey)
  return floorsAbove.length > 0
})

const canMoveFloorDown = computed(() => {
  if (!selectedObject.value || selectedObject.value.type !== 'floor' || !currentProject.value) return false
  
  const currentFloor = currentProject.value.floors[selectedObject.value.id]
  if (!currentFloor) return false
  
  // Check if there's a floor below this one
  const floors = Object.values(currentProject.value.floors)
  const floorsBelow = floors.filter(f => f.storey < currentFloor.storey)
  return floorsBelow.length > 0
})

const moveFloorUp = () => {
  if (!selectedObject.value || selectedObject.value.type !== 'floor' || !currentProject.value) return
  
  const currentFloorId = selectedObject.value.id
  const currentFloor = currentProject.value.floors[currentFloorId]
  if (!currentFloor) return
  
  // Find the floor directly above (next higher storey)
  const floors = Object.entries(currentProject.value.floors)
  const floorsAbove = floors.filter(([_, floor]) => floor.storey > currentFloor.storey)
  if (floorsAbove.length === 0) return
  
  // Sort by storey and get the closest one above
  floorsAbove.sort(([_, a], [__, b]) => a.storey - b.storey)
  const [targetFloorId, targetFloor] = floorsAbove[0]
  
  // Swap the storey numbers and height positions
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  const currentStorey = updatedProject.floors[currentFloorId].storey
  const targetStorey = updatedProject.floors[targetFloorId].storey
  const currentHeight = updatedProject.floors[currentFloorId].heightPosition
  const targetHeight = updatedProject.floors[targetFloorId].heightPosition
  
  // Swap storey numbers
  updatedProject.floors[currentFloorId].storey = targetStorey
  updatedProject.floors[targetFloorId].storey = currentStorey
  
  // Swap height positions
  updatedProject.floors[currentFloorId].heightPosition = targetHeight
  updatedProject.floors[targetFloorId].heightPosition = currentHeight
  
  // Update roof position
  updateRoofPosition(updatedProject)
  
  updateProject(updatedProject)
  saveStatus.value = '✅ Floor moved up'
}

const moveFloorDown = () => {
  if (!selectedObject.value || selectedObject.value.type !== 'floor' || !currentProject.value) return
  
  const currentFloorId = selectedObject.value.id
  const currentFloor = currentProject.value.floors[currentFloorId]
  if (!currentFloor) return
  
  // Find the floor directly below (next lower storey)
  const floors = Object.entries(currentProject.value.floors)
  const floorsBelow = floors.filter(([_, floor]) => floor.storey < currentFloor.storey)
  if (floorsBelow.length === 0) return
  
  // Sort by storey and get the closest one below
  floorsBelow.sort(([_, a], [__, b]) => b.storey - a.storey)
  const [targetFloorId, targetFloor] = floorsBelow[0]
  
  // Swap the storey numbers and height positions
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  const currentStorey = updatedProject.floors[currentFloorId].storey
  const targetStorey = updatedProject.floors[targetFloorId].storey
  const currentHeight = updatedProject.floors[currentFloorId].heightPosition
  const targetHeight = updatedProject.floors[targetFloorId].heightPosition
  
  // Swap storey numbers
  updatedProject.floors[currentFloorId].storey = targetStorey
  updatedProject.floors[targetFloorId].storey = currentStorey
  
  // Swap height positions
  updatedProject.floors[currentFloorId].heightPosition = targetHeight
  updatedProject.floors[targetFloorId].heightPosition = currentHeight
  
  // Update roof position
  updateRoofPosition(updatedProject)
  
  updateProject(updatedProject)
  saveStatus.value = '✅ Floor moved down'
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

.title-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.title-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
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

/* Element Creation Buttons */
.add-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.add-btn {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  text-align: center;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.add-btn:hover {
  border-color: #3b82f6;
  background: #f8faff;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.add-btn:active {
  transform: translateY(0);
}

.window-btn:hover {
  border-color: #0ea5e9;
  background: #f0f9ff;
}

.door-btn:hover {
  border-color: #8b5cf6;
  background: #faf5ff;
}

.floor-btn:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

.add-info {
  text-align: center;
  margin-top: 4px;
}

.add-info small {
  color: #666;
  font-size: 11px;
  line-height: 1.3;
}

/* Project Action Buttons */
.action-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #3b82f6;
  background: #f8faff;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.save-btn:not(:disabled):hover {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.create-btn:hover {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.action-info {
  margin-top: 4px;
  text-align: center;
}

.action-info small {
  font-size: 11px;
  line-height: 1.3;
}

.action-info .success {
  color: #22c55e;
}

.action-info .error {
  color: #ef4444;
}

/* Floor Movement Controls */
.floor-movement-controls {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.floor-move-btn {
  flex: 1;
  padding: 8px 10px;
  font-size: 12px;
  background: #f8faff;
  border: 1px solid #e5e7eb;
}

.floor-move-btn:hover:not(:disabled) {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.floor-move-btn:disabled {
  opacity: 0.4;
  background: #f9fafb;
  color: #9ca3af;
}

/* Debug Tools Styling */
.debug-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.debug-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  text-align: left;
}

.debug-btn:hover {
  border-color: #3b82f6;
  background: #f8faff;
}

.debug-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
}

.test-btn:not(:disabled):hover {
  border-color: #8b5cf6;
  background: #faf5ff;
}

.permission-btn:not(:disabled):hover {
  border-color: #f59e0b;
  background: #fffbeb;
}

.debug-info {
  margin-bottom: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.debug-results {
  font-family: monospace;
  font-size: 10px;
  color: #495057;
  line-height: 1.4;
  word-break: break-all;
}

.debug-note {
  text-align: center;
  margin-top: 4px;
}

.debug-note small {
  color: #6c757d;
  font-size: 10px;
  font-style: italic;
}

/* Compact Layout Styles */
.property-section.compact {
  padding: 12px 16px;
}

.property-section.compact h4 {
  margin-bottom: 8px;
  font-size: 13px;
}

.property-group.compact {
  margin-bottom: 8px;
}

.compact-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.compact-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  min-width: 40px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.compact-btn:hover {
  border-color: #3b82f6;
  background: #f8faff;
  transform: translateY(-1px);
}

.compact-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.compact-btn.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.compact-btn.save-btn:not(:disabled):hover {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.status-info {
  margin-top: 4px;
  text-align: center;
}

.status-info small {
  font-size: 11px;
  line-height: 1.3;
}

.status-info .success {
  color: #22c55e;
}

.status-info .error {
  color: #ef4444;
}

.debug-info {
  margin-top: 4px;
  text-align: center;
}

.debug-info small {
  font-size: 10px;
  color: #666;
}

/* Enhanced Tooltips */
.compact-btn {
  position: relative;
}

.compact-btn:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  animation: tooltip-fade-in 0.2s ease forwards;
}

.compact-btn:hover::before {
  content: '';
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  animation: tooltip-fade-in 0.2s ease forwards;
}

@keyframes tooltip-fade-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Prevent tooltips from showing when disabled */
.compact-btn:disabled:hover::after,
.compact-btn:disabled:hover::before {
  display: none;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.action-btn {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.delete-btn {
  color: #dc3545;
  border-color: #dc3545;
}

.delete-btn:hover {
  background: #dc3545;
  color: white;
}

.duplicate-btn {
  color: #6f42c1;
  border-color: #6f42c1;
}

.duplicate-btn:hover {
  background: #6f42c1;
  color: white;
}

.transform-btn {
  color: #0d6efd;
  border-color: #0d6efd;
}

.transform-btn:hover {
  background: #0d6efd;
  color: white;
}

.clear-btn {
  color: #fd7e14;
  border-color: #fd7e14;
}

.clear-btn:hover {
  background: #fd7e14;
  color: white;
}

.clear-house-btn {
  color: #dc3545;
}

.clear-house-btn:hover {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: modal-appear 0.2s ease-out;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
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
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e9ecef;
  color: #333;
}

.modal-body {
  padding: 20px;
  line-height: 1.5;
}

.modal-body p {
  margin: 0 0 12px 0;
  color: #555;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.modal-warning {
  color: #dc3545 !important;
  font-weight: 500;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.modal-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 80px;
}

.modal-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.modal-btn.cancel {
  color: #6c757d;
  border-color: #6c757d;
}

.modal-btn.cancel:hover {
  background: #6c757d;
  color: white;
}

.modal-btn.danger {
  color: #dc3545;
  border-color: #dc3545;
}

.modal-btn.danger:hover {
  background: #dc3545;
  color: white;
}

/* Advanced Tools Section */
.advanced-section details {
  margin-top: 8px;
}

.advanced-toggle {
  cursor: pointer;
  padding: 8px 0;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  user-select: none;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
  transition: color 0.2s;
}

.advanced-toggle:hover {
  color: #333;
}

.advanced-content {
  animation: slide-down 0.2s ease-out;
}

.advanced-content h5 {
  margin: 12px 0 6px 0;
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.advanced-content h5:first-child {
  margin-top: 0;
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Roof info styles */
.roof-info {
  text-align: center;
  margin-top: 4px;
}

.roof-info small {
  color: #888;
  font-size: 11px;
  font-style: italic;
}
</style>