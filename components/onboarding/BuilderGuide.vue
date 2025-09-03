<template>
  <div v-if="showGuide" class="builder-guide-overlay">
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
          <!-- Step 1: Property Size -->
          <div v-if="currentStep === 1" class="guide-step">
            <div class="step-icon">🏗️</div>
            <h2>Define Your Property</h2>
            <p>Let's start by setting the dimensions of your property. This creates the boundary for your house.</p>
            
            <div class="input-group">
              <div class="input-field">
                <label>Property Width (cm)</label>
                <input 
                  v-model.number="houseConfig.propertyWidth"
                  type="number"
                  min="800"
                  max="5000"
                  step="50"
                  placeholder="1800"
                />
              </div>
              <div class="input-field">
                <label>Property Depth (cm)</label>
                <input 
                  v-model.number="houseConfig.propertyDepth"
                  type="number"
                  min="800"
                  max="5000"
                  step="50"
                  placeholder="1600"
                />
              </div>
            </div>
            
            <div class="step-tip">
              💡 <strong>Tip:</strong> Standard Belgian properties range from 1200-3000cm in width and depth
            </div>
          </div>

          <!-- Step 2: Floor Count -->
          <div v-if="currentStep === 2" class="guide-step">
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

            <div v-if="houseConfig.floorCount > 1" class="floor-height-config">
              <h4>Floor Heights</h4>
              <div 
                v-for="floorIndex in houseConfig.floorCount" 
                :key="floorIndex"
                class="floor-height-input"
              >
                <label>{{ getFloorName(floorIndex - 1) }} Height (cm)</label>
                <input 
                  v-model.number="houseConfig.floorHeights[floorIndex - 1]"
                  type="number"
                  min="200"
                  max="400"
                  step="10"
                  :placeholder="floorIndex === 1 ? '280' : '260'"
                />
              </div>
            </div>
          </div>

          <!-- Step 3: Roof Type -->
          <div v-if="currentStep === 3" class="guide-step">
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
                <span class="roof-icon">{{ roof.icon }}</span>
                <span class="roof-name">{{ roof.name }}</span>
                <span class="roof-desc">{{ roof.description }}</span>
              </button>
            </div>

            <div v-if="houseConfig.roofType" class="roof-config">
              <label>Roof Height (cm)</label>
              <input 
                v-model.number="houseConfig.roofHeight"
                type="number"
                min="100"
                max="500"
                step="10"
                placeholder="200"
              />
            </div>
          </div>

          <!-- Step 4: Basic Openings -->
          <div v-if="currentStep === 4" class="guide-step">
            <div class="step-icon">🚪</div>
            <h2>Add Basic Openings</h2>
            <p>Let's add some basic doors and windows to get started. You can add more later!</p>
            
            <div class="opening-config">
              <div class="opening-type">
                <h4>Front Door</h4>
                <div class="opening-options">
                  <label class="opening-option">
                    <input type="radio" v-model="houseConfig.frontDoorType" value="standard" />
                    <span>Standard Door (80cm)</span>
                  </label>
                  <label class="opening-option">
                    <input type="radio" v-model="houseConfig.frontDoorType" value="wide" />
                    <span>Wide Door (100cm)</span>
                  </label>
                </div>
              </div>

              <div class="opening-type">
                <h4>Windows</h4>
                <div class="window-count">
                  <label>How many windows to start with?</label>
                  <select v-model.number="houseConfig.initialWindows">
                    <option value="2">2 Windows</option>
                    <option value="4">4 Windows</option>
                    <option value="6">6 Windows</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: Review & Build -->
          <div v-if="currentStep === 5" class="guide-step">
            <div class="step-icon">✨</div>
            <h2>Ready to Build!</h2>
            <p>Here's what we'll create for you:</p>
            
            <div class="build-summary">
              <div class="summary-item">
                <strong>Property:</strong> {{ houseConfig.propertyWidth }}cm × {{ houseConfig.propertyDepth }}cm
              </div>
              <div class="summary-item">
                <strong>Floors:</strong> {{ houseConfig.floorCount }} floor{{ houseConfig.floorCount > 1 ? 's' : '' }}
              </div>
              <div class="summary-item">
                <strong>Roof:</strong> {{ getRoofName(houseConfig.roofType) }}
              </div>
              <div class="summary-item">
                <strong>Openings:</strong> {{ houseConfig.frontDoorType }} door + {{ houseConfig.initialWindows }} windows
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
interface Props {
  showGuide: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: [houseConfig: any]
  skip: []
}>()

// Guide state
const currentStep = ref(1)
const totalSteps = 5

// House configuration
const houseConfig = reactive({
  propertyWidth: 1800,
  propertyDepth: 1600,
  floorCount: 1,
  floorHeights: [280, 260, 260] as number[],
  roofType: '',
  roofHeight: 200,
  frontDoorType: 'standard',
  initialWindows: 4
})

// Computed properties
const progressPercentage = computed(() => (currentStep.value / totalSteps) * 100)

const canProceedToNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return houseConfig.propertyWidth >= 800 && houseConfig.propertyDepth >= 800
    case 2:
      return houseConfig.floorCount > 0
    case 3:
      return houseConfig.roofType !== ''
    case 4:
      return houseConfig.frontDoorType !== '' && houseConfig.initialWindows > 0
    default:
      return true
  }
})

// Roof options
const roofOptions = [
  {
    id: 'gabled',
    name: 'Gabled Roof',
    icon: '📐',
    description: 'Classic triangular design'
  },
  {
    id: 'hipped',
    name: 'Hipped Roof',
    icon: '🏠',
    description: 'Slopes on all four sides'
  },
  {
    id: 'flat',
    name: 'Flat Roof',
    icon: '⬜',
    description: 'Modern minimalist style'
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
  emit('complete', houseConfig)
}

const skipGuide = () => {
  emit('skip')
}

// Initialize floor heights
watch(() => houseConfig.floorCount, (newCount) => {
  const heights = [280, 260, 260]
  houseConfig.floorHeights = heights.slice(0, newCount)
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

.floor-option:hover,
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

.floor-height-config {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
  text-align: left;
}

.floor-height-input {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.floor-height-input label {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.floor-height-input input {
  width: 120px;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.roof-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.roof-option {
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

.roof-option:hover,
.roof-option.active {
  border-color: #10b981;
  background: #f0fdf4;
}

.roof-icon {
  font-size: 1.5rem;
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
}

.opening-config {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.opening-type h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.opening-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.opening-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.opening-option:hover {
  background: #f9fafb;
}

.opening-option input[type="radio"] {
  margin: 0;
}

.window-count {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.window-count label {
  font-weight: 500;
  color: #374151;
}

.window-count select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
}

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
}
</style>