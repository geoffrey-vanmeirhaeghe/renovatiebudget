<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div v-if="isOpen" class="confirm-overlay" @click.self="handleCancel">
        <div class="confirm-container">
          <div class="confirm-icon" :class="`icon-${variant}`">
            <svg v-if="variant === 'warning'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else-if="variant === 'danger'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div class="confirm-content">
            <h3 class="confirm-title">{{ title }}</h3>
            <p class="confirm-message">{{ message }}</p>
          </div>
          
          <div class="confirm-actions" :class="{ 'three-actions': showContinue }">
            <button 
              v-if="showContinue"
              @click="handleContinue" 
              class="btn-continue"
            >
              {{ continueText }}
            </button>
            <button 
              @click="handleCancel" 
              class="btn-cancel"
            >
              {{ cancelText }}
            </button>
            <button 
              @click="handleConfirm" 
              class="btn-confirm"
              :class="`btn-${variant}`"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
type ConfirmVariant = 'info' | 'warning' | 'danger'

const props = withDefaults(defineProps<{
  isOpen: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  continueText?: string
  showContinue?: boolean
  variant?: ConfirmVariant
}>(), {
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  continueText: 'Continue Editing',
  showContinue: false,
  variant: 'warning'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  continue: []
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

const handleContinue = () => {
  emit('continue')
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.confirm-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.confirm-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.icon-info {
  background: #dbeafe;
  color: #2563eb;
}

.icon-warning {
  background: #fed7aa;
  color: #ea580c;
}

.icon-danger {
  background: #fee2e2;
  color: #dc2626;
}

.confirm-content {
  text-align: center;
  margin-bottom: 1.5rem;
}

.confirm-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.confirm-message {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
}

.confirm-actions.three-actions {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.75rem;
}

.btn-cancel,
.btn-confirm,
.btn-continue {
  padding: 0.625rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.confirm-actions:not(.three-actions) .btn-cancel,
.confirm-actions:not(.three-actions) .btn-confirm {
  flex: 1;
}

.btn-cancel {
  background: #fee2e2;
  color: #991b1b;
}

.btn-cancel:hover {
  background: #fecaca;
}

.btn-continue {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-continue:hover {
  background: #e5e7eb;
}

.btn-info {
  background: #3b82f6;
  color: white;
}

.btn-info:hover {
  background: #2563eb;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Transitions */
.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}

.confirm-enter-active .confirm-container,
.confirm-leave-active .confirm-container {
  transition: transform 0.2s ease;
}

.confirm-enter-from .confirm-container,
.confirm-leave-to .confirm-container {
  transform: scale(0.95);
}

/* Mobile */
@media (max-width: 640px) {
  .confirm-container {
    max-width: calc(100% - 2rem);
  }
}
</style>