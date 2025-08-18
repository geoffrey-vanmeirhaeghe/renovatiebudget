// Flexible event system for component communication and extensibility

// Base event interface for all application events
export interface BaseEvent {
  type: string
  timestamp: number
  source?: string
  metadata?: Record<string, any>
}

// UI Events
export interface UIEvent extends BaseEvent {
  type: 'UI_EVENT'
  action: string
  payload?: any
}

// Element events - extensible for any element type
export interface ElementEvent extends BaseEvent {
  type: 'ELEMENT_EVENT'
  elementType: string
  elementId: string
  floorId?: string
  action: 'created' | 'updated' | 'deleted' | 'selected' | 'deselected' | string
  data?: any
  oldData?: any
}

// Property change events with specific typing
export interface PropertyChangeEvent extends BaseEvent {
  type: 'PROPERTY_CHANGE'
  elementType: string
  elementId: string
  floorId?: string
  property: string
  value: any
  oldValue?: any
}

// Tool and action events
export interface ToolEvent extends BaseEvent {
  type: 'TOOL_EVENT'
  toolId: string
  action: 'selected' | 'deselected' | 'executed' | string
  context?: any
}

export interface ActionEvent extends BaseEvent {
  type: 'ACTION_EVENT'
  actionId: string
  elementType?: string
  elementId?: string
  result?: 'success' | 'failure' | 'cancelled'
  error?: string
  data?: any
}

// Project-level events
export interface ProjectEvent extends BaseEvent {
  type: 'PROJECT_EVENT'
  action: 'loaded' | 'saved' | 'created' | 'updated' | 'deleted' | string
  projectId?: string
  data?: any
}

// Modal events
export interface ModalEvent extends BaseEvent {
  type: 'MODAL_EVENT'
  modalId: string
  action: 'opened' | 'closed' | 'confirmed' | 'cancelled' | string
  data?: any
}

// Selection events with flexible typing
export interface SelectionEvent extends BaseEvent {
  type: 'SELECTION_EVENT'
  action: 'selected' | 'deselected' | 'cleared' | 'hovered' | 'unhovered'
  elementType?: string
  elementId?: string
  floorId?: string
  element?: any
}

// Form events
export interface FormEvent extends BaseEvent {
  type: 'FORM_EVENT'
  formId: string
  action: 'submitted' | 'cancelled' | 'validated' | 'changed' | string
  data?: any
  errors?: Record<string, string>
}

// Navigation events
export interface NavigationEvent extends BaseEvent {
  type: 'NAVIGATION_EVENT'
  action: 'route_changed' | 'tab_switched' | 'panel_opened' | 'panel_closed' | string
  from?: string
  to?: string
  context?: any
}

// System events for debugging and monitoring
export interface SystemEvent extends BaseEvent {
  type: 'SYSTEM_EVENT'
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  context?: any
  stack?: string
}

// Union type for all events
export type AppEvent = 
  | UIEvent
  | ElementEvent
  | PropertyChangeEvent
  | ToolEvent
  | ActionEvent
  | ProjectEvent
  | ModalEvent
  | SelectionEvent
  | FormEvent
  | NavigationEvent
  | SystemEvent

// Event handler type
export type EventHandler<T extends AppEvent = AppEvent> = (event: T) => void | Promise<void>

// Event emitter interface for components
export interface EventEmitter {
  emit<T extends AppEvent>(event: T): void
  on<T extends AppEvent>(type: T['type'], handler: EventHandler<T>): void
  off<T extends AppEvent>(type: T['type'], handler: EventHandler<T>): void
  once<T extends AppEvent>(type: T['type'], handler: EventHandler<T>): void
}

// Event configuration for extensible components
export interface EventConfig {
  enabled: boolean
  debounceMs?: number
  throttleMs?: number
  persist?: boolean
  transform?: (event: AppEvent) => AppEvent
}

// Flexible event factory for creating typed events
export function createEvent<T extends AppEvent>(
  type: T['type'],
  data: Omit<T, 'type' | 'timestamp'>,
  source?: string
): T {
  return {
    type,
    timestamp: Date.now(),
    source,
    ...data
  } as T
}

// Event builder for complex events
export class EventBuilder {
  private event: Partial<AppEvent> = {}

  static create(type: string) {
    const builder = new EventBuilder()
    builder.event.type = type
    builder.event.timestamp = Date.now()
    return builder
  }

  source(source: string) {
    this.event.source = source
    return this
  }

  metadata(metadata: Record<string, any>) {
    this.event.metadata = metadata
    return this
  }

  data(key: string, value: any) {
    if (!this.event.metadata) {
      this.event.metadata = {}
    }
    this.event.metadata[key] = value
    return this
  }

  build<T extends AppEvent = AppEvent>(): T {
    return this.event as T
  }
}

// Common event creators for convenience
export const Events = {
  // Element events
  elementCreated: (elementType: string, elementId: string, data: any, floorId?: string) =>
    createEvent<ElementEvent>('ELEMENT_EVENT', {
      elementType,
      elementId,
      floorId,
      action: 'created',
      data
    }),

  elementUpdated: (elementType: string, elementId: string, data: any, oldData?: any, floorId?: string) =>
    createEvent<ElementEvent>('ELEMENT_EVENT', {
      elementType,
      elementId,
      floorId,
      action: 'updated',
      data,
      oldData
    }),

  elementDeleted: (elementType: string, elementId: string, floorId?: string) =>
    createEvent<ElementEvent>('ELEMENT_EVENT', {
      elementType,
      elementId,
      floorId,
      action: 'deleted'
    }),

  // Property events
  propertyChanged: (elementType: string, elementId: string, property: string, value: any, oldValue?: any, floorId?: string) =>
    createEvent<PropertyChangeEvent>('PROPERTY_CHANGE', {
      elementType,
      elementId,
      floorId,
      property,
      value,
      oldValue
    }),

  // Selection events
  elementSelected: (elementType: string, elementId: string, element: any, floorId?: string) =>
    createEvent<SelectionEvent>('SELECTION_EVENT', {
      action: 'selected',
      elementType,
      elementId,
      floorId,
      element
    }),

  selectionCleared: () =>
    createEvent<SelectionEvent>('SELECTION_EVENT', {
      action: 'cleared'
    }),

  // Tool events
  toolSelected: (toolId: string, context?: any) =>
    createEvent<ToolEvent>('TOOL_EVENT', {
      toolId,
      action: 'selected',
      context
    }),

  toolExecuted: (toolId: string, context?: any) =>
    createEvent<ToolEvent>('TOOL_EVENT', {
      toolId,
      action: 'executed',
      context
    }),

  // Action events
  actionExecuted: (actionId: string, elementType?: string, elementId?: string, data?: any) =>
    createEvent<ActionEvent>('ACTION_EVENT', {
      actionId,
      elementType,
      elementId,
      result: 'success',
      data
    }),

  actionFailed: (actionId: string, error: string, elementType?: string, elementId?: string) =>
    createEvent<ActionEvent>('ACTION_EVENT', {
      actionId,
      elementType,
      elementId,
      result: 'failure',
      error
    }),

  // System events
  info: (message: string, context?: any) =>
    createEvent<SystemEvent>('SYSTEM_EVENT', {
      level: 'info',
      message,
      context
    }),

  warning: (message: string, context?: any) =>
    createEvent<SystemEvent>('SYSTEM_EVENT', {
      level: 'warning',
      message,
      context
    }),

  error: (message: string, context?: any, stack?: string) =>
    createEvent<SystemEvent>('SYSTEM_EVENT', {
      level: 'error',
      message,
      context,
      stack
    })
}