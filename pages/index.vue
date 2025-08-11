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
onMounted(() => {
  updateProject(mockProject)
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