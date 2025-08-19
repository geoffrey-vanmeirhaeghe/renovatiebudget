<template>
  <header class="app-header">
    <div class="header-container">
      <div class="header-left">
        <!-- Back to Dashboard button (only shown on builder page) -->
        <button v-if="isBuilderMode" @click="goToDashboard" class="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          <span>Dashboard</span>
        </button>
        
        <!-- Logo -->
        <div class="logo" @click="goToDashboard">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="12" width="24" height="16" fill="#3B82F6" />
            <path d="M2 14L16 2L30 14" stroke="#3B82F6" stroke-width="2" fill="none" />
            <rect x="12" y="18" width="8" height="10" fill="white" />
          </svg>
          <span class="logo-text">RenovatieBudget</span>
        </div>
      </div>
      
      <!-- Navigation (hidden on builder page) -->
      <nav v-if="!isBuilderMode" class="main-nav">
        <NuxtLink to="/dashboard" class="nav-link" :class="{ active: $route.path === '/dashboard' }">
          Dashboard
        </NuxtLink>
        <NuxtLink to="/marketplace" class="nav-link" :class="{ active: $route.path === '/marketplace' }">
          Vind Aannemers
        </NuxtLink>
        <NuxtLink to="/planning" class="nav-link" :class="{ active: $route.path === '/planning' }">
          Planning
        </NuxtLink>
        <NuxtLink to="/documents" class="nav-link" :class="{ active: $route.path === '/documents' }">
          Documenten
        </NuxtLink>
        <NuxtLink to="/profile" class="nav-link" :class="{ active: $route.path === '/profile' }">
          Profiel
        </NuxtLink>
      </nav>
      
      <!-- Builder mode header info -->
      <div v-if="isBuilderMode" class="builder-info">
        <div class="builder-title">
          <h1>3D Builder</h1>
          <span class="save-status">
            <span class="save-dot">●</span>
            Auto-saved
          </span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Detect if we're on the builder page
const route = useRoute()
const isBuilderMode = computed(() => route.path === '/builder')

// Navigation function
const goToDashboard = () => {
  navigateTo('/dashboard')
}
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 1.5rem;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1440px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.back-button:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.builder-info {
  display: flex;
  align-items: center;
}

.builder-title {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.builder-title h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.save-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #48bb78;
  font-size: 0.875rem;
  font-weight: 500;
}

.save-dot {
  font-size: 0.7rem;
  color: #48bb78;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #1f2937;
  background-color: #f3f4f6;
}

.nav-link.active {
  color: #3b82f6;
  background-color: #eff6ff;
}

@media (max-width: 768px) {
  .header-left {
    gap: 1rem;
  }
  
  .back-button {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .builder-title h1 {
    font-size: 1.125rem;
  }
  
  .save-status {
    font-size: 0.8rem;
  }
}
</style>