import type { WindowOrDoor, Floor, Roof } from '~/types/project'
import type { SelectedObject } from '~/composables/useSelection'

// Define all element types for type safety and extensibility
export type ElementType = 'floor' | 'window' | 'door' | 'roof' | 'wall' | 'furniture'

// Element type to data type mapping for type safety
export type ElementDataMapping = {
  floor: Floor
  window: WindowOrDoor
  door: WindowOrDoor
  roof: Roof
  wall: any // Future expansion
  furniture: any // Future expansion
}

// Color configuration for each element type
export interface ElementColorConfig {
  default: string
  selected: string
}

const ELEMENT_COLORS: Record<ElementType, ElementColorConfig> = {
  floor: {
    default: '', // Uses floor.color from data
    selected: '#ffaa44'
  },
  window: {
    default: '#bdd7ff',
    selected: '#ff6b35'
  },
  door: {
    default: '#5c6063',
    selected: '#ff6b35'
  },
  roof: {
    default: '#8B4513', // Brown default for roof
    selected: '#ff6b35'
  },
  wall: {
    default: '#f5f5f5', // Light gray for walls (future)
    selected: '#ff6b35'
  },
  furniture: {
    default: '#deb887', // Burlywood for furniture (future)
    selected: '#ff6b35'
  }
}

/**
 * Global selection helper for 3D elements
 * Centralizes selection logic, color management, and initialization handling
 */
export const useElementSelection = () => {
  const { selectedObject, selectObject, clearSelection, hoverObject, clearHover } = useSelection()

  // Initialization state management - prevents premature selections
  const isSelectionReady = ref(false)
  
  // Initialize the selection system after component mount
  const initializeSelection = (delayMs = 1000) => {
    isSelectionReady.value = false
    setTimeout(() => {
      isSelectionReady.value = true
      console.log('Element selection system initialized, selections now allowed')
    }, delayMs)
  }

  /**
   * Generic selection function for any element type
   * Handles initialization blocking and standardized object format
   */
  const selectElement = <T extends ElementType>(
    type: T,
    id: string,
    object: ElementDataMapping[T],
    floorId?: string
  ) => {
    // Block selection during initialization
    if (!isSelectionReady.value) {
      console.log(`BLOCKED ${type} selection during initialization:`, id)
      return
    }

    // Normalize ID to string for consistent handling
    const normalizedId = String(id)
    
    // Create standardized selection object
    const selectionObject: SelectedObject = {
      id: normalizedId,
      type: type as any, // Current SelectedObject type is more restrictive
      object,
      floorId: floorId ? String(floorId) : undefined
    }

    console.log(`Selecting ${type}:`, selectionObject)
    selectObject(selectionObject)
  }

  /**
   * Generic hover function for any element type
   */
  const hoverElement = <T extends ElementType>(
    type: T,
    id: string,
    object: ElementDataMapping[T],
    floorId?: string
  ) => {
    const normalizedId = String(id)
    
    const hoverObject_: SelectedObject = {
      id: normalizedId,
      type: type as any,
      object,
      floorId: floorId ? String(floorId) : undefined
    }

    hoverObject(hoverObject_)
  }

  /**
   * Get computed color for any element type
   * Handles selection highlighting automatically
   */
  const getElementColor = (
    type: ElementType,
    id: string,
    floorId?: string,
    customDefaultColor?: string
  ) => {
    return computed(() => {
      const current = selectedObject.value
      
      // Get color config for this element type
      const colorConfig = ELEMENT_COLORS[type]
      let defaultColor = customDefaultColor || colorConfig.default
      
      // Special handling for floors - use the floor's color property
      if (type === 'floor' && !customDefaultColor) {
        // This will be overridden in specific implementations where floor object is available
        defaultColor = colorConfig.default
      }

      // Check if this element is selected
      if (!current || current.type !== type) {
        return defaultColor
      }

      const normalizedCurrentId = String(current.id)
      const normalizedElementId = String(id)
      
      // For elements with floor association (windows, doors), check both ID and floor
      if (floorId && current.floorId) {
        const normalizedCurrentFloorId = String(current.floorId)
        const normalizedFloorId = String(floorId)
        
        return normalizedCurrentId === normalizedElementId && 
               normalizedCurrentFloorId === normalizedFloorId 
          ? colorConfig.selected 
          : defaultColor
      }
      
      // For elements without floor association (floors, roof), check only ID
      return normalizedCurrentId === normalizedElementId 
        ? colorConfig.selected 
        : defaultColor
    })
  }

  /**
   * Convenience functions for specific element types
   * These maintain backward compatibility with existing code
   */
  const selectFloor = (id: string | number, floor: Floor) => {
    selectElement('floor', String(id), floor)
  }

  const selectWindow = (id: string, window: WindowOrDoor, floorId: string | number) => {
    selectElement('window', id, window, String(floorId))
  }

  const selectDoor = (id: string, door: WindowOrDoor, floorId: string | number) => {
    selectElement('door', id, door, String(floorId))
  }

  const selectRoof = (roof: Roof) => {
    selectElement('roof', 'roof', roof)
  }

  /**
   * Convenience hover functions
   */
  const hoverFloor = (id: string | number, floor: Floor) => {
    hoverElement('floor', String(id), floor)
  }

  const hoverWindow = (id: string, window: WindowOrDoor, floorId: string | number) => {
    hoverElement('window', id, window, String(floorId))
  }

  const hoverDoor = (id: string, door: WindowOrDoor, floorId: string | number) => {
    hoverElement('door', id, door, String(floorId))
  }

  /**
   * Convenience color functions with proper typing
   */
  const getFloorColor = (floorId: string | number, floor: Floor) => {
    return computed(() => {
      const current = selectedObject.value
      
      // Use floor's default color
      if (!current || current.type !== 'floor') {
        return floor.color
      }
      
      const normalizedCurrentId = String(current.id)
      const normalizedFloorId = String(floorId)
      
      return normalizedCurrentId === normalizedFloorId 
        ? ELEMENT_COLORS.floor.selected 
        : floor.color
    })
  }

  const getWindowColor = (windowId: string, floorId: string | number) => {
    return getElementColor('window', windowId, String(floorId))
  }

  const getDoorColor = (doorId: string, floorId: string | number) => {
    return getElementColor('door', doorId, String(floorId))
  }

  const getRoofColor = () => {
    return getElementColor('roof', 'roof')
  }

  return {
    // Core selection system
    selectElement,
    hoverElement,
    getElementColor,
    
    // Initialization management
    isSelectionReady: readonly(isSelectionReady),
    initializeSelection,
    
    // Backward-compatible convenience functions
    selectFloor,
    selectWindow,
    selectDoor,
    selectRoof,
    hoverFloor,
    hoverWindow,
    hoverDoor,
    
    // Color functions
    getFloorColor,
    getWindowColor,
    getDoorColor,
    getRoofColor,
    
    // Re-export core selection functions for convenience
    clearSelection,
    clearHover,
    selectedObject,
    
    // Color configuration (for extensibility)
    ELEMENT_COLORS
  }
}