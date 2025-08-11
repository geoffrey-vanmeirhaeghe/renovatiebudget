import type { WindowOrDoor, Floor } from '~/types/project'

export interface SelectedObject {
  id: string
  type: 'window' | 'door' | 'floor' | 'roof'
  object: WindowOrDoor | Floor | any
  floorId?: string
}

// Global state for selection
const selectedObject = ref<SelectedObject | null>(null)
const isEditing = ref(false)

export const useSelection = () => {
  const selectObject = (selection: SelectedObject) => {
    selectedObject.value = selection
    isEditing.value = false
  }

  const clearSelection = () => {
    selectedObject.value = null
    isEditing.value = false
  }

  const startEditing = () => {
    if (selectedObject.value) {
      isEditing.value = true
    }
  }

  const stopEditing = () => {
    isEditing.value = false
  }

  return {
    selectedObject: readonly(selectedObject),
    isEditing: readonly(isEditing),
    selectObject,
    clearSelection,
    startEditing,
    stopEditing,
  }
}