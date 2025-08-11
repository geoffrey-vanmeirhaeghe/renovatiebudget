<template>
  <ClientOnly>
    <div class="debug-panel">
      <h3>Debug Info</h3>
      <p>Selected Object: {{ selectedObject ? selectedObject.type : 'None' }}</p>
      <p>Object ID: {{ selectedObject?.id || 'None' }}</p>
      <p>Should show panel: {{ !!selectedObject }}</p>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const { selectedObject } = useSelection()
</script>

<style scoped>
.debug-panel {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 16px;
  border-radius: 8px;
  z-index: 1000;
  font-family: monospace;
  font-size: 12px;
}
</style>