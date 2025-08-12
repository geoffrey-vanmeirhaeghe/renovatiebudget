<template>
  <div class="app-container">
    <House v-if="currentProject" :project="currentProject" />
    <PropertyPanel />
  </div>
</template>

<script setup lang="ts">
import House from '~/components/renderings/house.vue'
import PropertyPanel from '~/components/ui/PropertyPanel.vue'

const { currentProject, loadProject } = useProject()

// Load Strapi data by default
// TODO: Replace hard-coded documentId with dynamic project selection
// See TECHNICAL_DEBT.md for details
onMounted(async () => {
  try {
    // Load project from Strapi using known documentId
    await loadProject('ca66f5looy2mij5rua9yj987', true)
  } catch (error) {
    console.error('Failed to load Strapi data, falling back to mock data:', error)
    // Fallback to mock data if Strapi is unavailable
    await loadProject()
  }
})
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: system-ui, -apple-system, sans-serif;
}

#app {
  height: 100%;
  width: 100%;
}

.app-container {
  height: 100vh;
  width: 100vw;
  position: relative;
}
</style>