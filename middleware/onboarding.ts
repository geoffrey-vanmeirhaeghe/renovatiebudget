export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, currentUser, fetchUserProfile, needsProfileCompletion } = useAuth()
  
  // Skip if not authenticated
  if (!isAuthenticated.value || !currentUser.value) {
    return
  }
  
  // Get user's current phase from backend
  const userProfile = await fetchUserProfile()
  const userPhase = userProfile?.userPhase || (needsProfileCompletion.value ? 'onboarding' : 'onboarded')
  
  console.log(`📋 Middleware check - User phase: ${userPhase}, Current path: ${to.path}`)
  console.log(`📋 User profile from backend:`, userProfile)
  console.log(`📋 Current user from local state:`, currentUser.value)
  console.log(`📋 Needs profile completion:`, needsProfileCompletion.value)
  
  // Phase-based routing logic
  if (userPhase === 'onboarding' && !to.path.startsWith('/onboarding')) {
    console.log('📝 User in onboarding phase, redirecting to onboarding...')
    return navigateTo('/onboarding')
  }
  
  if (userPhase === 'project-setup' && !to.path.startsWith('/builder')) {
    console.log('🏗️ User in project setup phase, redirecting to builder...')
    return navigateTo('/builder')
  }
  
  // If user is onboarded, they can access any protected route
  if (userPhase === 'onboarded') {
    // Allow access to any protected page
    return
  }
})