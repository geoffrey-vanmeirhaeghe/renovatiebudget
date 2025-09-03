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
  email: string
  password: string
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
      // Get Strapi base URL from runtime config
      const config = useRuntimeConfig()
      const strapiBaseUrl = config.public.strapiBaseUrl
      
      // Authenticate with Strapi
      const response = await $fetch(`${strapiBaseUrl}/api/auth/local`, {
        method: 'POST',
        body: {
          identifier: email,
          password: password
        }
      })
      
      // Convert Strapi user to our User format
      const strapiUser = response.user
      const transformedUser: User = {
        id: strapiUser.id.toString(),
        email: strapiUser.email,
        username: strapiUser.username,
        firstName: strapiUser.firstName,
        lastName: strapiUser.lastName,
        phone: strapiUser.phone,
        userPhase: strapiUser.userPhase || 'onboarding',
        createdAt: new Date(strapiUser.createdAt),
        updatedAt: new Date(strapiUser.updatedAt)
      }
      
      currentUser.value = transformedUser
      isAuthenticated.value = true
      
      // Store in localStorage
      if (process.client) {
        localStorage.setItem('auth_token', response.jwt)
        localStorage.setItem('user_data', JSON.stringify(transformedUser))
      }
      
      // Redirect based on user phase
      const userPhase = transformedUser.userPhase || 'onboarding'
      console.log('🚀 Login successful - User phase:', userPhase, 'User data:', transformedUser)
      
      if (userPhase === 'onboarding') {
        console.log('📝 Redirecting to onboarding...')
        await navigateTo('/onboarding')
      } else if (userPhase === 'project-setup') {
        console.log('🏗️ Redirecting to builder...')
        await navigateTo('/builder')
      } else {
        console.log('📊 Redirecting to dashboard...')
        await navigateTo('/dashboard')
      }
    } catch (error: any) {
      let errorMessage = 'Login failed'
      
      if (error.data?.error?.message) {
        errorMessage = error.data.error.message
      } else if (error.statusCode === 400) {
        errorMessage = 'Invalid email or password'
      } else if (error.statusCode === 429) {
        errorMessage = 'Too many login attempts. Please try again later.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      authError.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }
  
  // Register function
  const register = async (data: RegisterData) => {
    isLoading.value = true
    authError.value = null
    
    try {
      // Get Strapi base URL from runtime config
      const config = useRuntimeConfig()
      const strapiBaseUrl = config.public.strapiBaseUrl
      
      // Register with Strapi - only send core auth fields
      // userPhase will default to 'onboarding', firstName/lastName will be set during onboarding
      const response = await $fetch(`${strapiBaseUrl}/api/auth/local/register`, {
        method: 'POST',
        body: {
          username: data.email, // Use email as username
          email: data.email,
          password: data.password
        }
      })
      
      // Convert Strapi user to our User format
      const strapiUser = response.user
      const transformedUser: User = {
        id: strapiUser.id.toString(),
        email: strapiUser.email,
        username: strapiUser.username,
        firstName: strapiUser.firstName,
        lastName: strapiUser.lastName,
        phone: strapiUser.phone,
        userPhase: strapiUser.userPhase || 'onboarding',
        createdAt: new Date(strapiUser.createdAt),
        updatedAt: new Date(strapiUser.updatedAt)
      }
      
      currentUser.value = transformedUser
      isAuthenticated.value = true
      
      // Store in localStorage
      if (process.client) {
        localStorage.setItem('auth_token', response.jwt)
        localStorage.setItem('user_data', JSON.stringify(transformedUser))
      }
      
      // Redirect to onboarding
      await navigateTo('/onboarding')
    } catch (error: any) {
      let errorMessage = 'Registration failed'
      
      if (error.data?.error?.message) {
        errorMessage = error.data.error.message
      } else if (error.statusCode === 400) {
        const details = error.data?.error?.details
        if (details?.errors?.length > 0) {
          errorMessage = details.errors[0].message
        } else {
          errorMessage = 'Please check your registration details'
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      authError.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }
  
  // Logout function
  const logout = async () => {
    isLoading.value = true
    
    try {
      // Note: Strapi doesn't have a specific logout endpoint since JWT tokens are stateless
      // We just need to clear the client-side data
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
      !currentUser.value.firstName ||
      !currentUser.value.lastName ||
      currentUser.value.userPhase === 'onboarding'
    )
  })
  
  // Fetch user profile with userPhase from Strapi Users
  const fetchUserProfile = async () => {
    if (!currentUser.value?.id) return null
    
    try {
      const config = useRuntimeConfig()
      const strapiBaseUrl = config.public.strapiBaseUrl
      const token = process.client ? localStorage.getItem('auth_token') : null
      
      const response = await $fetch(`${strapiBaseUrl}/api/users/${currentUser.value.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      
      if (response) {
        return {
          userPhase: response.userPhase || 'onboarding',
          firstName: response.firstName,
          lastName: response.lastName,
          phone: response.phone,
          email: response.email
        }
      }
    } catch (error) {
      console.warn('Failed to fetch user profile:', error)
    }
    
    return null
  }

  
  return {
    // State
    currentUser: readonly(currentUser),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    authError: readonly(authError),
    
    // Computed
    needsProfileCompletion,
    
    // Actions
    initializeAuth,
    login,
    register,
    logout,
    clearAuth,
    fetchUserProfile
  }
}