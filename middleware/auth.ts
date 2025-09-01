export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, currentUser } = useAuth()
  
  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    console.log('🔒 Not authenticated, redirecting to login')
    return navigateTo('/auth/login')
  }
  
  // If user hasn't completed their profile and trying to access protected routes
  if (currentUser.value && !currentUser.value.address?.street && to.path !== '/project/setup') {
    console.log('📝 Profile incomplete, redirecting to setup')
    return navigateTo('/project/setup')
  }
  
  console.log('✅ Authentication check passed for:', to.path)
})