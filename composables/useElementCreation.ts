/**
 * Element creation composable for windows and doors
 * Handles the workflow for adding new elements to floors
 */

import type { WindowOrDoor, Position } from '~/types/project'
import { DIMENSION_RANGES, SIZE_PRESETS } from '~/constants/building-standards'

export type CreationType = 'window' | 'door' | null

export const useElementCreation = () => {
  // Creation state
  const isCreating = ref(false)
  const creationType = ref<CreationType>(null)
  const targetFloorId = ref<string>('')

  const { updateProject, currentProject } = useProject()
  const { setSelection } = useSelection()
  const { getSizePresets } = useBuildingStandards()

  /**
   * Start the creation process for a specific element type
   */
  const startCreating = (type: 'window' | 'door', floorId: string) => {
    isCreating.value = true
    creationType.value = type
    targetFloorId.value = floorId
  }

  /**
   * Cancel the current creation process
   */
  const cancelCreating = () => {
    isCreating.value = false
    creationType.value = null
    targetFloorId.value = ''
  }

  /**
   * Generate a unique ID for new elements
   */
  const generateElementId = (elements: Record<string, any>): string => {
    const existingIds = Object.keys(elements)
      .map(id => parseInt(id))
      .filter(id => !isNaN(id))
    
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0
    return (maxId + 1).toString()
  }

  /**
   * Get default dimensions for element type using building standards
   */
  const getDefaultDimensions = (type: 'window' | 'door') => {
    const presets = getSizePresets()
    
    if (type === 'window') {
      // Use medium window as default
      const defaultPreset = presets.WINDOWS.find(p => p.name.includes('Medium')) || 
                           presets.WINDOWS[Math.floor(presets.WINDOWS.length / 2)]
      return {
        width: defaultPreset?.width || 80,
        height: defaultPreset?.height || 120
      }
    } else {
      // Use standard door as default
      const defaultPreset = presets.DOORS.find(p => p.name.includes('Standard')) || 
                           presets.DOORS[0]
      return {
        width: defaultPreset?.width || 80,
        height: defaultPreset?.height || 200
      }
    }
  }

  /**
   * Calculate default position based on orientation and click position
   */
  const getDefaultPosition = (
    orientation: 'front' | 'back' | 'left' | 'right',
    clickPosition?: { x: number, y: number }
  ): Position => {
    // Default to center of wall if no click position provided
    const defaultX = clickPosition?.x || 0
    
    // Windows are typically placed higher than doors
    const defaultY = creationType.value === 'door' ? 0 : 20

    return {
      orientation,
      x: defaultX,
      y: defaultY
    }
  }

  /**
   * Create a new element and add it to the project
   */
  const createElement = (
    position: Position,
    customDimensions?: { width: number, height: number }
  ) => {
    if (!isCreating.value || !creationType.value || !targetFloorId.value || !currentProject.value) {
      console.warn('Cannot create element: invalid state')
      return null
    }

    // Get dimensions
    const dimensions = customDimensions || getDefaultDimensions(creationType.value)

    // Create the new element
    const newElement: WindowOrDoor = {
      ...dimensions,
      position
    }

    // Deep clone project for reactivity
    const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
    const targetFloor = updatedProject.floors[targetFloorId.value]
    
    if (!targetFloor) {
      console.error('Target floor not found:', targetFloorId.value)
      return null
    }

    // Initialize the collection if it doesn't exist
    if (creationType.value === 'window') {
      if (!targetFloor.windows) targetFloor.windows = {}
      const elementId = generateElementId(targetFloor.windows)
      targetFloor.windows[elementId] = newElement
      
      // Update project and select the new element
      updateProject(updatedProject)
      setSelection({ type: 'window', id: elementId, floorId: targetFloorId.value })
      
      return elementId
    } else if (creationType.value === 'door') {
      if (!targetFloor.doors) targetFloor.doors = {}
      const elementId = generateElementId(targetFloor.doors)
      targetFloor.doors[elementId] = newElement
      
      // Update project and select the new element
      updateProject(updatedProject)
      setSelection({ type: 'door', id: elementId, floorId: targetFloorId.value })
      
      return elementId
    }

    return null
  }

  /**
   * Quick create element with default position
   * Useful for button-based creation
   */
  const quickCreateElement = (orientation: 'front' | 'back' | 'left' | 'right' = 'front') => {
    const position = getDefaultPosition(orientation)
    const elementId = createElement(position)
    
    if (elementId) {
      // End creation mode after successful creation
      cancelCreating()
    }
    
    return elementId
  }

  return {
    // State
    isCreating: readonly(isCreating),
    creationType: readonly(creationType),
    targetFloorId: readonly(targetFloorId),

    // Actions
    startCreating,
    cancelCreating,
    createElement,
    quickCreateElement,

    // Utilities
    getDefaultDimensions,
    getDefaultPosition,
    generateElementId
  }
}