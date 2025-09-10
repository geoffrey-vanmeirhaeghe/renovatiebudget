<template>
  <div v-if="isVisible" class="guide-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="progress-indicator">
        <span class="step-counter">{{ currentStep }}/{{ totalSteps }}</span>
        <div class="progress-dots">
          <div 
            v-for="step in totalSteps" 
            :key="step"
            class="progress-dot"
            :class="{ active: step <= currentStep }"
          ></div>
        </div>
      </div>
      <button @click="skipGuide" class="close-btn" title="Skip guide">×</button>
    </div>

    <!-- Content -->
    <div class="panel-content">
      <Transition name="fade" mode="out-in">
        <div :key="currentStep" class="step-content">
          
          <!-- Step 1: Welcome -->
          <div v-if="currentStep === 1" class="step">
            <div class="step-icon">👋</div>
            <h3>Welcome to the Builder!</h3>
            <p>Let's design your house step by step.</p>
            <ul class="feature-preview">
              <li>✅ Set dimensions</li>
              <li>✅ Add floors</li>
              <li>✅ Place windows & doors</li>
              <li>✅ Choose roof</li>
            </ul>
          </div>

          <!-- Step 2: House Size -->
          <div v-if="currentStep === 2" class="step">
            <div class="step-icon">📏</div>
            <h3>House Size</h3>
            <p>Set your house dimensions:</p>
            
            <div class="compact-inputs">
              <div class="input-row">
                <label>Width (m)</label>
                <input 
                  v-model.number="houseConfig.widthMeters"
                  type="number"
                  min="6"
                  max="20"
                  step="0.5"
                />
              </div>
              <div class="input-row">
                <label>Depth (m)</label>
                <input 
                  v-model.number="houseConfig.depthMeters"
                  type="number"
                  min="6"
                  max="20"
                  step="0.5"
                />
              </div>
            </div>
            
            <div class="quick-presets">
              <button @click="setSize(8, 10)" class="preset-btn">Small</button>
              <button @click="setSize(10, 12)" class="preset-btn">Medium</button>
              <button @click="setSize(12, 14)" class="preset-btn">Large</button>
            </div>
            
            <div class="size-display">
              {{ houseConfig.widthMeters }}m × {{ houseConfig.depthMeters }}m
            </div>
          </div>

          <!-- Step 3: Floors -->
          <div v-if="currentStep === 3" class="step">
            <div class="step-icon">🏢</div>
            <h3>Number of Floors</h3>
            <p>How many floors?</p>
            
            <div class="floor-buttons">
              <button 
                v-for="count in [1, 2, 3]" 
                :key="count"
                @click="houseConfig.floors = count"
                class="floor-btn"
                :class="{ active: houseConfig.floors === count }"
              >
                {{ count }}
              </button>
            </div>
            
            <div class="floor-info">
              {{ houseConfig.floors }} floor{{ houseConfig.floors > 1 ? 's' : '' }}
              ({{ (houseConfig.floors * 2.5).toFixed(1) }}m high)
            </div>
          </div>

          <!-- Step 4: Windows & Doors -->
          <div v-if="currentStep === 4" class="step">
            <div class="step-icon">🚪</div>
            <h3>Windows & Doors</h3>
            <p>Add windows and doors to your house:</p>
            
            <div class="openings-config">
              <div v-for="floor in houseConfig.floors" :key="floor" class="floor-config">
                <h4>{{ getFloorName(floor - 1) }}</h4>
                
                <!-- Windows Section -->
                <div class="opening-section">
                  <div class="section-header">
                    <span class="section-title">🪟 Windows</span>
                    <button @click="addWindow(floor - 1)" class="add-btn">+</button>
                  </div>
                  
                  <div class="openings-list">
                    <div 
                      v-for="window in getWindowsForFloor(floor - 1)" 
                      :key="window.id"
                      class="opening-item"
                      :class="{ expanded: selectedItem === window.id }"
                      @click="toggleItem(window.id)"
                    >
                      <div class="item-header">
                        <span class="item-summary">Window {{ window.width }}×{{ window.height }} ({{ window.orientation }})</span>
                        <button @click.stop="removeWindow(window.id)" class="remove-btn" title="Remove">×</button>
                      </div>
                      
                      <div v-if="selectedItem === window.id" class="item-details">
                        <div class="inline-controls">
                          <div class="control-group">
                            <span class="control-label">Size:</span>
                            <input v-model.number="window.width" type="number" min="60" max="300" step="10" class="small-input" @click.stop>
                            <span class="separator">×</span>
                            <input v-model.number="window.height" type="number" min="80" max="250" step="10" class="small-input" @click.stop>
                          </div>
                          <div class="control-group">
                            <span class="control-label">Position:</span>
                            <select v-model="window.orientation" class="small-select" @click.stop>
                              <option v-for="opt in orientationOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                              </option>
                            </select>
                            <input v-model.number="window.x" type="number" min="-500" max="500" step="10" class="small-input" @click.stop>
                            <input v-model.number="window.y" type="number" min="0" max="200" step="10" class="small-input" @click.stop>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div v-if="getWindowsForFloor(floor - 1).length === 0" class="empty-state">
                      Click + to add window
                    </div>
                  </div>
                </div>
                
                <!-- Doors Section -->
                <div class="opening-section">
                  <div class="section-header">
                    <span class="section-title">🚪 Doors</span>
                    <button @click="addDoor(floor - 1)" class="add-btn">+</button>
                  </div>
                  
                  <div class="openings-list">
                    <div 
                      v-for="door in getDoorsForFloor(floor - 1)" 
                      :key="door.id"
                      class="opening-item"
                      :class="{ expanded: selectedItem === door.id }"
                      @click="toggleItem(door.id)"
                    >
                      <div class="item-header">
                        <span class="item-summary">Door {{ door.width }}×{{ door.height }} ({{ door.orientation }})</span>
                        <button @click.stop="removeDoor(door.id)" class="remove-btn" title="Remove">×</button>
                      </div>
                      
                      <div v-if="selectedItem === door.id" class="item-details">
                        <div class="inline-controls">
                          <div class="control-group">
                            <span class="control-label">Size:</span>
                            <input v-model.number="door.width" type="number" min="70" max="150" step="10" class="small-input" @click.stop>
                            <span class="separator">×</span>
                            <input v-model.number="door.height" type="number" min="180" max="250" step="10" class="small-input" @click.stop>
                          </div>
                          <div class="control-group">
                            <span class="control-label">Position:</span>
                            <select v-model="door.orientation" class="small-select" @click.stop>
                              <option v-for="opt in orientationOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                              </option>
                            </select>
                            <input v-model.number="door.x" type="number" min="-500" max="500" step="10" class="small-input" @click.stop>
                            <input v-model.number="door.y" type="number" min="0" max="50" step="10" class="small-input" @click.stop>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div v-if="getDoorsForFloor(floor - 1).length === 0" class="empty-state">
                      Click + to add door
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: Roof -->
          <div v-if="currentStep === 5" class="step">
            <div class="step-icon">🏠</div>
            <h3>Roof Style</h3>
            <p>Choose your roof:</p>
            
            <div class="roof-options">
              <button 
                v-for="roof in roofOptions" 
                :key="roof.id"
                @click="houseConfig.roofType = roof.id"
                class="roof-btn"
                :class="{ active: houseConfig.roofType === roof.id }"
                :title="roof.description"
              >
                <span class="roof-icon">{{ roof.icon }}</span>
                <span class="roof-name">{{ roof.name }}</span>
              </button>
            </div>
            
            <div class="roof-height">
              <label>Height (m)</label>
              <input 
                v-model.number="houseConfig.roofHeightMeters"
                type="number"
                min="1"
                max="5"
                step="0.5"
              />
            </div>
          </div>

          <!-- Step 6: Complete -->
          <div v-if="currentStep === 6" class="step">
            <div class="step-icon">✨</div>
            <h3>Ready to Build!</h3>
            <p>Your house design:</p>
            
            <div class="summary">
              <div class="summary-item">
                <strong>{{ houseConfig.widthMeters }}m × {{ houseConfig.depthMeters }}m</strong>
              </div>
              <div class="summary-item">
                {{ houseConfig.floors }} floor{{ houseConfig.floors > 1 ? 's' : '' }}
              </div>
              <div class="summary-item">
                {{ totalWindows }} windows, {{ totalDoors }} doors
              </div>
              <div class="summary-item">
                {{ getRoofName() }} roof
              </div>
            </div>
            
            <button @click="completeGuide" class="complete-btn">
              Build My House! 🏗️
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Navigation -->
    <div class="panel-footer">
      <button 
        v-if="currentStep > 1"
        @click="previousStep"
        class="nav-btn secondary"
      >
        ← Back
      </button>
      
      <div class="nav-spacer"></div>
      
      <button 
        v-if="currentStep < totalSteps"
        @click="nextStep"
        :disabled="!canProceed"
        class="nav-btn primary"
      >
        Next →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'house-completed': [config: any]
  'guide-cancelled': []
  'update-project': [projectData: any]
}>()

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Guide state
const currentStep = ref(1)
const totalSteps = 6
const selectedItem = ref<string | null>(null)

// House configuration
const houseConfig = reactive({
  widthMeters: 11.5,
  depthMeters: 10.5,
  floors: 1,
  windows: [] as Array<{id: string, floor: number, width: number, height: number, orientation: string, x: number, y: number}>,
  doors: [] as Array<{id: string, floor: number, width: number, height: number, orientation: string, x: number, y: number}>,
  roofType: 'gable',
  roofHeightMeters: 2.5
})

// Roof options
const roofOptions = [
  { id: 'gable', name: 'Gable', icon: '⛰️', description: 'Classic triangular' },
  { id: 'hip', name: 'Hip', icon: '🏠', description: 'Slopes on all sides' },
  { id: 'flat', name: 'Flat', icon: '⬜', description: 'Modern minimalist' },
  { id: 'shed', name: 'Shed', icon: '📐', description: 'Single slope' }
]

// Computed values
const totalWindows = computed(() => houseConfig.windows.length)
const totalDoors = computed(() => houseConfig.doors.length)

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1: return true
    case 2: return houseConfig.widthMeters >= 6 && houseConfig.depthMeters >= 6
    case 3: return houseConfig.floors > 0
    case 4: return true // Allow proceeding without doors for now
    case 5: return houseConfig.roofType !== ''
    default: return true
  }
})

// Helper functions
const setSize = (width: number, depth: number) => {
  houseConfig.widthMeters = width
  houseConfig.depthMeters = depth
}

const getFloorName = (index: number) => {
  const names = ['Ground Floor', 'First Floor', 'Second Floor']
  return names[index] || `Floor ${index + 1}`
}

// Window management
const addWindow = (floor: number) => {
  const newWindow = {
    id: `window-${Date.now()}`,
    floor,
    width: 120,
    height: 140,
    orientation: 'front',
    x: 0,
    y: 50
  }
  houseConfig.windows.push(newWindow)
  // Auto-expand the new window
  selectedItem.value = newWindow.id
}

const removeWindow = (windowId: string) => {
  const index = houseConfig.windows.findIndex(w => w.id === windowId)
  if (index > -1) {
    houseConfig.windows.splice(index, 1)
  }
}

// Door management
const addDoor = (floor: number) => {
  const newDoor = {
    id: `door-${Date.now()}`,
    floor,
    width: 90,
    height: 210,
    orientation: 'front',
    x: 0,
    y: 0
  }
  houseConfig.doors.push(newDoor)
  // Auto-expand the new door
  selectedItem.value = newDoor.id
}

const removeDoor = (doorId: string) => {
  const index = houseConfig.doors.findIndex(d => d.id === doorId)
  if (index > -1) {
    houseConfig.doors.splice(index, 1)
  }
}

// Helper functions
const getWindowsForFloor = (floor: number) => houseConfig.windows.filter(w => w.floor === floor)
const getDoorsForFloor = (floor: number) => houseConfig.doors.filter(d => d.floor === floor)

const orientationOptions = [
  { value: 'front', label: 'Front' },
  { value: 'left', label: 'Left' },
  { value: 'back', label: 'Back' },
  { value: 'right', label: 'Right' }
]

// Item selection for expand/collapse
const toggleItem = (itemId: string) => {
  selectedItem.value = selectedItem.value === itemId ? null : itemId
}

const getRoofName = () => {
  const roof = roofOptions.find(r => r.id === houseConfig.roofType)
  return roof?.name || 'Custom'
}

// Navigation
const nextStep = () => {
  if (canProceed.value && currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const completeGuide = () => {
  const projectData = {
    houseWidth: houseConfig.widthMeters * 100,
    houseDepth: houseConfig.depthMeters * 100,
    floors: houseConfig.floors,
    windowsPerFloor: houseConfig.windowsPerFloor,
    doorsPerFloor: houseConfig.doorsPerFloor,
    roofType: houseConfig.roofType,
    roofHeight: houseConfig.roofHeightMeters * 100
  }
  
  emit('house-completed', projectData)
  isVisible.value = false
}

const skipGuide = () => {
  emit('guide-cancelled')
  isVisible.value = false
}

// Standard template project for onboarding
const createStandardProject = () => {
  return {
    name: 'My New House',
    description: 'House design template for onboarding',
    generalAttributes: {
      propertySize: {
        width: houseConfig.widthMeters * 100 + 200,
        depth: houseConfig.depthMeters * 100 + 200,
        area: (houseConfig.widthMeters + 2) * (houseConfig.depthMeters + 2)
      },
      floorSize: {
        width: houseConfig.widthMeters * 100,
        depth: houseConfig.depthMeters * 100,
        area: houseConfig.widthMeters * houseConfig.depthMeters
      },
      region: 'flanders'
    },
    floors: generateFloorsFromConfig(),
    roof: houseConfig.roofType ? generateRoofFromConfig() : null
  }
}

// Generate floors based on current config
const generateFloorsFromConfig = () => {
  const floors: any = {}
  
  // Always create at least one floor for foundation
  const floorCount = Math.max(1, houseConfig.floors)
  
  for (let i = 0; i < floorCount; i++) {
    const floorId = i.toString()
    
    // Get windows for this floor
    const floorWindows = houseConfig.windows.filter(w => w.floor === i)
    const windows: any = {}
    floorWindows.forEach((window, index) => {
      windows[(index + 1).toString()] = {
        width: window.width,
        height: window.height,
        position: {
          orientation: window.orientation,
          x: window.x,
          y: window.y
        }
      }
    })
    
    // Get doors for this floor
    const floorDoors = houseConfig.doors.filter(d => d.floor === i)
    const doors: any = {}
    floorDoors.forEach((door, index) => {
      doors[(index + 1).toString()] = {
        width: door.width,
        height: door.height,
        position: {
          orientation: door.orientation,
          x: door.x,
          y: door.y
        }
      }
    })
    
    floors[floorId] = {
      storey: i,
      height: 250,
      heightPosition: i * 250,
      color: '#f0f0f0',
      windows,
      doors
    }
  }
  
  return floors
}

// Generate roof based on current config
const generateRoofFromConfig = () => {
  return {
    type: houseConfig.roofType,
    width: houseConfig.widthMeters * 100 - 50,
    depth: houseConfig.depthMeters * 100 - 50,
    height: houseConfig.roofHeightMeters * 100,
    heightPosition: Math.max(1, houseConfig.floors) * 250
  }
}

// Update project in real-time
const updateLiveProject = () => {
  const liveProject = createStandardProject()
  emit('update-project', liveProject)
}

// Watch for changes and update project live
watch([() => houseConfig.widthMeters, () => houseConfig.depthMeters], updateLiveProject)
watch(() => houseConfig.floors, updateLiveProject)
watch(() => houseConfig.roofType, updateLiveProject)
watch(() => houseConfig.roofHeightMeters, updateLiveProject)
watch(() => houseConfig.windows, updateLiveProject, { deep: true })
watch(() => houseConfig.doors, updateLiveProject, { deep: true })

// Clean up windows/doors when floors change
watch(() => houseConfig.floors, (newCount, oldCount) => {
  if (newCount < oldCount) {
    // Remove windows and doors from floors that no longer exist
    houseConfig.windows = houseConfig.windows.filter(w => w.floor < newCount)
    houseConfig.doors = houseConfig.doors.filter(d => d.floor < newCount)
  }
})

// Load initial project immediately when component is visible
watch(isVisible, (visible) => {
  if (visible) {
    // Load the initial project template immediately
    updateLiveProject()
  }
}, { immediate: true })
</script>

<style scoped>
.guide-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 500;
  border: 1px solid #e5e7eb;
}

.panel-header {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.step-counter {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.progress-dots {
  display: flex;
  gap: 4px;
}

.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e5e7eb;
  transition: all 0.2s;
}

.progress-dot.active {
  background: #3b82f6;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #6b7280;
}

.panel-content {
  padding: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

.step {
  text-align: center;
}

.step-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.step h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.125rem;
}

.step p {
  color: #6b7280;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Welcome step */
.feature-preview {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.feature-preview li {
  padding: 0.25rem 0;
  font-size: 0.875rem;
  color: #4b5563;
}

/* Size step */
.compact-inputs {
  margin-bottom: 1rem;
}

.input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.input-row label {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.input-row input {
  width: 70px;
  padding: 0.375rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  text-align: center;
  font-size: 0.875rem;
}

.quick-presets {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.preset-btn {
  flex: 1;
  padding: 0.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: #f3f4f6;
  border-color: #3b82f6;
}

.size-display {
  padding: 0.5rem;
  background: #f0f9ff;
  border-radius: 6px;
  font-weight: 600;
  color: #1e40af;
  font-size: 0.875rem;
}

/* Floor step */
.floor-buttons {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  justify-content: center;
}

.floor-btn {
  width: 48px;
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.25rem;
  color: #6b7280;
  transition: all 0.2s;
}

.floor-btn:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.floor-btn.active {
  border-color: #3b82f6;
  background: #dbeafe;
  color: #1e40af;
}

.floor-info {
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #4b5563;
}

/* Openings step */
.openings-config {
  text-align: left;
  max-height: 300px;
  overflow-y: auto;
}

.floor-config {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
}

.floor-config h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  color: #1f2937;
}

.opening-section {
  margin-bottom: 1rem;
}

.opening-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.add-btn {
  width: 24px;
  height: 24px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #059669;
  transform: scale(1.1);
}

.openings-list {
  max-height: 120px;
  overflow-y: auto;
  padding: 2px;
}

.opening-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.opening-item:last-child {
  margin-bottom: 0;
}

.opening-item:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.opening-item.expanded {
  border-color: #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
}

.item-summary {
  font-size: 0.75rem;
  color: #374151;
  font-weight: 500;
}

.item-details {
  border-top: 1px solid #f3f4f6;
  padding: 0.5rem;
  background: #fafbfc;
}

.inline-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.control-label {
  font-size: 0.625rem;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
}

.small-input {
  width: 50px;
  padding: 0.25rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.75rem;
  text-align: center;
}

.small-select {
  padding: 0.25rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.75rem;
  background: white;
  min-width: 60px;
}

.separator {
  font-size: 0.625rem;
  color: #9ca3af;
  margin: 0 1px;
}

.remove-btn {
  width: 18px;
  height: 18px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.empty-state {
  text-align: center;
  padding: 0.5rem;
  color: #9ca3af;
  font-size: 0.625rem;
  font-style: italic;
  background: white;
  border: 1px dashed #d1d5db;
  border-radius: 4px;
}

/* Scrollbar styling for openings */
.openings-config::-webkit-scrollbar,
.openings-list::-webkit-scrollbar {
  width: 4px;
}

.openings-config::-webkit-scrollbar-track,
.openings-list::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 2px;
}

.openings-config::-webkit-scrollbar-thumb,
.openings-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.openings-config::-webkit-scrollbar-thumb:hover,
.openings-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Roof step */
.roof-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.roof-btn {
  padding: 0.75rem 0.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.roof-btn:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.roof-btn.active {
  border-color: #3b82f6;
  background: #dbeafe;
}

.roof-icon {
  font-size: 1.25rem;
}

.roof-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
}

.roof-height {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.roof-height label {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.roof-height input {
  width: 70px;
  padding: 0.375rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  text-align: center;
  font-size: 0.875rem;
}

/* Complete step */
.summary {
  text-align: left;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
}

.summary-item {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #166534;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.complete-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.complete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Footer */
.panel-footer {
  padding: 1rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 0.5rem;
}

.nav-spacer {
  flex: 1;
}

.nav-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.875rem;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn.primary {
  background: #3b82f6;
  color: white;
}

.nav-btn.primary:hover:not(:disabled) {
  background: #2563eb;
}

.nav-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.nav-btn.secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .guide-panel {
    right: 10px;
    left: 10px;
    width: auto;
    top: 10px;
  }
  
  .inline-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }
  
  .control-group {
    justify-content: space-between;
  }
  
  .small-input {
    width: 45px;
  }
  
  .small-select {
    min-width: 50px;
  }
  
  .item-summary {
    font-size: 0.625rem;
  }
}
</style>