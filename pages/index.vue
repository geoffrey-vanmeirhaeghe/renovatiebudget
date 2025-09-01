<template>
  <div class="landing-container">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4">Loading...</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
// Protect this page with authentication
definePageMeta({
  middleware: 'auth'
})

// Get authentication state
const { isAuthenticated, currentUser } = useAuth()

// Redirect authenticated users to dashboard
onMounted(async () => {
  if (isAuthenticated.value && currentUser.value) {
    console.log('🏠 Authenticated user detected, redirecting to dashboard')
    await navigateTo('/dashboard')
  } else {
    console.log('🔒 User not authenticated, redirecting to login')
    await navigateTo('/auth/login')
  }
})
</script>

<style scoped>
.landing-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}
</style>