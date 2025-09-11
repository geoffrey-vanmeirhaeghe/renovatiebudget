<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Start Your Renovation Journey</h1>
        <p>Create your account to begin planning your dream renovation</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="auth-form">
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
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn-primary"
            :disabled="isLoading || !canComplete"
          >
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </div>
        
        <div class="auth-links">
          <p>Already have an account? <NuxtLink to="/auth/login">Sign in</NuxtLink></p>
        </div>
      </form>
      
      <div v-if="error" class="error-message">
        {{ error }}
        <div v-if="error.includes('already exists')" class="error-action">
          <NuxtLink to="/auth/login" class="login-link">→ Go to login page</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define page meta
definePageMeta({
  layout: false
})

// Form state
const email = ref('')
const password = ref('')

const isLoading = ref(false)
const error = ref('')

// Authentication composable (to be created)
const { register } = useAuth()

// Computed properties for form validation
const canComplete = computed(() => {
  return email.value && password.value && password.value.length >= 8
})

const handleRegister = async () => {
  if (!canComplete.value) {
    error.value = 'Please complete all required fields'
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    await register({
      email: email.value,
      password: password.value
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


.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
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

.error-action {
  margin-top: 0.75rem;
}

.login-link {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.login-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

@media (max-width: 600px) {
  .auth-card {
    padding: 1.5rem;
  }
}
</style>