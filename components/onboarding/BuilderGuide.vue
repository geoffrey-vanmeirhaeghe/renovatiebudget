<template>
  <div v-if="isVisible" class="builder-guide-overlay">
    <!-- Progress Header -->
    <div class="guide-header">
      <div class="guide-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <span class="progress-text">Step {{ currentStep }} of {{ totalSteps }}</span>
      </div>
      <button @click="skipGuide" class="skip-button">Skip Guide</button>
    </div>

    <!-- Step Content -->
    <div class="guide-content">
      <Transition name="slide" mode="out-in">
        <div :key="currentStep" class="step-card">
          <!-- Step 1: Welcome -->
          <div v-if="currentStep === 1" class="guide-step">
            <div class="step-icon">👋</div>
            <h2>Welcome to the 3D House Builder!</h2>
            <p>Let's design your house step by step. We'll start with the basics and you can always refine it later.</p>
            
            <div class="welcome-info">
              <h3>What we'll build together:</h3>
              <ul class="feature-list">
                <li>✅ Set your house dimensions</li>
                <li>✅ Choose number of floors</li>
                <li>✅ Add windows and doors</li>
                <li>✅ Select your roof style</li>
              </ul>
              <p class="guide-note">Don't worry about getting everything perfect - you can adjust anything after we're done!</p>
            </div>
          </div>

          <!-- Step 2: House Size -->
          <div v-if="currentStep === 2" class="guide-step">
            <div class="step-icon">📏</div>
            <h2>House Dimensions</h2>
            <p>Set the size of your house. The property will automatically adjust around it.</p>
            
            <div class="house-size-visual">
              <div class="size-preview">
                <div class="house-footprint" :style="{
                  width: `${Math.min(houseConfig.houseWidth / 10, 200)}px`,
                  height: `${Math.min(houseConfig.houseDepth / 10, 200)}px`
                }">
                  <span class="size-label">{{ (houseConfig.houseWidth / 100).toFixed(1) }}m × {{ (houseConfig.houseDepth / 100).toFixed(1) }}m</span>
                </div>
              </div>
            </div>
            
            <div class="input-group">
              <div class="input-field">
                <label>House Width (meters)</label>
                <input 
                  v-model.number="houseWidthMeters"
                  type="number"
                  min="6"
                  max="20"
                  step="0.5"
                  placeholder="11.5"
                />
              </div>
              <div class="input-field">
                <label>House Depth (meters)</label>
                <input 
                  v-model.number="houseDepthMeters"
                  type="number"
                  min="6"
                  max="20"
                  step="0.5"
                  placeholder="10.5"
                />
              </div>
            </div>
            
            <div class="quick-sizes">
              <button @click="setHouseSize(8, 10)" class="size-preset">Small (8×10m)</button>
              <button @click="setHouseSize(10, 12)" class="size-preset">Medium (10×12m)</button>
              <button @click="setHouseSize(12, 14)" class="size-preset">Large (12×14m)</button>
            </div>
            
            <div class="step-tip">
              💡 <strong>Tip:</strong> Most Belgian houses are 8-12 meters wide and 10-14 meters deep
            </div>
          </div>

          <!-- Step 3: Floor Count -->
          <div v-if="currentStep === 3" class="guide-step">
            <div class="step-icon">🏢</div>
            <h2>How Many Floors?</h2>
            <p>Choose the number of floors for your house. You can adjust individual floor heights later.</p>
            
            <div class="floor-options">
              <button 
                v-for="count in [1, 2, 3]" 
                :key="count"
                @click="houseConfig.floorCount = count"
                class="floor-option"
                :class="{ active: houseConfig.floorCount === count }"
              >
                <span class="floor-icon">{{ count === 1 ? '🏠' : count === 2 ? '🏘️' : '🏗️' }}</span>
                <span class="floor-label">{{ count }} Floor{{ count > 1 ? 's' : '' }}</span>
                <span class="floor-desc">{{ getFloorDescription(count) }}</span>
              </button>
            </div>

            <div class="step-tip">
              💡 Each floor will be 2.5 meters high. You can adjust individual heights later.
            </div>
          </div>

          <!-- Step 4: Windows & Doors -->
          <div v-if="currentStep === 4" class="guide-step">
            <div class="step-icon">🚪</div>
            <h2>Add Windows & Doors</h2>
            <p>How many windows and doors would you like on each floor?</p>
            
            <div class="openings-config">
              <div v-for="floor in houseConfig.floorCount" :key="floor" class="floor-openings">
                <h3>{{ getFloorName(floor - 1) }}</h3>
                
                <div class="opening-row">
                  <label>Windows:</label>
                  <div class="count-selector">
                    <button @click="decrementWindows(floor - 1)" :disabled="houseConfig.windowsPerFloor[floor - 1] <= 0">-</button>
                    <span>{{ houseConfig.windowsPerFloor[floor - 1] || 0 }}</span>
                    <button @click="incrementWindows(floor - 1)">+</button>
                  </div>
                </div>
                
                <div class="opening-row">
                  <label>Doors:</label>
                  <div class="count-selector">
                    <button @click="decrementDoors(floor - 1)" :disabled="houseConfig.doorsPerFloor[floor - 1] <= 0">-</button>
                    <span>{{ houseConfig.doorsPerFloor[floor - 1] || 0 }}</span>
                    <button @click="incrementDoors(floor - 1)">+</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="step-tip">
              💡 <strong>Tip:</strong> Ground floor usually has at least 1 door. Add 2-4 windows per floor for good lighting.
            </div>
          </div>

          <!-- Step 5: Roof Type -->
          <div v-if="currentStep === 5" class="guide-step">
            <div class="step-icon">🏠</div>
            <h2>Choose Your Roof</h2>
            <p>Select the roof style that matches your architectural vision.</p>
            
            <div class="roof-options">
              <button 
                v-for="roof in roofOptions" 
                :key="roof.id"
                @click="houseConfig.roofType = roof.id"
                class="roof-option"
                :class="{ active: houseConfig.roofType === roof.id }"
              >
                <div class="roof-visual">{{ roof.icon }}</div>
                <span class="roof-name">{{ roof.name }}</span>
                <span class="roof-desc">{{ roof.description }}</span>
              </button>
            </div>

            <div v-if="houseConfig.roofType" class="roof-config">
              <label>Roof Height (meters)</label>
              <input 
                v-model.number="roofHeightMeters"
                type="number"
                min="1"
                max="5"
                step="0.5"
                placeholder="2.5"
              />
            </div>
          </div>

          <!-- Step 6: Review & Build -->
          <div v-if="currentStep === 6" class="guide-step">
            <div class="step-icon">✨</div>
            <h2>Ready to Build!</h2>
            <p>Here's what we'll create for you:</p>
            
            <div class="build-summary">
              <div class="summary-item">
                <strong>House Size:</strong> {{ (houseConfig.houseWidth / 100).toFixed(1) }}m × {{ (houseConfig.houseDepth / 100).toFixed(1) }}m
              </div>
              <div class="summary-item">
                <strong>Floors:</strong> {{ houseConfig.floorCount }} floor{{ houseConfig.floorCount > 1 ? 's' : '' }}
              </div>
              <div class="summary-item">
                <strong>Windows:</strong> {{ totalWindows }} total
              </div>
              <div class="summary-item">
                <strong>Doors:</strong> {{ totalDoors }} total
              </div>
              <div class="summary-item">
                <strong>Roof:</strong> {{ getRoofName(houseConfig.roofType) }}
              </div>
            </div>

            <div class="build-tip">
              🎉 <strong>Great!</strong> After we build your house, you can use all the builder tools to customize it further.
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Navigation -->
    <div class="guide-navigation">
      <button 
        v-if="currentStep > 1"
        @click="previousStep"
        class="nav-btn nav-btn-secondary"
      >
        ← Back
      </button>
      
      <div class="nav-spacer"></div>
      
      <button 
        v-if="currentStep < totalSteps"
        @click="nextStep"
        :disabled="!canProceedToNext"
        class="nav-btn nav-btn-primary"
      >
        Next →
      </button>
      
      <button 
        v-if="currentStep === totalSteps"
        @click="completeGuide"
        class="nav-btn nav-btn-success"
      >
        Build My House! 🏗️
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
  'house-completed': [houseConfig: any]
  'guide-cancelled': []
}>()

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Guide state
const currentStep = ref(1)
const totalSteps = 6

// House configuration
const houseConfig = reactive({
  propertyWidth: 2000,
  propertyDepth: 2000,
  houseWidth: 1150,
  houseDepth: 1050,
  floorCount: 1,
  floorHeights: [250] as number[],
  roofType: 'gable',
  roofHeight: 250,
  windowsPerFloor: [2] as number[],
  doorsPerFloor: [1] as number[]
})

// Computed values for meters conversion
const houseWidthMeters = computed({
  get: () => houseConfig.houseWidth / 100,
  set: (val) => houseConfig.houseWidth = val * 100
})

const houseDepthMeters = computed({
  get: () => houseConfig.houseDepth / 100,
  set: (val) => houseConfig.houseDepth = val * 100
})

const roofHeightMeters = computed({
  get: () => houseConfig.roofHeight / 100,
  set: (val) => houseConfig.roofHeight = val * 100
})

const totalWindows = computed(() => 
  houseConfig.windowsPerFloor.reduce((sum, count) => sum + count, 0)
)

const totalDoors = computed(() => 
  houseConfig.doorsPerFloor.reduce((sum, count) => sum + count, 0)
)

// Computed properties
const progressPercentage = computed(() => (currentStep.value / totalSteps) * 100)

const canProceedToNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return true // Welcome step
    case 2:
      return houseConfig.houseWidth >= 600 && houseConfig.houseDepth >= 600
    case 3:
      return houseConfig.floorCount > 0
    case 4:
      return totalDoors.value > 0 // At least one door
    case 5:
      return houseConfig.roofType !== ''
    default:
      return true
  }
})

// Roof options
const roofOptions = [
  {
    id: 'gable',
    name: 'Gable Roof',
    icon: '⛰️',
    description: 'Classic triangular design'
  },
  {
    id: 'hip',
    name: 'Hip Roof',
    icon: '🏠',
    description: 'Slopes on all four sides'
  },
  {
    id: 'flat',
    name: 'Flat Roof',
    icon: '⬜',
    description: 'Modern minimalist style'
  },
  {
    id: 'shed',
    name: 'Shed Roof',
    icon: '📐',
    description: 'Single slope design'
  }
]

// Helper functions
const getFloorDescription = (count: number) => {
  const descriptions = ['Single story home', 'Two-level house', 'Multi-story building']
  return descriptions[count - 1] || 'Custom configuration'
}

const getFloorName = (index: number) => {
  const names = ['Ground Floor', 'First Floor', 'Second Floor']
  return names[index] || `Floor ${index + 1}`
}

const getRoofName = (roofId: string) => {
  const roof = roofOptions.find(r => r.id === roofId)
  return roof?.name || 'Custom roof'
}

// Helper functions for sizing
const setHouseSize = (width: number, depth: number) => {
  houseConfig.houseWidth = width * 100
  houseConfig.houseDepth = depth * 100
}

// Window and door management
const incrementWindows = (floorIndex: number) => {
  if (!houseConfig.windowsPerFloor[floorIndex]) {
    houseConfig.windowsPerFloor[floorIndex] = 0
  }
  houseConfig.windowsPerFloor[floorIndex]++
}

const decrementWindows = (floorIndex: number) => {
  if (houseConfig.windowsPerFloor[floorIndex] > 0) {
    houseConfig.windowsPerFloor[floorIndex]--
  }
}

const incrementDoors = (floorIndex: number) => {
  if (!houseConfig.doorsPerFloor[floorIndex]) {
    houseConfig.doorsPerFloor[floorIndex] = 0
  }
  houseConfig.doorsPerFloor[floorIndex]++
}

const decrementDoors = (floorIndex: number) => {
  if (houseConfig.doorsPerFloor[floorIndex] > 0) {
    houseConfig.doorsPerFloor[floorIndex]--
  }
}

// Navigation
const nextStep = () => {
  if (canProceedToNext.value && currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const completeGuide = () => {
  // Transform the configuration to project format
  const projectData = {
    houseWidth: houseConfig.houseWidth,
    houseDepth: houseConfig.houseDepth,
    propertyWidth: houseConfig.propertyWidth,
    propertyDepth: houseConfig.propertyDepth,
    floors: houseConfig.floorCount,
    floorHeights: houseConfig.floorHeights,
    windowsPerFloor: houseConfig.windowsPerFloor,
    doorsPerFloor: houseConfig.doorsPerFloor,
    roofType: houseConfig.roofType,
    roofHeight: houseConfig.roofHeight
  }
  
  emit('house-completed', projectData)
  isVisible.value = false
}

const skipGuide = () => {
  emit('guide-cancelled')
  isVisible.value = false
}

// Initialize arrays when floor count changes
watch(() => houseConfig.floorCount, (newCount) => {
  // Resize arrays
  houseConfig.floorHeights = Array(newCount).fill(250)
  
  // Initialize windows and doors arrays
  const currentWindows = [...houseConfig.windowsPerFloor]
  const currentDoors = [...houseConfig.doorsPerFloor]
  
  houseConfig.windowsPerFloor = Array(newCount).fill(0).map((_, i) => currentWindows[i] || 2)
  houseConfig.doorsPerFloor = Array(newCount).fill(0).map((_, i) => i === 0 ? (currentDoors[i] || 1) : (currentDoors[i] || 0))
})
</script>

<style scoped>
.builder-guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.guide-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.progress-bar {
  flex: 1;
  max-width: 400px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.progress-text {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 100px;
}

.skip-button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.skip-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.guide-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-card {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.guide-step {
  text-align: center;
}

.step-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.guide-step h2 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.75rem;
}

.guide-step p {
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Welcome screen */
.welcome-info {
  text-align: left;
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.welcome-info h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.1rem;
}

.feature-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.feature-list li {
  padding: 0.5rem 0;
  color: #4b5563;
}

.guide-note {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-style: italic;
}

/* House size visualization */
.house-size-visual {
  margin: 2rem 0;
}

.size-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 220px;
}

.house-footprint {
  position: relative;
  background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
  border: 2px solid #8b5cf6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.size-label {
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.quick-sizes {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.size-preset {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.size-preset:hover {
  background: #e5e7eb;
  border-color: #8b5cf6;
}

/* Input fields */
.input-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.input-field {
  text-align: left;
}

.input-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.input-field input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-field input:focus {
  outline: none;
  border-color: #10b981;
}

/* Floor options */
.floor-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.floor-option {
  flex: 1;
  max-width: 150px;
  padding: 1.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.floor-option:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

.floor-option.active {
  border-color: #10b981;
  background: #f0fdf4;
}

.floor-icon {
  font-size: 1.5rem;
}

.floor-label {
  font-weight: 600;
  color: #1f2937;
}

.floor-desc {
  font-size: 0.8rem;
  color: #6b7280;
}

/* Openings configuration */
.openings-config {
  text-align: left;
  max-width: 400px;
  margin: 0 auto 2rem;
}

.floor-openings {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.floor-openings h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.1rem;
}

.opening-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.opening-row:last-child {
  margin-bottom: 0;
}

.opening-row label {
  font-weight: 500;
  color: #4b5563;
}

.count-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.25rem;
}

.count-selector button {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  color: #374151;
  transition: all 0.2s;
}

.count-selector button:hover:not(:disabled) {
  background: #e5e7eb;
}

.count-selector button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.count-selector span {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: #1f2937;
}

/* Roof options */
.roof-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.roof-option {
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.roof-option:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

.roof-option.active {
  border-color: #10b981;
  background: #f0fdf4;
}

.roof-visual {
  font-size: 2rem;
}

.roof-name {
  font-weight: 600;
  color: #1f2937;
}

.roof-desc {
  font-size: 0.8rem;
  color: #6b7280;
}

.roof-config {
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.roof-config label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.roof-config input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

/* Summary */
.build-summary {
  background: #f0fdf4;
  border: 1px solid #10b981;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.summary-item {
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.summary-item:last-child {
  margin-bottom: 0;
}

/* Tips */
.step-tip,
.build-tip {
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.9rem;
  color: #1e40af;
}

.build-tip {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #92400e;
}

/* Navigation */
.guide-navigation {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.nav-spacer {
  flex: 1;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn-primary {
  background: #3b82f6;
  color: white;
}

.nav-btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.nav-btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.nav-btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.nav-btn-success {
  background: #10b981;
  color: white;
}

.nav-btn-success:hover {
  background: #059669;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Responsive */
@media (max-width: 768px) {
  .builder-guide-overlay {
    padding: 1rem;
  }
  
  .step-card {
    padding: 2rem;
  }
  
  .input-group,
  .roof-options {
    grid-template-columns: 1fr;
  }
  
  .floor-options {
    flex-direction: column;
  }
  
  .quick-sizes {
    flex-direction: column;
  }
  
  .size-preset {
    width: 100%;
  }
}
</style>