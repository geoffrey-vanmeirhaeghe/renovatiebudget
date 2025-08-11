import type { Project } from '~/types/project'
import { mockProject } from '~/data/mockProject'

// Global state for project
const currentProject = ref<Project | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

export const useProject = () => {
  const loadProject = async (projectId?: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // For now, load mock data
      // Later this will be replaced with API calls to Strapi      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      currentProject.value = mockProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load project'
      console.error('Error loading project:', err)
    } finally {
      isLoading.value = false
    }
  }

  const updateProject = (project: Project): void => {
    // For real-time updates, don't use async/loading states
    // Just update the reactive state immediately
    currentProject.value = { ...project }
  }

  const updateProjectAsync = async (project: Project): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call for saves
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // In real implementation, this would be a PATCH/PUT request to Strapi
      currentProject.value = { ...project }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update project'
      console.error('Error updating project:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    currentProject: readonly(currentProject),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadProject,
    updateProject,
    updateProjectAsync,
  }
}