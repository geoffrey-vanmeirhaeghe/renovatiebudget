import { ref, computed, nextTick } from 'vue'

// Flexible modal configuration interface
export interface ModalConfig {
  id: string
  type: 'confirmation' | 'form' | 'info' | 'custom'
  title: string
  message?: string
  component?: any // Vue component for custom modals
  props?: Record<string, any>
  
  // Action configuration
  actions?: ModalAction[]
  
  // Styling and behavior
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  persistent?: boolean // Can't close by clicking outside
  closeOnEscape?: boolean
  
  // Lifecycle hooks for extensibility
  onShow?: () => void
  onHide?: () => void
  onConfirm?: (data?: any) => void | Promise<void>
  onCancel?: () => void
  
  // Metadata for future extensibility
  metadata?: Record<string, any>
}

export interface ModalAction {
  id: string
  label: string
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  action: (data?: any) => void | Promise<void>
  loading?: boolean
  disabled?: boolean
  closeOnClick?: boolean
}

// Modal state management
interface ModalState {
  isVisible: boolean
  config: ModalConfig | null
  data: any
  loading: boolean
  error: string | null
}

// Global modal state
const modalState = ref<ModalState>({
  isVisible: false,
  config: null,
  data: null,
  loading: false,
  error: null
})

// Modal queue for multiple modals
const modalQueue = ref<ModalConfig[]>([])

export const useModal = () => {
  // Show modal with configuration
  const showModal = async (config: ModalConfig) => {
    // Add to queue if another modal is showing
    if (modalState.value.isVisible) {
      modalQueue.value.push(config)
      return
    }
    
    modalState.value.config = {
      // Default values
      size: 'medium',
      persistent: false,
      closeOnEscape: true,
      actions: [],
      ...config
    }
    
    modalState.value.data = null
    modalState.value.loading = false
    modalState.value.error = null
    modalState.value.isVisible = true
    
    // Call onShow hook
    await nextTick()
    config.onShow?.()
  }

  // Hide current modal
  const hideModal = async () => {
    if (!modalState.value.config) return
    
    // Call onHide hook
    modalState.value.config.onHide?.()
    
    modalState.value.isVisible = false
    modalState.value.config = null
    modalState.value.data = null
    modalState.value.loading = false
    modalState.value.error = null
    
    // Show next modal from queue
    await nextTick()
    if (modalQueue.value.length > 0) {
      const nextModal = modalQueue.value.shift()
      if (nextModal) {
        await showModal(nextModal)
      }
    }
  }

  // Confirm current modal
  const confirmModal = async (data?: any) => {
    if (!modalState.value.config) return
    
    try {
      modalState.value.loading = true
      modalState.value.error = null
      
      await modalState.value.config.onConfirm?.(data)
      await hideModal()
    } catch (error) {
      modalState.value.error = error instanceof Error ? error.message : 'An error occurred'
      console.error('Modal confirmation error:', error)
    } finally {
      modalState.value.loading = false
    }
  }

  // Cancel current modal
  const cancelModal = async () => {
    if (!modalState.value.config) return
    
    modalState.value.config.onCancel?.()
    await hideModal()
  }

  // Update modal data
  const updateModalData = (data: any) => {
    modalState.value.data = data
  }

  // Set modal loading state
  const setModalLoading = (loading: boolean) => {
    modalState.value.loading = loading
  }

  // Set modal error
  const setModalError = (error: string | null) => {
    modalState.value.error = error
  }

  // Convenience methods for common modal types
  const showConfirmation = (options: {
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void | Promise<void>
    onCancel?: () => void
    dangerous?: boolean
  }) => {
    return showModal({
      id: `confirmation-${Date.now()}`,
      type: 'confirmation',
      title: options.title,
      message: options.message,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      actions: [
        {
          id: 'cancel',
          label: options.cancelLabel || 'Cancel',
          variant: 'secondary',
          action: cancelModal,
          closeOnClick: true
        },
        {
          id: 'confirm',
          label: options.confirmLabel || 'Confirm',
          variant: options.dangerous ? 'danger' : 'primary',
          action: () => confirmModal(),
          closeOnClick: false // Will close after action completes
        }
      ]
    })
  }

  const showDeleteConfirmation = (options: {
    itemName: string
    onConfirm: () => void | Promise<void>
    onCancel?: () => void
  }) => {
    return showConfirmation({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete "${options.itemName}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      dangerous: true,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel
    })
  }

  const showInfo = (options: {
    title: string
    message: string
    buttonLabel?: string
  }) => {
    return showModal({
      id: `info-${Date.now()}`,
      type: 'info',
      title: options.title,
      message: options.message,
      actions: [
        {
          id: 'ok',
          label: options.buttonLabel || 'OK',
          variant: 'primary',
          action: hideModal,
          closeOnClick: true
        }
      ]
    })
  }

  const showForm = (options: {
    title: string
    component: any
    props?: Record<string, any>
    size?: 'small' | 'medium' | 'large'
    onSubmit: (data: any) => void | Promise<void>
    onCancel?: () => void
  }) => {
    return showModal({
      id: `form-${Date.now()}`,
      type: 'form',
      title: options.title,
      component: options.component,
      props: options.props,
      size: options.size || 'medium',
      onConfirm: options.onSubmit,
      onCancel: options.onCancel,
      actions: [
        {
          id: 'cancel',
          label: 'Cancel',
          variant: 'secondary',
          action: cancelModal,
          closeOnClick: true
        },
        {
          id: 'submit',
          label: 'Submit',
          variant: 'primary',
          action: () => confirmModal(modalState.value.data),
          closeOnClick: false
        }
      ]
    })
  }

  // Handle keyboard events
  const handleKeydown = (event: KeyboardEvent) => {
    if (!modalState.value.isVisible || !modalState.value.config) return
    
    if (event.key === 'Escape' && modalState.value.config.closeOnEscape) {
      event.preventDefault()
      cancelModal()
    }
  }

  // Handle backdrop click
  const handleBackdropClick = () => {
    if (!modalState.value.config?.persistent) {
      cancelModal()
    }
  }

  // Execute action by ID
  const executeAction = async (actionId: string, data?: any) => {
    const action = modalState.value.config?.actions?.find(a => a.id === actionId)
    if (!action) return
    
    try {
      modalState.value.loading = true
      await action.action(data)
      
      if (action.closeOnClick) {
        await hideModal()
      }
    } catch (error) {
      setModalError(error instanceof Error ? error.message : 'Action failed')
      console.error('Modal action error:', error)
    } finally {
      modalState.value.loading = false
    }
  }

  // Computed properties
  const isVisible = computed(() => modalState.value.isVisible)
  const config = computed(() => modalState.value.config)
  const data = computed(() => modalState.value.data)
  const loading = computed(() => modalState.value.loading)
  const error = computed(() => modalState.value.error)
  const hasQueue = computed(() => modalQueue.value.length > 0)

  return {
    // State
    isVisible,
    config,
    data,
    loading,
    error,
    hasQueue,
    
    // Core actions
    showModal,
    hideModal,
    confirmModal,
    cancelModal,
    updateModalData,
    setModalLoading,
    setModalError,
    executeAction,
    
    // Convenience methods
    showConfirmation,
    showDeleteConfirmation,
    showInfo,
    showForm,
    
    // Event handlers
    handleKeydown,
    handleBackdropClick
  }
}