import type { WindowOrDoor, Floor } from '~/types/project'

export interface SelectedObject {
  id: string
  type: 'window' | 'door' | 'floor' | 'roof'
  object: WindowOrDoor | Floor | any
  floorId?: string
}

// Global state for selection - ensure starts as null
const selectedObject = ref<SelectedObject | null>(null)
const hoveredObject = ref<SelectedObject | null>(null)  
const isEditing = ref(false)

// Clear any initial selection on app start
if (process.client) {
  selectedObject.value = null
  hoveredObject.value = null
  console.log('Selection state cleared on client start')
  
  // Debug: Watch for any changes to selectedObject
  watch(selectedObject, (newSelection, oldSelection) => {
    console.log('selectedObject changed:', {
      from: oldSelection,
      to: newSelection,
      stack: new Error().stack
    })
  }, { immediate: true })
}

export const useSelection = () => {
  const selectObject = (selection: SelectedObject) => {
    console.log('selectObject called with:', selection)
    selectedObject.value = selection
    isEditing.value = false
  }

  const clearSelection = (source = 'unknown') => {
    if (selectedObject.value) {
      console.log('clearSelection called from:', source, 'clearing:', selectedObject.value.type, selectedObject.value.id)
      selectedObject.value = null
      isEditing.value = false
    } else {
      console.log('clearSelection called from:', source, 'but no selection to clear')
    }
  }

  const startEditing = () => {
    if (selectedObject.value) {
      isEditing.value = true
    }
  }

  const stopEditing = () => {
    isEditing.value = false
  }

  const hoverObject = (selection: SelectedObject) => {
    hoveredObject.value = selection
  }

  const clearHover = () => {
    hoveredObject.value = null
  }

  return {
    selectedObject: readonly(selectedObject),
    hoveredObject: readonly(hoveredObject),
    isEditing: readonly(isEditing),
    selectObject,
    clearSelection,
    hoverObject,
    clearHover,
    startEditing,
    stopEditing,
  }
}