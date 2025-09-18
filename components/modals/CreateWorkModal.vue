<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="header-content">
              <h2 class="modal-title">Create New Renovation Work</h2>
              <p class="modal-subtitle">Add a new phase to your renovation project</p>
            </div>
            <button class="close-button" @click="close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Basic Information -->
              <div class="section">
                <h3 class="section-title">Basic Information</h3>
                <div class="form-grid">
                  <div class="form-field">
                    <label class="form-label" for="workName">Work Name *</label>
                    <input 
                      id="workName"
                      v-model="formData.name"
                      type="text"
                      required
                      placeholder="e.g., Kitchen Renovation, Bathroom Remodel"
                      class="form-input"
                    />
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="workBudget">Budget (EUR) *</label>
                    <input 
                      id="workBudget"
                      v-model="formData.budget"
                      type="number"
                      required
                      min="0"
                      step="100"
                      placeholder="15000"
                      class="form-input"
                    />
                  </div>
                </div>
                <div class="form-field">
                  <label class="form-label" for="workDescription">Description</label>
                  <textarea 
                    id="workDescription"
                    v-model="formData.description"
                    rows="3"
                    placeholder="Describe what this work involves..."
                    class="form-textarea"
                  ></textarea>
                </div>
              </div>

              <!-- Timeline & Status -->
              <div class="section">
                <h3 class="section-title">Planning</h3>
                <div class="form-grid">
                  <div class="form-field">
                    <label class="form-label" for="workStatus">Status</label>
                    <select id="workStatus" v-model="formData.status" class="form-select">
                      <option value="future">Future Planning</option>
                      <option value="active">Start Immediately</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="workStartDate">Start Date</label>
                    <input 
                      id="workStartDate"
                      v-model="formData.startDate"
                      type="date"
                      class="form-input"
                      :min="minDate"
                    />
                  </div>
                </div>
              </div>

              <!-- Execution Type -->
              <div class="section">
                <h3 class="section-title">Execution Type</h3>
                <div class="execution-selector">
                  <button 
                    v-for="type in ['DIY', 'Contractor', 'Hybrid']"
                    :key="type"
                    type="button"
                    class="execution-option"
                    :class="{ 'selected': formData.executionType === type }"
                    @click="formData.executionType = type"
                  >
                    <span class="option-icon">
                      {{ type === 'DIY' ? '🔨' : type === 'Contractor' ? '👷' : '🤝' }}
                    </span>
                    <span class="option-label">{{ type }}</span>
                    <span class="option-desc">
                      {{ type === 'DIY' ? 'Do it yourself' : type === 'Contractor' ? 'Hire professional' : 'Mix of both' }}
                    </span>
                  </button>
                </div>
              </div>

            </form>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button type="button" @click="close" class="btn-secondary">Cancel</button>
            <button type="button" @click="handleSubmit" class="btn-primary" :disabled="!isFormValid">
              Create Work
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { RenovationWork, ExecutionType, WorkStatus } from '~/types/renovationWork'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  create: [workData: Partial<RenovationWork>]
}>()

const currentYear = new Date().getFullYear()

// Form data
const formData = ref({
  name: '',
  description: '',
  budget: 0,
  status: 'future' as WorkStatus,
  executionType: 'DIY' as ExecutionType,
  startDate: ''
})

// Computed properties
const isFormValid = computed(() => {
  return formData.value.name.trim() !== '' && formData.value.budget > 0
})

const minDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Methods
const handleSubmit = () => {
  if (!isFormValid.value) return

  const workData: Partial<RenovationWork> = {
    ...formData.value,
    canActivate: formData.value.status === 'planned'
  }

  emit('create', workData)
  resetForm()
}

const close = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    budget: 0,
    status: 'future' as WorkStatus,
    executionType: 'DIY' as ExecutionType,
    startDate: ''
  }
}

// Watch for prop changes to reset form
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 1.5rem 0;
  gap: 1rem;
}

.header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  padding: 0.5rem;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.15s ease;
}

.close-button:hover {
  color: #374151;
  background: #f3f4f6;
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.section {
  margin-bottom: 1.5rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-input,
.form-textarea,
.form-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
}

/* Execution Selector */
.execution-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.execution-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.execution-option:hover {
  border-color: #d1d5db;
}

.execution-option.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.option-label {
  font-weight: 600;
  color: #111827;
  min-width: 80px;
}

.option-desc {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .modal-container {
    max-height: 95vh;
    margin: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .execution-selector {
    gap: 0.5rem;
  }
  
  .execution-option {
    padding: 0.75rem;
  }
}
</style>