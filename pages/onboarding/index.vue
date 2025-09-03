<template>
  <div class="onboarding-container">
    <div class="onboarding-wrapper">
      <!-- Progress Bar -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
      
      <!-- Step Content -->
      <div class="onboarding-content">
        <!-- Step 1: Welcome & Personal Info -->
        <div v-if="currentStep === 1" class="step-content">
          <h1 class="step-title">Welcome to your renovation journey!</h1>
          <p class="step-subtitle">First, let's get some basic info about you</p>
          
          <form @submit.prevent="nextStep" class="onboarding-form">
            <div class="form-row">
              <div class="form-field">
                <label>First Name *</label>
                <input 
                  v-model="profile.firstName" 
                  type="text" 
                  required
                  placeholder="John"
                />
              </div>
              <div class="form-field">
                <label>Last Name *</label>
                <input 
                  v-model="profile.lastName" 
                  type="text" 
                  required
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div class="form-field">
              <label>Phone Number</label>
              <input 
                v-model="profile.phone" 
                type="tel" 
                placeholder="+32 123 456 789"
              />
            </div>
            
            <div class="form-field">
              <label>Preferred Language</label>
              <select v-model="profile.preferredLanguage">
                <option value="en">English</option>
                <option value="nl">Nederlands</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary">
                Continue
              </button>
            </div>
          </form>
        </div>
        
        <!-- Step 2: Project Name -->
        <div v-if="currentStep === 2" class="step-content">
          <h1 class="step-title">Your first project</h1>
          <p class="step-subtitle">Let's create your first renovation project</p>
          
          <form @submit.prevent="nextStep" class="onboarding-form">
            <div class="form-field">
              <label>Project Name *</label>
              <input 
                v-model="project.name" 
                type="text" 
                required
                placeholder="e.g., Kitchen Renovation, House Makeover"
              />
            </div>
            
            <div class="form-field">
              <label>Description (optional)</label>
              <textarea 
                v-model="project.description" 
                rows="3"
                placeholder="Brief description of your renovation plans..."
              />
            </div>
            
            <div class="form-actions">
              <button type="button" @click="previousStep" class="btn-secondary">
                Back
              </button>
              <button type="submit" class="btn-primary">
                Continue
              </button>
            </div>
          </form>
        </div>
        
        <!-- Step 3: Property Address -->
        <div v-if="currentStep === 3" class="step-content">
          <h1 class="step-title">Property location</h1>
          <p class="step-subtitle">Where is this renovation taking place?</p>
          
          <form @submit.prevent="nextStep" class="onboarding-form">
            <div class="form-row">
              <div class="form-field flex-3">
                <label>Street *</label>
                <input 
                  v-model="project.propertyAddress.street" 
                  type="text" 
                  required
                  placeholder="Rue de la Loi"
                />
              </div>
              <div class="form-field flex-1">
                <label>Number *</label>
                <input 
                  v-model="project.propertyAddress.number" 
                  type="text" 
                  required
                  placeholder="42"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label>Postal Code *</label>
                <input 
                  v-model="project.propertyAddress.postalCode" 
                  type="text" 
                  required
                  placeholder="1000"
                />
              </div>
              <div class="form-field">
                <label>Municipality *</label>
                <input 
                  v-model="project.propertyAddress.municipality" 
                  type="text" 
                  required
                  placeholder="Brussels"
                />
              </div>
            </div>
            
            <div class="form-field">
              <label>Region *</label>
              <select v-model="project.propertyAddress.region" required>
                <option value="">Select your region</option>
                <option value="brussels">Brussels-Capital Region</option>
                <option value="flanders">Flanders</option>
                <option value="wallonia">Wallonia</option>
              </select>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="previousStep" class="btn-secondary">
                Back
              </button>
              <button type="submit" class="btn-primary">
                Continue
              </button>
            </div>
          </form>
        </div>
        
        <!-- Step 4: Property Details -->
        <div v-if="currentStep === 4" class="step-content">
          <h1 class="step-title">About this property</h1>
          <p class="step-subtitle">Tell us about this renovation property</p>
          
          <form @submit.prevent="nextStep" class="onboarding-form">
            <div class="form-field">
              <label>Property Type *</label>
              <div class="option-grid">
                <label 
                  v-for="type in propertyTypes" 
                  :key="type.value"
                  class="option-card"
                  :class="{ selected: project.propertyType === type.value }"
                >
                  <input 
                    type="radio" 
                    v-model="project.propertyType" 
                    :value="type.value"
                    required
                  />
                  <span class="option-icon">{{ type.icon }}</span>
                  <span class="option-label">{{ type.label }}</span>
                </label>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label>Property Size (m²)</label>
                <input 
                  v-model.number="project.propertySize" 
                  type="number" 
                  placeholder="150"
                  min="10"
                  max="10000"
                />
              </div>
              <div class="form-field">
                <label>Year Built</label>
                <input 
                  v-model.number="project.yearBuilt" 
                  type="number" 
                  placeholder="1985"
                  min="1800"
                  :max="new Date().getFullYear()"
                />
              </div>
            </div>
            
            <div class="form-field">
              <label>Ownership Status *</label>
              <div class="option-list">
                <label 
                  v-for="status in ownershipStatuses" 
                  :key="status.value"
                  class="option-row"
                  :class="{ selected: project.propertyOwnership === status.value }"
                >
                  <input 
                    type="radio" 
                    v-model="project.propertyOwnership" 
                    :value="status.value"
                    required
                  />
                  <div>
                    <span class="option-title">{{ status.label }}</span>
                    <span class="option-desc">{{ status.description }}</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="previousStep" class="btn-secondary">
                Back
              </button>
              <button type="submit" class="btn-primary">
                Continue
              </button>
            </div>
          </form>
        </div>
        
        <!-- Step 5: Renovation Plans -->
        <div v-if="currentStep === 5" class="step-content">
          <h1 class="step-title">Your renovation plans</h1>
          <p class="step-subtitle">Help us understand this project's goals</p>
          
          <form @submit.prevent="nextStep" class="onboarding-form">
            <div class="form-field">
              <label>Renovation Scale *</label>
              <div class="option-list">
                <label 
                  v-for="scale in renovationScales" 
                  :key="scale.value"
                  class="option-row"
                  :class="{ selected: project.renovationScope === scale.value }"
                >
                  <input 
                    type="radio" 
                    v-model="project.renovationScope" 
                    :value="scale.value"
                    required
                  />
                  <div>
                    <span class="option-title">{{ scale.label }}</span>
                    <span class="option-desc">{{ scale.description }}</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label>Timeline *</label>
                <select v-model="project.projectTimeline" required>
                  <option value="">When do you plan to start?</option>
                  <option value="immediate">Immediately</option>
                  <option value="this-quarter">This quarter</option>
                  <option value="this-year">This year</option>
                  <option value="next-year">Next year</option>
                  <option value="2-3-years">2-3 years</option>
                  <option value="planning-phase">Just planning</option>
                </select>
              </div>
              
              <div class="form-field">
                <label>Budget Range</label>
                <select v-model="project.estimatedBudget">
                  <option value="">Select budget</option>
                  <option value="under-10k">Under €10,000</option>
                  <option value="10k-25k">€10,000 - €25,000</option>
                  <option value="25k-50k">€25,000 - €50,000</option>
                  <option value="50k-100k">€50,000 - €100,000</option>
                  <option value="100k-200k">€100,000 - €200,000</option>
                  <option value="200k-500k">€200,000 - €500,000</option>
                  <option value="over-500k">Over €500,000</option>
                  <option value="not-determined">Not sure yet</option>
                </select>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="previousStep" class="btn-secondary">
                Back
              </button>
              <button type="submit" class="btn-primary">
                Continue
              </button>
            </div>
          </form>
        </div>
        
        <!-- Step 6: Project Interests & Complete -->
        <div v-if="currentStep === 6" class="step-content">
          <h1 class="step-title">What interests you for this project?</h1>
          <p class="step-subtitle">Select all renovation areas that apply</p>
          
          <form @submit.prevent="completeOnboarding" class="onboarding-form">
            <div class="form-field">
              <div class="interest-grid">
                <label 
                  v-for="interest in availableInterests" 
                  :key="interest.value"
                  class="interest-card"
                  :class="{ selected: project.projectInterests.includes(interest.value) }"
                >
                  <input 
                    type="checkbox" 
                    :value="interest.value"
                    v-model="project.projectInterests"
                  />
                  <span class="interest-icon">{{ interest.icon }}</span>
                  <span class="interest-label">{{ interest.label }}</span>
                </label>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="previousStep" class="btn-secondary">
                Back
              </button>
              <button type="submit" class="btn-primary btn-complete">
                Complete Setup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const currentStep = ref(1)
const totalSteps = 6

const profile = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  preferredLanguage: 'en'
})

const project = reactive({
  name: '',
  description: '',
  propertyAddress: {
    street: '',
    number: '',
    postalCode: '',
    municipality: '',
    region: ''
  },
  propertyType: '',
  propertyOwnership: '',
  renovationScope: '',
  projectTimeline: '',
  estimatedBudget: '',
  projectInterests: [],
  propertySize: null,
  yearBuilt: null,
  isPrimary: true
})

const progressPercentage = computed(() => (currentStep.value / totalSteps) * 100)

const propertyTypes = [
  { value: 'house', label: 'House', icon: '🏠' },
  { value: 'apartment', label: 'Apartment', icon: '🏢' },
  { value: 'townhouse', label: 'Townhouse', icon: '🏘️' },
  { value: 'studio', label: 'Studio', icon: '🏚️' },
  { value: 'loft', label: 'Loft', icon: '🏗️' },
  { value: 'commercial', label: 'Commercial', icon: '🏪' },
  { value: 'mixed-use', label: 'Mixed Use', icon: '🏬' },
  { value: 'other', label: 'Other', icon: '🏡' }
]

const ownershipStatuses = [
  { value: 'owner', label: 'I own this property', description: 'You have full control over renovations' },
  { value: 'renter', label: "I'm renting", description: 'Some renovations may need landlord approval' },
  { value: 'looking-to-buy', label: 'Looking to buy', description: 'Planning renovations for a future property' },
  { value: 'investor', label: 'Investment property', description: 'Property for rental or resale' }
]

const renovationScales = [
  { value: 'complete-renovation', label: 'Complete Renovation', description: 'Full property overhaul' },
  { value: 'partial-renovation', label: 'Partial Renovation', description: 'Multiple rooms or areas' },
  { value: 'single-room', label: 'Single Room', description: 'Focus on one specific room' },
  { value: 'cosmetic-updates', label: 'Cosmetic Updates', description: 'Paint, fixtures, minor changes' },
  { value: 'maintenance', label: 'Maintenance & Repairs', description: 'Fix existing issues' },
  { value: 'extension', label: 'Extension', description: 'Adding new space or rooms' },
  { value: 'energy-upgrade', label: 'Energy Upgrade', description: 'Insulation, heating, solar panels' }
]

const availableInterests = [
  { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
  { value: 'living-room', label: 'Living Room', icon: '🛋️' },
  { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { value: 'outdoor', label: 'Outdoor', icon: '🌳' },
  { value: 'energy-efficiency', label: 'Energy Efficiency', icon: '⚡' },
  { value: 'smart-home', label: 'Smart Home', icon: '🏠' },
  { value: 'sustainability', label: 'Sustainability', icon: '🌱' }
]

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const completeOnboarding = async () => {
  try {
    // Get current user and Strapi config
    const { currentUser } = useAuth()
    const config = useRuntimeConfig()
    const strapiBaseUrl = config.public.strapiBaseUrl
    const token = localStorage.getItem('auth_token')
    
    if (!currentUser.value?.id || !token) {
      throw new Error('User must be authenticated to complete onboarding')
    }
    
    // Update the existing user record with onboarding data
    // Using the ACTUAL fields from Strapi user schema
    await $fetch(`${strapiBaseUrl}/api/users/${currentUser.value.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        firstName: profile.firstName.substring(0, 20), // Max 20 chars in Strapi
        lastName: profile.lastName.substring(0, 20), // Max 20 chars in Strapi
        phone: profile.phone ? profile.phone.substring(0, 25) : '', // Max 25 chars
        userPhase: 'project-setup' // Correct enum value with hyphen
      }
    })
    
    // Create a proper Project object from the onboarding data
    const projectData = {
      name: project.name || 'My Renovation Project',
      description: project.description || 'Created from onboarding',
      
      // Required: generalAttributes with propertySize
      generalAttributes: {
        propertySize: {
          width: Math.sqrt(project.propertySize || 150) * 10, // Rough estimate from area
          depth: Math.sqrt(project.propertySize || 150) * 10,
          area: project.propertySize || 150
        },
        floorSize: {
          width: Math.sqrt(project.propertySize || 150) * 10,
          depth: Math.sqrt(project.propertySize || 150) * 10,
          area: project.propertySize || 150
        },
        region: project.propertyAddress?.region || 'flanders'
      },
      
      // Required: floors (start with ground floor)
      floors: {
        'ground-floor': {
          storey: 0,
          height: 250, // Standard 2.5m height
          heightPosition: 0,
          color: '#f0f0f0',
          windows: {},
          doors: {}
        }
      },
      
      // Required: roof (basic gable roof)
      roof: {
        type: 'gable',
        width: Math.sqrt(project.propertySize || 150) * 10,
        depth: Math.sqrt(project.propertySize || 150) * 10,
        height: 300, // Standard roof height
        heightPosition: 250 // On top of ground floor
      },
      
      // Additional properties from onboarding
      ownerId: currentUser.value.id,
      settings: {
        units: 'metric',
        autoSave: true
      },
      metadata: {
        propertyAddress: project.propertyAddress,
        propertyType: project.propertyType,
        propertyOwnership: project.propertyOwnership,
        renovationScope: project.renovationScope,
        projectTimeline: project.projectTimeline,
        estimatedBudget: project.estimatedBudget,
        projectInterests: project.projectInterests,
        yearBuilt: project.yearBuilt,
        isPrimary: project.isPrimary
      }
    }
    
    // Save project to Strapi
    console.log('🏗️ ONBOARDING: Preparing to save project')
    console.log('📦 Project data from onboarding:', JSON.stringify(projectData, null, 2))
    
    const { saveProject } = useProject()
    await saveProject(projectData)
    
    // Redirect to builder
    await navigateTo('/builder')
  } catch (error) {
    console.error('Failed to complete onboarding:', error)
    // Show user-friendly error message
    alert('Failed to complete onboarding. Please try again.')
  }
}
</script>

<style scoped>
.onboarding-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.onboarding-wrapper {
  max-width: 600px;
  width: 100%;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.progress-fill {
  height: 100%;
  background: white;
  transition: width 0.3s ease;
}

.onboarding-content {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.step-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.step-subtitle {
  color: #718096;
  margin-bottom: 2rem;
}

.onboarding-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.flex-3 {
  grid-column: span 3;
}

.form-field.flex-1 {
  grid-column: span 1;
}

.form-field label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #667eea;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.option-card {
  position: relative;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.option-card:hover {
  border-color: #667eea;
}

.option-card.selected {
  border-color: #667eea;
  background: #f7fafc;
}

.option-card input {
  position: absolute;
  opacity: 0;
}

.option-icon {
  display: block;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.option-label {
  display: block;
  font-weight: 500;
  color: #2d3748;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-row {
  display: flex;
  align-items: start;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-row:hover {
  border-color: #667eea;
}

.option-row.selected {
  border-color: #667eea;
  background: #f7fafc;
}

.option-row input {
  margin-top: 0.25rem;
}

.option-title {
  display: block;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.option-desc {
  display: block;
  font-size: 0.875rem;
  color: #718096;
}

.interest-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.interest-card {
  position: relative;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.interest-card:hover {
  border-color: #667eea;
}

.interest-card.selected {
  border-color: #667eea;
  background: #f7fafc;
}

.interest-card input {
  position: absolute;
  opacity: 0;
}

.interest-icon {
  display: block;
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.interest-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #2d3748;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex: 1;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #edf2f7;
}

.btn-complete {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

@media (max-width: 640px) {
  .onboarding-content {
    padding: 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .option-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .interest-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>