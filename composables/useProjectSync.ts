import type { Project } from '~/types/project'

// Helper to sync selected object with project updates
export const useProjectSync = () => {
  const { selectedObject, selectObject } = useSelection()
  const { currentProject } = useProject()

  // DISABLED: This watcher was causing selectObject spam during camera panning
  // TODO: Re-implement with better change detection that doesn't trigger on camera changes
  
  // watch(currentProject, (newProject, oldProject) => {
  //   if (!newProject || !selectedObject.value || !oldProject) return
  //   // ... rest of the watcher logic
  // }, { deep: true })

  return {
    // No return needed, just sets up watchers
  }
}