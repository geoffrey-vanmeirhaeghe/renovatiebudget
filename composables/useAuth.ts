import type { User } from '~/types/user'

// Global authentication state
const currentUser = ref<User | null>(null)
const isAuthenticated = ref(false)
const isLoading = ref(false)
const authError = ref<string | null>(null)

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  address: {
    street: string
    number: string
    postalCode: string
    municipality: string
    province: string
    region: string
  }
  propertyType: string
  renovationScale: string
  timeline: string
}

export const useAuth = () => {
  // Initialize auth state on app start
  const initializeAuth = () => {
    // Check for existing auth token in localStorage
    if (process.client) {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')
      
      if (token && userData) {
        try {
          currentUser.value = JSON.parse(userData)
          isAuthenticated.value = true
        } catch (error) {
          console.error('Failed to parse user data:', error)
          clearAuth()
        }
      }
    }
  }
  
  // Clear authentication state
  const clearAuth = () => {
    currentUser.value = null
    isAuthenticated.value = false
    authError.value = null
    
    if (process.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
  }
  
  // Login function
  const login = async (email: string, password: string) => {
    isLoading.value = true
    authError.value = null
    
    try {
      // TODO: Replace with actual Strapi authentication
      // For now, simulate login with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email === 'demo@example.com' && password === 'password') {
        const mockUser: User = {
          id: '1',
          email: email,
          firstName: 'Demo',
          lastName: 'User',
          address: {
            street: 'Demo Street',
            number: '123',
            postalCode: '1000',
            municipality: 'Brussels',
            province: 'Brussels',
            region: 'brussels'
          },
          propertyType: 'house',
          renovationScale: 'house',
          timeline: 'this-year',
          createdAt: new Date(),
          lastLoginAt: new Date()
        }
        
        currentUser.value = mockUser
        isAuthenticated.value = true
        
        // Store in localStorage
        if (process.client) {
          localStorage.setItem('auth_token', 'mock_token_123')
          localStorage.setItem('user_data', JSON.stringify(mockUser))
        }
        
        // Redirect to dashboard
        await navigateTo('/dashboard')
      } else {
        throw new Error('Invalid email or password')
      }
    } catch (error) {
      authError.value = error instanceof Error ? error.message : 'Login failed'
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // Register function
  const register = async (data: RegisterData) => {
    isLoading.value = true
    authError.value = null
    
    try {
      // TODO: Replace with actual Strapi registration
      // For now, simulate registration
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        propertyType: data.propertyType,
        renovationScale: data.renovationScale,
        timeline: data.timeline,
        createdAt: new Date(),
        lastLoginAt: new Date()
      }
      
      currentUser.value = newUser
      isAuthenticated.value = true
      
      // Store in localStorage
      if (process.client) {
        localStorage.setItem('auth_token', `mock_token_${newUser.id}`)
        localStorage.setItem('user_data', JSON.stringify(newUser))
      }
      
      // Redirect to project setup
      await navigateTo('/project/setup')
    } catch (error) {
      authError.value = error instanceof Error ? error.message : 'Registration failed'
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // Logout function
  const logout = async () => {
    isLoading.value = true
    
    try {
      // TODO: Call Strapi logout endpoint
      await new Promise(resolve => setTimeout(resolve, 500))
      
      clearAuth()
      
      // Redirect to login
      await navigateTo('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear auth anyway
      clearAuth()
      await navigateTo('/auth/login')
    } finally {
      isLoading.value = false
    }
  }
  
  // Check if user needs to complete profile
  const needsProfileCompletion = computed(() => {
    return currentUser.value && (
      !currentUser.value.address?.street ||
      !currentUser.value.propertyType ||
      !currentUser.value.renovationScale ||
      !currentUser.value.timeline
    )
  })
  
  // Get user's Belgian region information
  const getUserRegion = computed(() => {
    if (!currentUser.value?.address?.region) return null
    
    const regionInfo = {
      flanders: {
        name: 'Flanders',
        energyStandard: 'EPB',
        gasBan: null,
        maxERate: null
      },
      brussels: {
        name: 'Brussels-Capital Region',
        energyStandard: '45 kWh/m² for houses',
        gasBan: '2025-01-01',
        maxERate: 45
      },
      wallonia: {
        name: 'Wallonia',
        energyStandard: '80 kWh/m²',
        gasBan: null,
        maxERate: 80
      }
    }
    
    return regionInfo[currentUser.value.address.region as keyof typeof regionInfo]
  })
  
  return {
    // State
    currentUser: readonly(currentUser),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    authError: readonly(authError),
    
    // Computed
    needsProfileCompletion,
    getUserRegion,
    
    // Actions
    initializeAuth,
    login,
    register,
    logout,
    clearAuth
  }
}