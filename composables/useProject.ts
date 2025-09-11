import type { Project } from '~/types/project'
import { mockProject, mockProject1, mockProject2, mockProject3 } from '~/data/mockProject'

// Global state for project
const currentProject = ref<Project | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

export const useProject = () => {
  const { loadProject: loadStrapiProject, saveProject: saveStrapiProject, loadUserProjects } = useStrapi()
  
  const loadProject = async (projectId?: string, useStrapi = false, mockScenario?: 1 | 2 | 3): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      if (useStrapi && projectId) {
        // Load from Strapi API
        currentProject.value = await loadStrapiProject(projectId)
      } else {
        // Load mock data (default for development)
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Select mock project based on scenario
        switch (mockScenario) {
          case 1:
            currentProject.value = mockProject1
            break
          case 2:
            currentProject.value = mockProject2
            break
          case 3:
            currentProject.value = mockProject3
            break
          default:
            currentProject.value = mockProject // Default fallback
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load project'
      console.error('Error loading project:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Visual-only update - no auto-save (for guided onboarding)
  const updateProjectVisual = (project: Project): void => {
    // Update reactive state immediately for UI responsiveness only
    currentProject.value = { ...project }
    console.log('🎨 Visual-only project update (no save):', project.id)
  }

  const updateProject = (project: Project): void => {
    // Update reactive state immediately for UI responsiveness
    currentProject.value = { ...project }
    
    // Only auto-save if the project has a real ID (not mock or empty projects)
    const hasRealId = project.id && !project.id.startsWith('mock-') && !project.id.startsWith('empty-') && !project.id.includes('template')
    
    if (hasRealId) {
      // Save to Strapi asynchronously in the background (fire-and-forget)
      // Use setTimeout to avoid blocking the UI thread
      setTimeout(async () => {
        try {
          await saveStrapiProject(project) // Use simple signature like working PropertyPanel.vue
          console.log('✅ Project auto-saved to Strapi')
        } catch (error) {
          console.warn('⚠️ Auto-save to Strapi failed:', error)
          // Don't throw error to avoid disrupting user flow
        }
      }, 100) // Small delay to ensure UI updates first
    } else {
      console.log('📝 Skipping auto-save for project without real ID:', project.id)
    }
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

  const saveProject = async (project: Omit<Project, 'id'> | Project): Promise<Project> => {
    isLoading.value = true
    error.value = null

    try {
      // Use simple Strapi saveProject function - same as working PropertyPanel.vue flow
      const savedProject = await saveStrapiProject(project as Project)
      currentProject.value = savedProject
      return savedProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save project'
      console.error('Error saving project:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Load the user's current project (most recent one they own)
  const loadUserCurrentProject = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const { currentUser } = useAuth()
      
      if (!currentUser.value?.id) {
        throw new Error('User must be authenticated to load projects')
      }

      console.log('🔍 Loading current project for user:', currentUser.value.id)
      const userProjects = await loadUserProjects(currentUser.value.id)
      
      if (userProjects && userProjects.length > 0) {
        // Load the user's most recent project
        const projectToLoad = userProjects[0] // Projects are sorted by createdAt desc
        console.log(`📂 Loading user's current project: ${projectToLoad.name} (${projectToLoad.id})`)
        currentProject.value = projectToLoad
      } else {
        console.log('📭 No projects found for user, creating default project')
        // If user has no projects, create a default one
        const defaultProject = {
          name: 'My House',
          description: 'My renovation project',
          generalAttributes: {
            propertySize: { width: 2000, depth: 2000, area: 400 },
            floorSize: { width: 1500, depth: 1300, area: 195 },
            region: 'flanders'
          },
          floors: {
            '0': {
              storey: 0,
              height: 250,
              heightPosition: 0,
              color: '#f0f0f0',
              windows: {},
              doors: {}
            }
          },
          roof: {
            type: 'gable',
            width: 1500,
            depth: 1300,
            height: 250,
            heightPosition: 250
          }
        }
        
        const savedProject = await saveStrapiProject(defaultProject) // Use simple signature like working PropertyPanel.vue
        currentProject.value = savedProject
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user project'
      console.error('Error loading user project:', err)
      
      // Fallback to mock data only if everything fails
      console.log('⚠️ Using mock data as fallback')
      currentProject.value = mockProject
    } finally {
      isLoading.value = false
    }
  }

  return {
    currentProject: readonly(currentProject),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadProject,
    loadUserCurrentProject,
    updateProject,
    updateProjectVisual,
    updateProjectAsync,
    saveProject
  }
}