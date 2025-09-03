<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="header-content">
              <div class="coming-soon-icon">
                🚧
              </div>
              <h2 class="modal-title">{{ title }}</h2>
              <p class="modal-subtitle">{{ subtitle }}</p>
            </div>
            <button class="close-button" @click="close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <div class="coming-soon-content">
              <div class="feature-description">
                <p>{{ description }}</p>
              </div>
              
              
              <div class="cta-section">
                <p class="cta-text">Want to be notified when this feature is ready?</p>
                <div class="notification-signup">
                  <input 
                    type="email" 
                    placeholder="Enter your email address"
                    v-model="notificationEmail"
                    class="notification-input"
                  />
                  <button class="notification-btn" @click="requestNotification">
                    Notify Me
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button type="button" @click="close" class="btn-primary">
              Got it!
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  title?: string
  subtitle?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Coming Soon!',
  subtitle: 'This feature is under development',
  description: 'We\'re working hard to bring you this exciting feature. It will be available in a future update.',
})

const emit = defineEmits<{
  close: []
  requestNotification: [email: string]
}>()

const notificationEmail = ref('')

const close = () => {
  emit('close')
  notificationEmail.value = ''
}

const requestNotification = () => {
  if (notificationEmail.value.trim()) {
    emit('requestNotification', notificationEmail.value.trim())
    // Show success message or handle notification request
    console.log('Notification requested for:', notificationEmail.value)
  }
  notificationEmail.value = ''
}

// Reset form when modal closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    notificationEmail.value = ''
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
  max-width: 500px;
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
  text-align: center;
}

.coming-soon-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem;
}

.modal-subtitle {
  font-size: 1rem;
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

.coming-soon-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: center;
}

.feature-description p {
  font-size: 1rem;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

.features-list h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem;
}

.features-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  text-align: left;
}

.feature-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.timeline-info {
  display: flex;
  justify-content: center;
}

.timeline-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.timeline-icon {
  font-size: 1rem;
}

.cta-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cta-text {
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.notification-signup {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}

.notification-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease;
}

.notification-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.notification-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.notification-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  background: #2563eb;
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
  
  .notification-signup {
    flex-direction: column;
  }
}
</style>