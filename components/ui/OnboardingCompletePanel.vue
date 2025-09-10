<template>
  <div v-if="isVisible" class="completion-panel">
    <div class="panel-content">
      <div class="completion-header">
        <div class="success-icon">🎉</div>
        <h2>Great work!</h2>
        <p>You've successfully created your first house design. You can now use all the builder tools to refine it further.</p>
      </div>
      
      <div class="completion-actions">
        <div class="action-grid">
          <div class="action-option">
            <div class="action-icon">🛠️</div>
            <h3>Continue Building</h3>
            <p>Use all the tools to add details, adjust materials, and perfect your design.</p>
            <button @click="continueBuilding" class="action-btn primary">
              Keep Designing
            </button>
          </div>
          
          <div class="action-option">
            <div class="action-icon">📊</div>
            <h3>View Dashboard</h3>
            <p>See your project overview, manage documents, and track your renovation progress.</p>
            <button @click="goToDashboard" class="action-btn secondary">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
      
      <div class="completion-tips">
        <h4>💡 What's next?</h4>
        <ul>
          <li>Add more windows and doors using the layout tools</li>
          <li>Adjust floor heights and room configurations</li>
          <li>Save your design regularly to keep your progress</li>
          <li>Explore advanced features like energy systems when ready</li>
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
</script>

<style scoped>
.completion-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.panel-content {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}

.completion-header {
  text-align: center;
  margin-bottom: 3rem;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.completion-header h2 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 2rem;
}

.completion-header p {
  color: #6b7280;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.action-option {
  text-align: center;
  padding: 2rem;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  transition: all 0.2s;
}

.action-option:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.action-option h3 {
  margin: 0 0 0.75rem 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.action-option p {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.action-btn {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
  width: 100%;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.completion-tips {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 1.5rem;
}

.completion-tips h4 {
  margin: 0 0 1rem 0;
  color: #0c4a6e;
}

.completion-tips ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #0369a1;
}

.completion-tips li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.completion-tips li:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .completion-panel {
    padding: 1rem;
  }
  
  .panel-content {
    padding: 2rem;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .action-option {
    padding: 1.5rem;
  }
}
</style>