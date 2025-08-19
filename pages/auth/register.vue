<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Start Your Renovation Journey</h1>
        <p>Create your account to begin planning your dream renovation</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <!-- Step 1: Basic Information -->
        <div v-if="currentStep === 1" class="form-step">
          <div class="step-header">
            <h3>Basic Information</h3>
            <div class="step-indicator">Step 1 of 3</div>
          </div>
          
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input 
              id="firstName"
              v-model="firstName" 
              type="text" 
              required 
              placeholder="John"
              :disabled="isLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input 
              id="lastName"
              v-model="lastName" 
              type="text" 
              required 
              placeholder="Doe"
              :disabled="isLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email"
              v-model="email" 
              type="email" 
              required 
              placeholder="john@email.com"
              :disabled="isLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              id="password"
              v-model="password" 
              type="password" 
              required 
              placeholder="At least 8 characters"
              :disabled="isLoading"
            />
          </div>
        </div>
        
        <!-- Step 2: Property Information -->
        <div v-if="currentStep === 2" class="form-step">
          <div class="step-header">
            <h3>Property Information</h3>
            <div class="step-indicator">Step 2 of 3</div>
          </div>
          
          <div class="form-group">
            <label for="street">Street Address</label>
            <input 
              id="street"
              v-model="address.street" 
              type="text" 
              required 
              placeholder="123 Main Street"
              :disabled="isLoading"
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="number">Number</label>
              <input 
                id="number"
                v-model="address.number" 
                type="text" 
                required 
                placeholder="123"
                :disabled="isLoading"
              />
            </div>
            
            <div class="form-group">
              <label for="postalCode">Postal Code</label>
              <input 
                id="postalCode"
                v-model="address.postalCode" 
                type="text" 
                required 
                placeholder="1000"
                :disabled="isLoading"
                @input="detectRegion"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="municipality">City/Municipality</label>
            <input 
              id="municipality"
              v-model="address.municipality" 
              type="text" 
              required 
              placeholder="Brussels"
              :disabled="isLoading"
            />
          </div>
          
          <div v-if="detectedRegion" class="region-detection">
            <div class="region-badge">
              <span class="region-flag">🇧🇪</span>
              <span>{{ detectedRegion.name }}</span>
            </div>
            <p class="region-info">{{ detectedRegion.description }}</p>
          </div>
        </div>
        
        <!-- Step 3: Project Intent -->
        <div v-if="currentStep === 3" class="form-step">
          <div class="step-header">
            <h3>Renovation Goals</h3>
            <div class="step-indicator">Step 3 of 3</div>
          </div>
          
          <div class="form-group">
            <label>What type of property are you renovating?</label>
            <div class="radio-group">
              <label class="radio-option">
                <input 
                  v-model="propertyType" 
                  type="radio" 
                  value="house" 
                  required 
                />
                <span>House</span>
              </label>
              <label class="radio-option">
                <input 
                  v-model="propertyType" 
                  type="radio" 
                  value="apartment" 
                />
                <span>Apartment</span>
              </label>
              <label class="radio-option">
                <input 
                  v-model="propertyType" 
                  type="radio" 
                  value="commercial" 
                />
                <span>Commercial</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>What's the scale of your renovation?</label>
            <div class="radio-group">
              <label class="radio-option">
                <input 
                  v-model="renovationScale" 
                  type="radio" 
                  value="room" 
                  required 
                />
                <span>Single Room</span>
              </label>
              <label class="radio-option">
                <input 
                  v-model="renovationScale" 
                  type="radio" 
                  value="floor" 
                />
                <span>Entire Floor</span>
              </label>
              <label class="radio-option">
                <input 
                  v-model="renovationScale" 
                  type="radio" 
                  value="house" 
                />
                <span>Whole Property</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>When do you plan to start?</label>
            <div class="radio-group">
              <label class="radio-option">
                <input 
                  v-model="timeline" 
                  type="radio" 
                  value="immediate" 
                  required 
                />
                <span>Within 3 months</span>
              </label>
              <label class="radio-option">
                <input 
                  v-model="timeline" 
                  type="radio" 
                  value="this-year" 
                />
                <span>This year</span>
              </label>
              <label class="radio-option">
                <input 
                  v-model="timeline" 
                  type="radio" 
                  value="next-year" 
                />
                <span>Next year</span>
              </label>
              <label class="radio-option">
                <input 
                  v-model="timeline" 
                  type="radio" 
                  value="planning" 
                />
                <span>Just planning</span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <div class="action-buttons">
            <button 
              v-if="currentStep > 1"
              type="button"
              @click="previousStep" 
              class="btn-secondary"
              :disabled="isLoading"
            >
              Back
            </button>
            
            <button 
              v-if="currentStep < 3"
              type="button" 
              @click="nextStep"
              class="btn-primary"
              :disabled="isLoading || !canProceed"
            >
              Continue
            </button>
            
            <button 
              v-if="currentStep === 3"
              type="submit" 
              class="btn-primary"
              :disabled="isLoading || !canComplete"
            >
              {{ isLoading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </div>
        </div>
        
        <div class="auth-links">
          <p>Already have an account? <NuxtLink to="/auth/login">Sign in</NuxtLink></p>
        </div>
      </form>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define page meta
definePageMeta({
  layout: false
})

// Step management
const currentStep = ref(1)

// Form state
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')

const address = ref({
  street: '',
  number: '',
  postalCode: '',
  municipality: '',
  province: '',
  region: ''
})

const propertyType = ref('')
const renovationScale = ref('')
const timeline = ref('')

const isLoading = ref(false)
const error = ref('')
const detectedRegion = ref<any>(null)

// Belgian regions detection based on postal code
const belgianRegions = {
  flanders: {
    name: 'Flanders',
    description: 'Subject to Flemish building regulations and EPB requirements',
    postalRanges: [
      [2000, 2999], [3000, 3999], [8000, 8999], [9000, 9999]
    ]
  },
  brussels: {
    name: 'Brussels-Capital Region', 
    description: 'Subject to Brussels building codes and upcoming gas ban (2025)',
    postalRanges: [
      [1000, 1299]
    ]
  },
  wallonia: {
    name: 'Wallonia',
    description: 'Subject to Walloon building regulations and energy standards',
    postalRanges: [
      [1300, 1499], [4000, 4999], [5000, 5999], [6000, 6999], [7000, 7999]
    ]
  }
}

// Authentication composable (to be created)
const { register } = useAuth()

// Computed properties for form validation
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return firstName.value && lastName.value && email.value && password.value.length >= 8
    case 2:
      return address.value.street && address.value.number && address.value.postalCode && address.value.municipality
    case 3:
      return propertyType.value && renovationScale.value && timeline.value
    default:
      return false
  }
})

const canComplete = computed(() => {
  return canProceed.value && currentStep.value === 3
})

// Step navigation
const nextStep = () => {
  if (canProceed.value && currentStep.value < 3) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Region detection
const detectRegion = () => {
  const postalCode = parseInt(address.value.postalCode)
  if (isNaN(postalCode)) {
    detectedRegion.value = null
    return
  }
  
  for (const [regionKey, region] of Object.entries(belgianRegions)) {
    for (const [min, max] of region.postalRanges) {
      if (postalCode >= min && postalCode <= max) {
        detectedRegion.value = { ...region, key: regionKey }
        address.value.region = regionKey
        return
      }
    }
  }
  
  detectedRegion.value = null
  address.value.region = ''
}

const handleRegister = async () => {
  if (!canComplete.value) {
    error.value = 'Please complete all required fields'
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    await register({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
      address: address.value,
      propertyType: propertyType.value,
      renovationScale: renovationScale.value,
      timeline: timeline.value
    })
    // Redirect will be handled by useAuth composable
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Registration failed'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: #666;
  font-size: 0.9rem;
}

.form-step {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e1e5e9;
}

.step-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.step-indicator {
  font-size: 0.8rem;
  color: #666;
  background: #f5f5f5;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-option:hover {
  border-color: #667eea;
  background-color: #f8f9ff;
}

.radio-option input[type="radio"] {
  margin: 0;
  width: 18px;
  height: 18px;
}

.radio-option input[type="radio"]:checked + span {
  font-weight: 600;
  color: #667eea;
}

.radio-option:has(input:checked) {
  border-color: #667eea;
  background-color: #f8f9ff;
}

.region-detection {
  margin-top: 1rem;
  padding: 1rem;
  background: #f0f8f0;
  border-radius: 8px;
  border-left: 4px solid #4ade80;
}

.region-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #22c55e;
  margin-bottom: 0.5rem;
}

.region-flag {
  font-size: 1.2rem;
}

.region-info {
  font-size: 0.85rem;
  color: #16a34a;
  margin: 0;
}

.form-actions {
  margin-top: 2rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.auth-links {
  text-align: center;
  margin-top: 1rem;
}

.auth-links p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

.auth-links a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.auth-links a:hover {
  text-decoration: underline;
}

.error-message {
  background: #fee;
  color: #c53030;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>