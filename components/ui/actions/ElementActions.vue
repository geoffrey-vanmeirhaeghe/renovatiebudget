<template>
  <div class="element-actions">
    <!-- Actions header (optional) -->
    <div class="actions-header" v-if="showHeader">
      <h4>{{ headerTitle || 'Actions' }}</h4>
    </div>

    <!-- Action buttons grid -->
    <div 
      class="actions-grid"
      :class="[
        `layout-${layout}`,
        { 'compact': compact }
      ]"
    >
      <button
        v-for="action in availableActions"
        :key="action.id"
        @click="executeAction(action)"
        class="action-btn"
        :class="[
          action.variant || 'default',
          action.id,
          { 
            'loading': action.loading,
            'disabled': action.disabled 
          }
        ]"
        :title="action.description || action.label"
        :disabled="action.disabled || action.loading"
      >
        <span class="action-icon" v-if="action.icon">{{ action.icon }}</span>
        <span class="action-label">{{ action.label }}</span>
        <span class="loading-spinner" v-if="action.loading">⟳</span>
      </button>
    </div>

    <!-- Quick actions (if different from main actions) -->
    <div class="quick-actions" v-if="quickActions.length > 0">
      <div class="quick-actions-label">
        <small>Quick Actions</small>
      </div>
      <div class="quick-actions-row">
        <button
          v-for="action in quickActions"
          :key="action.id"
          @click="executeAction(action)"
          class="quick-action-btn"
          :class="action.variant || 'default'"
          :title="action.description || action.label"
          :disabled="action.disabled"
        >
          <span v-if="action.icon">{{ action.icon }}</span>
          <span v-else>{{ action.label.charAt(0) }}</span>
        </button>
      </div>
    </div>

    <!-- Context actions (conditional based on element type) -->
    <div class="context-actions" v-if="contextActions.length > 0">
      <div class="context-actions-label">
        <small>{{ elementType }} Actions</small>
      </div>
      <div class="context-buttons">
        <button
          v-for="action in contextActions"
          :key="action.id"
          @click="executeAction(action)"
          class="context-btn"
          :class="action.variant || 'default'"
          :disabled="action.disabled"
        >
          <span class="action-icon" v-if="action.icon">{{ action.icon }}</span>
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Flexible action interface
export interface ElementAction {
  id: string
  label: string
  icon?: string
  description?: string
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  
  // Behavior
  action: string | ((element: any, context?: any) => void | Promise<void>)
  confirmationRequired?: boolean
  confirmationMessage?: string
  
  // State
  disabled?: boolean
  loading?: boolean
  hidden?: boolean
  
  // Conditional visibility/availability
  showWhen?: (element: any, context?: any) => boolean
  enableWhen?: (element: any, context?: any) => boolean
  
  // Grouping
  category?: 'main' | 'quick' | 'context'
  order?: number
  
  // Metadata for extensibility
  metadata?: Record<string, any>
}

interface Props {
  element: any
  elementType: string
  actions: ElementAction[]
  
  // Layout options
  layout?: 'grid' | 'row' | 'column'
  compact?: boolean
  showHeader?: boolean
  headerTitle?: string
  
  // Action filtering
  showQuickActions?: boolean
  showContextActions?: boolean
  
  // Context for conditional logic
  context?: any
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'grid',
  compact: false,
  showHeader: true,
  showQuickActions: true,
  showContextActions: true
})

const emit = defineEmits<{
  'action-executed': [action: ElementAction, element: any]
  'confirmation-required': [action: ElementAction, element: any]
  'action-completed': [action: ElementAction, element: any, result?: any]
  'action-failed': [action: ElementAction, element: any, error: Error]
}>()

// Import modal composable for confirmations
const { showDeleteConfirmation, showConfirmation } = useModal()

// Computed properties for action categorization
const availableActions = computed(() => {
  return filterActions(props.actions.filter(a => 
    !a.category || a.category === 'main'
  ))
})

const quickActions = computed(() => {
  if (!props.showQuickActions) return []
  return filterActions(props.actions.filter(a => 
    a.category === 'quick'
  ))
})

const contextActions = computed(() => {
  if (!props.showContextActions) return []
  return filterActions(props.actions.filter(a => 
    a.category === 'context'
  ))
})

// Filter actions based on visibility and availability conditions
const filterActions = (actions: ElementAction[]) => {
  return actions
    .filter(action => {
      // Check if action should be hidden
      if (action.hidden) return false
      
      // Check showWhen condition
      if (action.showWhen && !action.showWhen(props.element, props.context)) {
        return false
      }
      
      return true
    })
    .map(action => ({
      ...action,
      disabled: action.disabled || 
        (action.enableWhen && !action.enableWhen(props.element, props.context))
    }))
    .sort((a, b) => (a.order || 0) - (b.order || 0))
}

// Execute action with proper handling
const executeAction = async (action: ElementAction) => {
  if (action.disabled || action.loading) return
  
  try {
    emit('action-executed', action, props.element)
    
    // Handle confirmation if required
    if (action.confirmationRequired) {
      await handleConfirmation(action)
      return
    }
    
    // Execute the action
    await performAction(action)
    
  } catch (error) {
    console.error('Action execution failed:', error)
    emit('action-failed', action, props.element, error as Error)
  }
}

// Handle confirmation dialogs
const handleConfirmation = async (action: ElementAction) => {
  const isDelete = action.id.includes('delete') || action.variant === 'danger'
  
  if (isDelete) {
    await showDeleteConfirmation({
      itemName: getElementDisplayName(),
      onConfirm: () => performAction(action)
    })
  } else {
    await showConfirmation({
      title: 'Confirm Action',
      message: action.confirmationMessage || `Are you sure you want to ${action.label.toLowerCase()}?`,
      onConfirm: () => performAction(action),
      dangerous: action.variant === 'danger'
    })
  }
}

// Perform the actual action
const performAction = async (action: ElementAction) => {
  let result: any
  
  if (typeof action.action === 'string') {
    // Emit string action for parent to handle
    emit('action-executed', action, props.element)
  } else {
    // Execute function directly
    result = await action.action(props.element, props.context)
  }
  
  emit('action-completed', action, props.element, result)
}

// Helper to get element display name for confirmations
const getElementDisplayName = () => {
  if (props.element?.name) return props.element.name
  if (props.element?.id) return `${props.elementType} ${props.element.id}`
  return props.elementType
}

// Default actions factory (internal use only - moved from export)
const createDefaultActions = (elementType: string): ElementAction[] => {
  const actions: ElementAction[] = []
  
  // Common actions for most elements
  if (elementType !== 'roof') {
    actions.push(
      {
        id: 'delete',
        label: 'Delete',
        icon: '🗑️',
        description: `Delete this ${elementType}`,
        variant: 'danger',
        action: 'delete',
        confirmationRequired: true,
        category: 'main',
        order: 100
      },
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: '📋',
        description: `Duplicate this ${elementType}`,
        variant: 'secondary',
        action: 'duplicate',
        category: 'main',
        order: 90
      }
    )
  }
  
  // Type-specific actions
  switch (elementType) {
    case 'window':
      actions.push({
        id: 'convert-to-door',
        label: 'Convert to Door',
        icon: '🚪',
        description: 'Convert this window to a door',
        variant: 'primary',
        action: 'transformToDoor',
        category: 'context',
        order: 10
      })
      break
      
    case 'door':
      actions.push({
        id: 'convert-to-window',
        label: 'Convert to Window',
        icon: '🪟',
        description: 'Convert this door to a window',
        variant: 'primary',
        action: 'transformToWindow',
        category: 'context',
        order: 10
      })
      break
      
    case 'floor':
      actions.push(
        {
          id: 'add-window',
          label: 'Add Window',
          icon: '🪟',
          description: 'Add a window to this floor',
          variant: 'primary',
          action: 'addWindow',
          category: 'quick',
          order: 10
        },
        {
          id: 'add-door',
          label: 'Add Door',
          icon: '🚪',
          description: 'Add a door to this floor',
          variant: 'primary',
          action: 'addDoor',
          category: 'quick',
          order: 20
        }
      )
      break
  }
  
  return actions
}

// Expose helper functions for parent components
defineExpose({
  executeAction,
  availableActions,
  quickActions,
  contextActions,
  createDefaultActions
})
</script>

<style scoped>
.element-actions {
  width: 100%;
}

.actions-header {
  margin-bottom: 12px;
}

.actions-header h4 {
  margin: 0;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.actions-grid {
  display: grid;
  gap: 8px;
}

.layout-grid {
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.layout-row {
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
}

.layout-column {
  grid-template-columns: 1fr;
}

.compact .actions-grid {
  gap: 6px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: center;
  min-height: 40px;
  position: relative;
}

.compact .action-btn {
  padding: 6px 8px;
  font-size: 11px;
  min-height: 32px;
}

.action-btn:hover:not(.disabled):not(.loading) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: white;
}

.action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.loading {
  cursor: wait;
}

/* Variant styles */
.action-btn.danger {
  color: #dc2626;
  border-color: #dc2626;
}

.action-btn.danger:hover:not(.disabled) {
  background: #dc2626;
  color: white;
}

.action-btn.primary {
  color: #2563eb;
  border-color: #2563eb;
}

.action-btn.primary:hover:not(.disabled) {
  background: #2563eb;
  color: white;
}

.action-btn.secondary {
  color: #7c3aed;
  border-color: #7c3aed;
}

.action-btn.secondary:hover:not(.disabled) {
  background: #7c3aed;
  color: white;
}

.action-btn.success {
  color: #059669;
  border-color: #059669;
}

.action-btn.success:hover:not(.disabled) {
  background: #059669;
  color: white;
}

.action-btn.warning {
  color: #d97706;
  border-color: #d97706;
}

.action-btn.warning:hover:not(.disabled) {
  background: #d97706;
  color: white;
}

.action-icon {
  font-size: 14px;
}

.action-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loading-spinner {
  animation: spin 1s linear infinite;
  font-size: 14px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Quick actions */
.quick-actions {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.quick-actions-label {
  margin-bottom: 8px;
}

.quick-actions-label small {
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-actions-row {
  display: flex;
  gap: 6px;
}

.quick-action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-action-btn:hover {
  background: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Context actions */
.context-actions {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.context-actions-label {
  margin-bottom: 8px;
}

.context-actions-label small {
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.context-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.context-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.context-btn:hover {
  background: white;
  border-color: #3b82f6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .layout-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  
  .action-btn {
    padding: 6px 8px;
    font-size: 11px;
    min-height: 36px;
  }
  
  .quick-action-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .layout-grid,
  .layout-row {
    grid-template-columns: 1fr;
  }
  
  .quick-actions-row {
    justify-content: center;
  }
}
</style>