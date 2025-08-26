<template>
  <transition name="tooltip-fade">
    <div v-if="selectedTool" class="tool-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-header">
          <span class="tooltip-icon">{{ selectedTool.icon }}</span>
          <span class="tooltip-title">{{ selectedTool.name }}</span>
        </div>
        <p class="tooltip-text">{{ getToolInstructions(selectedTool) }}</p>
      </div>
      <button @click="clearTool" class="tooltip-close">×</button>
    </div>
  </transition>
</template>

<script setup lang="ts">
interface ToolItem {
  id: string
  name: string
  icon: string
  action: string
}

interface Props {
  selectedTool?: ToolItem | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  clearTool: []
}>()

const getToolInstructions = (tool: ToolItem) => {
  switch (tool.action) {
    case 'addFloor':
      return 'Click to add a new floor above existing ones.'
    case 'addWindow':
      return 'Select a floor first, then the window will be added to the front wall.'
    case 'addDoor':
      return 'Select a floor first, then the door will be added to the front wall.'
    case 'editWalls':
      return 'Click on walls to edit their configuration and properties.'
    case 'roomConfig':
      return 'Configure room layouts and divisions within floors.'
    case 'clearHouse':
      return 'Clear all floors and elements to start fresh.'
    default:
      return `${tool.name} - Implementation coming soon.`
  }
}

const clearTool = () => {
  emit('clearTool')
}
</script>

<style scoped>
.tool-tooltip {
  position: fixed;
  bottom: 20px;
  right: 20px;
  max-width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  z-index: 300; /* Above other content */
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.tooltip-content {
  flex: 1;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.tooltip-icon {
  font-size: 16px;
  line-height: 1;
}

.tooltip-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.tooltip-text {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.tooltip-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.tooltip-close:hover {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
}

/* Transition animations */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.3s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tool-tooltip {
    bottom: 15px;
    right: 15px;
    left: 15px;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .tool-tooltip {
    bottom: 10px;
    right: 10px;
    left: 10px;
    padding: 10px 12px;
  }
  
  .tooltip-text {
    font-size: 11px;
  }
}
</style>