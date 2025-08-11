import type { Project } from '~/types/project'

// Helper to sync selected object with project updates
export const useProjectSync = () => {
  const { selectedObject, selectObject } = useSelection()
  const { currentProject } = useProject()

  // Watch for project updates and sync selected object
  watch(currentProject, (newProject) => {
    if (!newProject || !selectedObject.value) return

    // Update selectedObject with fresh data from the project
    if (selectedObject.value.floorId) {
      const floor = newProject.floors[selectedObject.value.floorId]
      if (selectedObject.value.type === 'window' && floor.windows) {
        const updatedWindow = floor.windows[selectedObject.value.id]
        if (updatedWindow) {
          selectObject({
            ...selectedObject.value,
            object: updatedWindow
          })
        }
      } else if (selectedObject.value.type === 'door' && floor.doors) {
        const updatedDoor = floor.doors[selectedObject.value.id]
        if (updatedDoor) {
          selectObject({
            ...selectedObject.value,
            object: updatedDoor
          })
        }
      }
    } else if (selectedObject.value.type === 'floor') {
      const updatedFloor = newProject.floors[selectedObject.value.id]
      if (updatedFloor) {
        selectObject({
          ...selectedObject.value,
          object: updatedFloor
        })
      }
    }
  }, { deep: true })

  return {
    // No return needed, just sets up watchers
  }
}