export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()
  
  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    console.log('🔒 Not authenticated, redirecting to login')
    return navigateTo('/auth/login')
  }
  
  console.log('✅ Authentication check passed for:', to.path)
})