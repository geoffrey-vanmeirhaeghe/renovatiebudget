<template>
  <div class="side-panel">
    <!-- Context-sensitive content based on selection -->
    
    <!-- When an element is selected -->
    <div v-if="selectedObject" class="element-panel">
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

      <!-- Roof Properties -->
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
      </div>

      <!-- Element Actions -->
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
    </div>

    <!-- When a category is selected but no element or specific tool -->
    <div v-else-if="selectedCategory && categoryTools" class="category-tools-panel">
      <div class="panel-header">
        <h3>{{ categoryName || 'Tools' }}</h3>
        <button @click="closeCategoryPanel" class="close-btn">×</button>
      </div>
      
      <div class="tools-grid">
        <button
          v-for="tool in categoryTools"
          :key="tool.id"
          @click="executeTool(tool)"
          class="tool-btn"
          :class="tool.id"
          :title="tool.name"
        >
          <span class="tool-icon">{{ tool.icon }}</span>
          <span class="tool-name">{{ tool.name }}</span>
        </button>
      </div>
      
      <!-- Instructions for users -->
      <div class="panel-footer">
        <small class="instruction-text">
          Select a tool to add elements or configure settings
        </small>
      </div>
    </div>

    <!-- When a tool category/sub-tool is selected but no element -->
    <div v-else-if="selectedTool" class="tool-context-panel">
      <div class="panel-header">
        <h3>{{ selectedTool.name }}</h3>
        <button @click="clearToolSelection" class="close-btn">×</button>
      </div>
      
      <div class="tool-instructions">
        <p>{{ getToolInstructions(selectedTool) }}</p>
      </div>
    </div>

    <!-- Default state - no selection -->
    <div v-else class="default-panel">
      <div class="panel-header">
        <h3>Getting Started</h3>
      </div>
      
      <div class="welcome-content">
        <div class="welcome-section">
          <h4>🏗️ Build Your House</h4>
          <p>Select tools from the left panel to add floors, windows, doors, and more.</p>
        </div>
        
        <div class="welcome-section">
          <h4>🎯 Edit Elements</h4>
          <p>Click on any element in the 3D view to select and modify its properties.</p>
        </div>
        
        <div class="welcome-section">
          <h4>💾 Save Your Work</h4>
          <p>Use the top menu to save your project or create a new one.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DIMENSION_RANGES } from '~/constants/building-standards'

interface ToolItem {
  id: string
  name: string
  icon: string
  action: string
}

interface Props {
  selectedTool?: ToolItem | null
  selectedCategory?: string | null
  categoryName?: string
  categoryTools?: ToolItem[]
  actionsHandler?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  clearToolSelection: []
  elementAction: [action: string, data?: any]
  toolSelected: [tool: ToolItem]
  categoryDeselected: []
}>()

const { selectedObject, clearSelection } = useSelection()
const { updateProject, currentProject } = useProject()
const { getDisplayUnit, convertToDisplay, convertFromDisplay } = useBuildingStandards()
const { quickCreateElement, startCreating } = useElementCreation()
const { getRoofTypeOptions } = useStrapi()

// Computed properties for current object values
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

const isWindowOrDoor = computed(() => {
  if (!selectedObject.value) return false
  return selectedObject.value.type === 'window' || selectedObject.value.type === 'door'
})

const useExceptionalSizes = ref(false)

const floorColors = [
  { name: 'Light Gray', value: '#f0f0f0' },
  { name: 'Concrete', value: '#bebebe' },
  { name: 'White', value: '#ffffff' },
  { name: 'Warm Gray', value: '#e8e8e8' },
]

const getObjectTitle = () => {
  if (!selectedObject.value) return 'No Selection'
  
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
    const currentValue = currentObject.value?.[dimension.toLowerCase()] || 0
    return {
      min: Math.round(convertToDisplay(Math.min(range?.min || 20, currentValue - 50))),
      max: Math.round(convertToDisplay(Math.max(range?.max || 400, currentValue + 100)))
    }
  }
  
  return {
    min: Math.round(convertToDisplay(range?.min || 20)),
    max: Math.round(convertToDisplay(range?.max || 400))
  }
}

const getMaxXPosition = () => {
  if (!currentProject.value || !selectedObject.value?.floorId) return Math.round(convertToDisplay(1000))
  
  const elementWidth = currentObject.value?.width || 0
  const orientation = currentObject.value?.position?.orientation
  
  const floor = currentProject.value.floors[selectedObject.value.floorId]
  const floorWidth = floor?.width || currentProject.value.generalAttributes.floorSize.width
  const floorDepth = floor?.depth || currentProject.value.generalAttributes.floorSize.depth
  
  let maxDimension = 0
  if (orientation === 'front' || orientation === 'back') {
    maxDimension = floorWidth
  } else if (orientation === 'left' || orientation === 'right') {
    maxDimension = floorDepth
  }
  
  const maxPosition = Math.max(0, maxDimension - elementWidth)
  return Math.round(convertToDisplay(maxPosition))
}

const getMaxYPosition = () => {
  if (!currentProject.value) return Math.round(convertToDisplay(250))
  return Math.round(convertToDisplay(currentProject.value.generalAttributes.floorSize.width / 5))
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

const getToolInstructions = (tool: ToolItem) => {
  switch (tool.action) {
    case 'addFloor':
      return 'Click anywhere in the 3D view or use the tool again to add a new floor above existing ones.'
    case 'addWindow':
      return 'Click on a floor to select it, then the window will be added to the front wall. You can move it afterwards.'
    case 'addDoor':
      return 'Click on a floor to select it, then the door will be added to the front wall. You can move it afterwards.'
    default:
      return `Selected tool: ${tool.name}. Implementation coming soon.`
  }
}

const clearToolSelection = () => {
  emit('clearToolSelection')
}

const closeCategoryPanel = () => {
  emit('categoryDeselected')
}

// Tool execution logic (using already imported useElementCreation)

const executeTool = (tool: ToolItem) => {
  emit('toolSelected', tool)
  
  // Execute the tool action based on the action type
  switch (tool.action) {
    case 'addFloor':
      addFloor()
      break
    case 'addWindow':
      startWindowCreation()
      break
    case 'addDoor':
      startDoorCreation()
      break
    case 'clearHouse':
      // This will be handled by the parent component or a confirmation modal
      break
    case 'editWalls':
    case 'roomConfig':
      // Future implementation - show context panel for configuration
      showNotImplemented(tool.name)
      break
    default:
      // For future categories (Energy, Insulation, etc.)
      showNotImplemented(tool.name)
  }
}

const addFloor = () => {
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
  }
  
  // Add the new floor
  updatedProject.floors[newFloorId] = newFloor
  
  // Update roof position to sit on top of highest floor
  updateRoofPosition(updatedProject)
  
  // Update the project
  updateProject(updatedProject)
  
  // Auto-select the new floor for immediate editing
  const { selectObject } = useSelection()
  selectObject({ type: 'floor', id: newFloorId, object: newFloor })
}

const startWindowCreation = () => {
  // Check if a floor is selected
  if (!selectedObject.value || selectedObject.value.type !== 'floor') {
    // Auto-select ground floor if available
    if (currentProject.value?.floors?.['0']) {
      const { selectObject } = useSelection()
      selectObject({ 
        type: 'floor', 
        id: '0', 
        object: currentProject.value.floors['0'] 
      })
    } else {
      alert('Please select a floor first')
      return
    }
  }
  
  if (selectedObject.value && selectedObject.value.type === 'floor') {
    startCreating('window', selectedObject.value.id)
    quickCreateElement('front') // Default to front wall
  }
}

const startDoorCreation = () => {
  // Check if a floor is selected
  if (!selectedObject.value || selectedObject.value.type !== 'floor') {
    // Auto-select ground floor if available
    if (currentProject.value?.floors?.['0']) {
      const { selectObject } = useSelection()
      selectObject({ 
        type: 'floor', 
        id: '0', 
        object: currentProject.value.floors['0'] 
      })
    } else {
      alert('Please select a floor first')
      return
    }
  }
  
  if (selectedObject.value && selectedObject.value.type === 'floor') {
    startCreating('door', selectedObject.value.id)
    quickCreateElement('front') // Default to front wall
  }
}

const showNotImplemented = (toolName: string) => {
  console.log(`${toolName} tool selected - Implementation coming soon!`)
  // For now, just show a simple message
  // Later this could trigger context panels or specialized interfaces
}

// Helper functions (shared with PropertyPanel - should potentially be moved to composables)
const generateFloorId = (floors: Record<string, any>): string => {
  const existingStoreys = Object.values(floors).map((floor: any) => floor.storey)
  const maxStorey = existingStoreys.length > 0 ? Math.max(...existingStoreys) : -1
  return (maxStorey + 1).toString()
}

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

// All the update functions from PropertyPanel
const updateWidth = (value: string) => {
  if (!selectedObject.value || !currentProject.value) return
  
  const displayValue = parseInt(value)
  const cmValue = convertFromDisplay(displayValue)
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
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  updatedProject.floors[selectedObject.value.id].height = cmValue
  
  updateRoofPosition(updatedProject)
  updateProject(updatedProject)
}

const updateFloorColor = (color: string) => {
  if (!selectedObject.value || !currentProject.value || selectedObject.value.type !== 'floor') return
  
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  updatedProject.floors[selectedObject.value.id].color = color
  
  updateProject(updatedProject)
}

const updateOrientation = (newOrientation: string) => {
  if (!selectedObject.value || !currentProject.value) return
  
  if (!['front', 'back', 'left', 'right'].includes(newOrientation)) {
    console.error('Invalid orientation:', newOrientation)
    return
  }
  
  const orientation = newOrientation as 'front' | 'back' | 'left' | 'right'
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  if (selectedObject.value.floorId) {
    const floor = updatedProject.floors[selectedObject.value.floorId]
    const elementWidth = currentObject.value?.width || 0
    
    const floorWidth = floor.width || currentProject.value.generalAttributes.floorSize.width
    const floorDepth = floor.depth || currentProject.value.generalAttributes.floorSize.depth
    
    let maxPosition = 0
    if (orientation === 'front' || orientation === 'back') {
      maxPosition = Math.max(0, floorWidth - elementWidth)
    } else if (orientation === 'left' || orientation === 'right') {
      maxPosition = Math.max(0, floorDepth - elementWidth)
    }
    
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

const updateXPosition = (value: string) => {
  if (!selectedObject.value || !currentProject.value) return
  
  const displayValue = parseInt(value)
  const cmValue = convertFromDisplay(displayValue)
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

// Helper functions
const updateRoofPosition = (project: any): void => {
  if (project.roof) {
    project.roof.heightPosition = calculateRoofHeightPosition(project.floors)
  }
}

const calculateRoofHeightPosition = (floors: Record<string, any>): number => {
  let maxPosition = 0
  
  for (const floor of Object.values(floors) as any[]) {
    const topPosition = floor.heightPosition + floor.height
    if (topPosition > maxPosition) {
      maxPosition = topPosition
    }
  }
  
  return maxPosition
}

// Element actions - emit to parent for handling
const deleteSelectedElement = () => {
  emit('elementAction', 'delete')
}

const duplicateSelectedElement = () => {
  emit('elementAction', 'duplicate')
}

const transformToDoor = () => {
  emit('elementAction', 'transformToDoor')
}

const transformToWindow = () => {
  emit('elementAction', 'transformToWindow')
}

const quickAddWindow = () => {
  if (!selectedObject.value || selectedObject.value.type !== 'floor') return
  
  startCreating('window', selectedObject.value.id)
  quickCreateElement('front')
}

const quickAddDoor = () => {
  if (!selectedObject.value || selectedObject.value.type !== 'floor') return
  
  startCreating('door', selectedObject.value.id)
  quickCreateElement('front')
}

// Roof management functions and computed properties
const roofTypeOptions = computed(() => getRoofTypeOptions())

// Get the current Strapi roof type for display (convert from frontend type back to Strapi type)
const getCurrentRoofStrapiType = computed(() => {
  if (!currentObject.value?.type) return 'Gable' // Default
  
  // Find the Strapi type that maps to our current frontend type
  const option = roofTypeOptions.value.find(opt => opt.frontendType === currentObject.value.type)
  return option?.value || 'Gable'
})

const getRoofPosition = (position: 'positionX' | 'positionZ') => {
  if (!currentProject.value || !selectedObject.value || selectedObject.value.type !== 'roof') return 0
  
  const roof = currentProject.value.roof
  // Use roof-specific position if available, otherwise default to 0
  const cmValue = roof[position] || 0
  return Math.round(convertToDisplay(cmValue))
}

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
</script>

<style scoped>
.side-panel {
  position: fixed;
  bottom: 20px; /* Bottom positioning */
  left: 20px; /* Left positioning - same as menu */
  width: 320px;
  max-height: calc(100vh - 120px); /* Leave space for bottom positioning */
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  z-index: 100; /* Standardized low z-index */
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px 12px 0 0;
}

.panel-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(148, 163, 184, 0.2);
  color: #374151;
}

.property-section {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.exceptional-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
}

.exceptional-toggle input[type="checkbox"] {
  width: 14px;
  height: 14px;
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
  min-width: 70px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.slider {
  flex: 1;
  min-width: 0;
  accent-color: #3b82f6;
}

.number-input {
  width: 60px;
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
}

.number-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
}

.unit {
  min-width: 25px;
  font-size: 11px;
  color: #9ca3af;
  text-align: left;
}

.orientation-select,
.roof-type-select {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.8);
}

.orientation-select:focus,
.roof-type-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
}

.orientation-info {
  margin-top: 6px;
  text-align: center;
}

.orientation-info small {
  color: #6b7280;
  font-size: 11px;
  font-style: italic;
}

.color-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-btn {
  width: 28px;
  height: 28px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-btn:hover {
  transform: scale(1.1);
  border-color: #9ca3af;
}

.color-btn.active {
  border-color: #3b82f6;
  border-width: 3px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-btn {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: white;
}

.delete-btn {
  color: #dc2626;
  border-color: #dc2626;
}

.delete-btn:hover {
  background: #dc2626;
  color: white;
}

.duplicate-btn {
  color: #7c3aed;
  border-color: #7c3aed;
}

.duplicate-btn:hover {
  background: #7c3aed;
  color: white;
}

.transform-btn {
  color: #2563eb;
  border-color: #2563eb;
}

.transform-btn:hover {
  background: #2563eb;
  color: white;
}

.add-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.add-btn {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: center;
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: white;
}

.window-btn:hover {
  border-color: #0ea5e9;
  color: #0ea5e9;
}

.door-btn:hover {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.add-info {
  text-align: center;
}

.add-info small {
  color: #6b7280;
  font-size: 11px;
  line-height: 1.3;
}

.tool-context-panel,
.default-panel {
  padding: 0;
}

.tool-instructions {
  padding: 20px;
}

.tool-instructions p {
  margin: 0;
  color: #4b5563;
  line-height: 1.5;
}

.welcome-content {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.welcome-section:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.welcome-section h4 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.welcome-section p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
}

/* Category tools panel styles */
.category-tools-panel {
  padding: 0;
}

.tools-grid {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-height: 80px;
  backdrop-filter: blur(10px);
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  font-size: 24px;
  line-height: 1;
}

.tool-name {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  line-height: 1.2;
}

.panel-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(248, 250, 252, 0.8);
  text-align: center;
}

.instruction-text {
  color: #64748b;
  font-size: 11px;
  font-style: italic;
}

/* Specific tool button styling */
.tool-btn.add-floor:hover {
  border-color: rgba(34, 197, 94, 0.4);
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.2);
}

.tool-btn.add-window:hover {
  border-color: rgba(14, 165, 233, 0.4);
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.2);
}

.tool-btn.add-door:hover {
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.2);
}

.tool-btn.edit-walls:hover {
  border-color: rgba(245, 158, 11, 0.4);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
}

.tool-btn.room-config:hover {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
}

.tool-btn.clear-house:hover {
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .side-panel {
    bottom: 15px; /* Adjust for smaller screens */
    left: 15px; /* Align with smaller menu margins */
    width: 300px;
    max-height: calc(100vh - 100px); /* Leave space for menu button above */
  }
  
  .property-group {
    gap: 6px;
  }
  
  .number-input {
    width: 50px;
  }
  
  .action-buttons {
    gap: 6px;
  }
  
  .action-btn {
    min-width: 100px;
    padding: 6px 8px;
    font-size: 11px;
  }
  
  .tools-grid {
    padding: 12px;
    gap: 10px;
  }
  
  .tool-btn {
    padding: 12px 8px;
    min-height: 70px;
  }
  
  .tool-icon {
    font-size: 20px;
  }
  
  .tool-name {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .side-panel {
    width: calc(100vw - 20px); /* Full width minus margins */
    left: 10px; /* Centered on small screens */
    bottom: 10px;
    max-height: calc(100vh - 80px); /* Account for top menu space */
  }
}
</style>