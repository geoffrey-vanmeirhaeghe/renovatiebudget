<template>
  <div class="app-container">
    <House v-if="currentProject" :project="currentProject" />
    <PropertyPanel />
  </div>
</template>

<script setup lang="ts">
import { mockProject } from '~/data/mockProject'
import House from '~/components/renderings/house.vue'
import PropertyPanel from '~/components/ui/PropertyPanel.vue'

const { currentProject, updateProject } = useProject()

// Initialize with mock data immediately
updateProject(mockProject)
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
  height: 100%;
  width: 100%;
  position: relative;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1rem;
}

.loading-spinner {
  font-size: 1.2rem;
  color: #666;
}

.error-message {
  color: #dc2626;
  font-weight: 600;
}

.retry-button {
  px: 1rem;
  py: 0.5rem;
  bg: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #2563eb;
}
</style>
