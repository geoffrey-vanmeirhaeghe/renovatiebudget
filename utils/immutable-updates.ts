import type { Project, Floor, WindowOrDoor, Roof } from '~/types/project'

// Generic deep cloning utility that preserves reactivity
export function deepClone<T>(obj: T): T {
  // Use native structuredClone if available (modern browsers)
  if (typeof structuredClone !== 'undefined') {
    try {
      return structuredClone(obj)
    } catch (error) {
      console.warn('structuredClone failed, falling back to manual cloning:', error)
    }
  }
  
  // Fallback for complex objects
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

// Type-safe project updater
export class ProjectUpdater {
  private project: Project

  constructor(project: Project) {
    this.project = deepClone(project)
  }

  // Floor operations
  updateFloor(floorId: string, updates: Partial<Floor>): ProjectUpdater {
    if (this.project.floors[floorId]) {
      this.project.floors[floorId] = {
        ...this.project.floors[floorId],
        ...updates
      }
    }
    return this
  }

  addFloor(floorId: string, floor: Floor): ProjectUpdater {
    this.project.floors[floorId] = floor
    return this
  }

  removeFloor(floorId: string): ProjectUpdater {
    delete this.project.floors[floorId]
    return this
  }

  // Window operations
  updateWindow(floorId: string, windowId: string, updates: Partial<WindowOrDoor>): ProjectUpdater {
    const floor = this.project.floors[floorId]
    if (floor?.windows?.[windowId]) {
      floor.windows[windowId] = {
        ...floor.windows[windowId],
        ...updates
      }
    }
    return this
  }

  addWindow(floorId: string, windowId: string, window: WindowOrDoor): ProjectUpdater {
    const floor = this.project.floors[floorId]
    if (floor) {
      if (!floor.windows) {
        floor.windows = {}
      }
      floor.windows[windowId] = window
    }
    return this
  }

  removeWindow(floorId: string, windowId: string): ProjectUpdater {
    const floor = this.project.floors[floorId]
    if (floor?.windows?.[windowId]) {
      delete floor.windows[windowId]
    }
    return this
  }

  // Door operations
  updateDoor(floorId: string, doorId: string, updates: Partial<WindowOrDoor>): ProjectUpdater {
    const floor = this.project.floors[floorId]
    if (floor?.doors?.[doorId]) {
      floor.doors[doorId] = {
        ...floor.doors[doorId],
        ...updates
      }
    }
    return this
  }

  addDoor(floorId: string, doorId: string, door: WindowOrDoor): ProjectUpdater {
    const floor = this.project.floors[floorId]
    if (floor) {
      if (!floor.doors) {
        floor.doors = {}
      }
      floor.doors[doorId] = door
    }
    return this
  }

  removeDoor(floorId: string, doorId: string): ProjectUpdater {
    const floor = this.project.floors[floorId]
    if (floor?.doors?.[doorId]) {
      delete floor.doors[doorId]
    }
    return this
  }

  // Roof operations
  updateRoof(updates: Partial<Roof>): ProjectUpdater {
    this.project.roof = {
      ...this.project.roof,
      ...updates
    }
    return this
  }

  // General attributes operations
  updateGeneralAttributes(updates: Partial<Project['generalAttributes']>): ProjectUpdater {
    this.project.generalAttributes = {
      ...this.project.generalAttributes,
      ...updates
    }
    return this
  }

  // Element transformation operations
  transformWindowToDoor(floorId: string, windowId: string): ProjectUpdater {
    const floor = this.project.floors[floorId]
    const window = floor?.windows?.[windowId]
    
    if (window) {
      // Create door from window
      const door: WindowOrDoor = {
        ...window,
        height: 210, // Standard door height
        width: Math.min(window.width, 100) // Max door width
      }
      
      // Remove window and add door
      this.removeWindow(floorId, windowId)
      this.addDoor(floorId, windowId, door)
    }
    
    return this
  }

  transformDoorToWindow(floorId: string, doorId: string): ProjectUpdater {
    const floor = this.project.floors[floorId]
    const door = floor?.doors?.[doorId]
    
    if (door) {
      // Create window from door
      const window: WindowOrDoor = {
        ...door,
        height: 140, // Standard window height
        position: {
          ...door.position,
          y: 80 // Move window up from floor
        }
      }
      
      // Remove door and add window
      this.removeDoor(floorId, doorId)
      this.addWindow(floorId, doorId, window)
    }
    
    return this
  }

  // Duplicate operations
  duplicateWindow(floorId: string, windowId: string, newWindowId?: string): ProjectUpdater {
    const floor = this.project.floors[floorId]
    const window = floor?.windows?.[windowId]
    
    if (window) {
      const newId = newWindowId || `${windowId}_copy_${Date.now()}`
      const duplicatedWindow: WindowOrDoor = {
        ...window,
        position: {
          ...window.position,
          x: window.position.x + 50 // Offset position
        }
      }
      
      this.addWindow(floorId, newId, duplicatedWindow)
    }
    
    return this
  }

  duplicateDoor(floorId: string, doorId: string, newDoorId?: string): ProjectUpdater {
    const floor = this.project.floors[floorId]
    const door = floor?.doors?.[doorId]
    
    if (door) {
      const newId = newDoorId || `${doorId}_copy_${Date.now()}`
      const duplicatedDoor: WindowOrDoor = {
        ...door,
        position: {
          ...door.position,
          x: door.position.x + 50 // Offset position
        }
      }
      
      this.addDoor(floorId, newId, duplicatedDoor)
    }
    
    return this
  }

  // Batch operations
  batchUpdate(operations: Array<() => ProjectUpdater>): ProjectUpdater {
    operations.forEach(operation => {
      operation.call(this)
    })
    return this
  }

  // Custom update function
  customUpdate(updateFn: (project: Project) => Project): ProjectUpdater {
    this.project = updateFn(this.project)
    return this
  }

  // Get the updated project
  build(): Project {
    return this.project
  }

  // Get a specific part of the project
  getFloor(floorId: string): Floor | undefined {
    return this.project.floors[floorId]
  }

  getWindow(floorId: string, windowId: string): WindowOrDoor | undefined {
    return this.project.floors[floorId]?.windows?.[windowId]
  }

  getDoor(floorId: string, doorId: string): WindowOrDoor | undefined {
    return this.project.floors[floorId]?.doors?.[doorId]
  }

  getRoof(): Roof {
    return this.project.roof
  }
}

// Convenience functions for common operations
export function updateProject(project: Project): ProjectUpdater {
  return new ProjectUpdater(project)
}

// Helper functions for specific updates
export function updateElementProperty<T>(
  project: Project,
  elementType: 'floor' | 'window' | 'door' | 'roof',
  elementId: string,
  property: string,
  value: T,
  floorId?: string
): Project {
  const updater = new ProjectUpdater(project)
  
  switch (elementType) {
    case 'floor':
      return updater.updateFloor(elementId, { [property]: value }).build()
      
    case 'window':
      if (!floorId) throw new Error('floorId required for window updates')
      return updater.updateWindow(floorId, elementId, { [property]: value }).build()
      
    case 'door':
      if (!floorId) throw new Error('floorId required for door updates')
      return updater.updateDoor(floorId, elementId, { [property]: value }).build()
      
    case 'roof':
      return updater.updateRoof({ [property]: value }).build()
      
    default:
      return project
  }
}

// Position update helper
export function updateElementPosition(
  project: Project,
  elementType: 'window' | 'door',
  elementId: string,
  floorId: string,
  position: Partial<{ x: number; y: number; orientation: string }>
): Project {
  const updater = new ProjectUpdater(project)
  
  if (elementType === 'window') {
    const window = updater.getWindow(floorId, elementId)
    if (window) {
      return updater.updateWindow(floorId, elementId, {
        position: { ...window.position, ...position }
      }).build()
    }
  } else if (elementType === 'door') {
    const door = updater.getDoor(floorId, elementId)
    if (door) {
      return updater.updateDoor(floorId, elementId, {
        position: { ...door.position, ...position }
      }).build()
    }
  }
  
  return project
}

// Size update helper
export function updateElementSize(
  project: Project,
  elementType: 'floor' | 'window' | 'door',
  elementId: string,
  size: { width?: number; height?: number },
  floorId?: string
): Project {
  const updater = new ProjectUpdater(project)
  
  switch (elementType) {
    case 'floor':
      return updater.updateFloor(elementId, size).build()
      
    case 'window':
      if (!floorId) throw new Error('floorId required for window updates')
      return updater.updateWindow(floorId, elementId, size).build()
      
    case 'door':
      if (!floorId) throw new Error('floorId required for door updates')
      return updater.updateDoor(floorId, elementId, size).build()
      
    default:
      return project
  }
}

// Roof positioning helper with automatic floor height calculation
export function updateRoofPosition(project: Project): Project {
  const updater = new ProjectUpdater(project)
  
  // Calculate the highest point of all floors
  let maxPosition = 0
  Object.values(project.floors).forEach(floor => {
    const topPosition = floor.heightPosition + floor.height
    if (topPosition > maxPosition) {
      maxPosition = topPosition
    }
  })
  
  return updater.updateRoof({ heightPosition: maxPosition }).build()
}

// Type-safe property path update
export function updateByPath<T>(
  obj: T,
  path: string[],
  value: any
): T {
  const cloned = deepClone(obj)
  let current: any = cloned
  
  for (let i = 0; i < path.length - 1; i++) {
    if (current[path[i]] === undefined) {
      current[path[i]] = {}
    }
    current = current[path[i]]
  }
  
  current[path[path.length - 1]] = value
  return cloned
}

// Validation helper for updates
export function validateUpdate(
  elementType: string,
  property: string,
  value: any
): { valid: boolean; error?: string } {
  // Add validation logic based on element configurations
  // This could integrate with the ElementConfigs from types/project.ts
  
  // Basic validation examples
  if (property === 'width' || property === 'height') {
    if (typeof value !== 'number' || value <= 0) {
      return { valid: false, error: `${property} must be a positive number` }
    }
  }
  
  if (property === 'orientation') {
    const validOrientations = ['front', 'back', 'left', 'right']
    if (!validOrientations.includes(value)) {
      return { valid: false, error: 'Invalid orientation' }
    }
  }
  
  return { valid: true }
}