<template>
  <div v-if="isVisible" class="completion-card">
    <div class="card-header">
      <div class="success-icon">🎉</div>
      <button @click="dismiss" class="close-btn">×</button>
    </div>
    
    <div class="card-content">
      <h3>House Created!</h3>
      <p>You can now use all builder tools to refine your design.</p>
      
      <div class="action-buttons">
        <button @click="continueBuilding" class="action-btn primary">
          Keep Building
        </button>
        <button @click="goToDashboard" class="action-btn secondary">
          Dashboard
        </button>
      </div>
      
      <div class="tips">
        <h4>💡 Next steps:</h4>
        <ul>
          <li>Add more windows/doors</li>
          <li>Adjust room layouts</li>
          <li>Save your progress</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'continue-building': []
  'go-to-dashboard': []
}>()

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const continueBuilding = () => {
  emit('continue-building')
  isVisible.value = false
}

const goToDashboard = () => {
  emit('go-to-dashboard')
  isVisible.value = false
}

const dismiss = () => {
  emit('continue-building')
  isVisible.value = false
}
</script>

<style scoped>
.completion-card {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 2px solid #10b981;
  z-index: 500;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.card-header {
  padding: 1rem 1rem 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.success-icon {
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #6b7280;
}

.card-content {
  padding: 0 1rem 1rem 1rem;
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.125rem;
}

.card-content p {
  color: #6b7280;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.875rem;
}

.action-btn.primary {
  background: #10b981;
  color: white;
}

.action-btn.primary:hover {
  background: #059669;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.tips {
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 0.75rem;
}

.tips h4 {
  margin: 0 0 0.5rem 0;
  color: #1e40af;
  font-size: 0.875rem;
}

.tips ul {
  margin: 0;
  padding-left: 1rem;
  color: #1e40af;
}

.tips li {
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  line-height: 1.3;
}

.tips li:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .completion-card {
    right: 10px;
    left: 10px;
    width: auto;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>