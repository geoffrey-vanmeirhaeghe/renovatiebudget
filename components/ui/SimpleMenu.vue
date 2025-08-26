<template>
  <div class="simple-menu">
    <!-- Direct action buttons -->
    <div class="action-buttons">
      <button @click="goBackToDashboard" class="action-btn back-btn" title="Back to Dashboard">
        <span class="btn-icon">←</span>
        <span class="btn-label">Dashboard</span>
      </button>

      <button 
        @click="saveProject" 
        :disabled="!canSave || isSaving"
        class="action-btn save-btn"
        :class="{ 'has-changes': hasUnsavedChanges }"
        :title="isSaving ? 'Saving...' : hasUnsavedChanges ? 'Unsaved changes - Click to save' : 'Save Project'"
      >
        <span class="btn-icon">{{ isSaving ? '⏳' : '💾' }}</span>
        <span class="btn-label">{{ isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save*' : 'Save' }}</span>
        <span v-if="hasUnsavedChanges && !isSaving" class="unsaved-indicator">●</span>
      </button>
    </div>

    <!-- Save status (appears when saving) -->
    <div v-if="saveStatus" class="save-status-toast">
      <small :class="{ error: saveStatus.includes('Error'), success: saveStatus.includes('Saved') }">
        {{ saveStatus }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
const { currentProject } = useProject()
const { saveProject: saveToStrapi } = useStrapi()

// Save functionality
const isSaving = ref(false)
const saveStatus = ref('')

// Track unsaved changes
const lastSavedProjectState = ref<string>('')
const hasUnsavedChanges = ref(false)

const canSave = computed(() => {
  return currentProject.value && !currentProject.value.id.startsWith('mock-')
})

// Watch for project changes to detect unsaved modifications
watch(() => currentProject.value, (newProject) => {
  if (!newProject) {
    hasUnsavedChanges.value = false
    return
  }

  const currentProjectString = JSON.stringify(newProject)
  
  // If we don't have a saved state yet, initialize it
  if (!lastSavedProjectState.value) {
    lastSavedProjectState.value = currentProjectString
    hasUnsavedChanges.value = false
    return
  }
  
  // Compare current state with last saved state
  hasUnsavedChanges.value = currentProjectString !== lastSavedProjectState.value
}, { deep: true })

// Reset unsaved changes indicator when project loads
onMounted(() => {
  if (currentProject.value) {
    lastSavedProjectState.value = JSON.stringify(currentProject.value)
    hasUnsavedChanges.value = false
  }
})

// Navigation
const goBackToDashboard = () => {
  navigateTo('/dashboard')
}

// Save project action
const saveProject = async () => {
  if (!currentProject.value || isSaving.value) return

  isSaving.value = true
  saveStatus.value = ''
  
  try {
    const savedProject = await saveToStrapi(currentProject.value)
    const { loadProject } = useProject()
    await loadProject(savedProject.id, true)
    
    // Update the last saved state after successful save
    if (currentProject.value) {
      lastSavedProjectState.value = JSON.stringify(currentProject.value)
      hasUnsavedChanges.value = false
    }
    
    saveStatus.value = '✅ Project saved successfully!'
    setTimeout(() => { saveStatus.value = '' }, 3000)
  } catch (error) {
    console.error('Save failed:', error)
    saveStatus.value = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    setTimeout(() => { saveStatus.value = '' }, 3000)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.simple-menu {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 400;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 25px;
  padding: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 18px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  white-space: nowrap;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.back-btn:hover {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
}

.save-btn:not(:disabled):hover {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.save-btn.has-changes {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.save-btn.has-changes:not(:disabled):hover {
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.unsaved-indicator {
  color: #f59e0b;
  font-size: 8px;
  margin-left: 2px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.btn-icon {
  font-size: 16px;
  line-height: 1;
}

.btn-label {
  font-size: 12px;
  line-height: 1;
}

.save-status-toast {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  text-align: center;
}

.save-status-toast small.success {
  color: #22c55e;
  font-weight: 500;
  font-size: 12px;
}

.save-status-toast small.error {
  color: #ef4444;
  font-weight: 500;
  font-size: 12px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .simple-menu {
    top: 15px;
    left: 15px;
  }
  
  .action-buttons {
    padding: 4px;
    gap: 6px;
  }
  
  .action-btn {
    padding: 6px 10px;
  }
  
  .btn-icon {
    font-size: 14px;
  }
  
  .btn-label {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .simple-menu {
    top: 10px;
    left: 10px;
  }
  
  .action-buttons {
    padding: 3px;
    gap: 4px;
  }
  
  .action-btn {
    padding: 6px 8px;
  }
  
  .btn-label {
    display: none;
  }
  
  .btn-icon {
    font-size: 16px;
  }
}
</style>