import { defineStore } from 'pinia'
import type { Project, Floor, WindowOrDoor, Roof } from '~/types/project'
import { mockProject } from '~/data/mockProject'

// Flexible event system for future extensibility
export interface ProjectEvent {
  type: string
  payload?: any
  timestamp: number
}

// Selection state interface - extensible for future element types
export interface SelectionState {
  selectedObject: SelectedObject | null
  hoveredObject: SelectedObject | null
  isEditing: boolean
  isSelectionReady: boolean
}

export interface SelectedObject {
  id: string
  type: 'window' | 'door' | 'floor' | 'roof' | string // Allow future types
  object: any // Flexible typing for future element types
  floorId?: string
  metadata?: Record<string, any> // Extensible metadata
}

// Project update operations - immutable patterns
export interface ProjectUpdateOperation {
  type: 'SET_PROJECT' | 'UPDATE_ELEMENT' | 'ADD_ELEMENT' | 'REMOVE_ELEMENT' | 'BULK_UPDATE'
  path?: string[]
  value?: any
  floorId?: string
  elementType?: string
  elementId?: string
}

// Store state interface with flexible structure
export interface ProjectStoreState {
  // Core project data
  currentProject: Project | null
  isLoading: boolean
  error: string | null
  
  // Selection management
  selection: SelectionState
  
  // UI state (flexible for future additions)
  uiState: {
    selectedTool: any | null
    selectedCategory: string | null
    categoryName: string | null
    categoryTools: any[]
    isCreatingElement: boolean
    creatingElementType: string | null
    creatingFloorId: string | null
  }
  
  // Event system for extensibility
  events: ProjectEvent[]
  maxEvents: number
  
  // Future extensibility placeholders
  plugins: Record<string, any>
  metadata: Record<string, any>
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectStoreState => ({
    // Core project data
    currentProject: null,
    isLoading: false,
    error: null,
    
    // Selection management
    selection: {
      selectedObject: null,
      hoveredObject: null,
      isEditing: false,
      isSelectionReady: false
    },
    
    // UI state
    uiState: {
      selectedTool: null,
      selectedCategory: null,
      categoryName: null,
      categoryTools: [],
      isCreatingElement: false,
      creatingElementType: null,
      creatingFloorId: null
    },
    
    // Event system
    events: [],
    maxEvents: 100,
    
    // Extensibility
    plugins: {},
    metadata: {}
  }),

  getters: {
    // Project getters
    hasProject: (state) => state.currentProject !== null,
    
    // Selection getters
    hasSelection: (state) => state.selection.selectedObject !== null,
    selectedType: (state) => state.selection.selectedObject?.type,
    selectedId: (state) => state.selection.selectedObject?.id,
    selectedFloorId: (state) => state.selection.selectedObject?.floorId,
    
    // Current selected object with type safety
    currentSelectedElement: (state) => {
      const selection = state.selection.selectedObject
      if (!selection || !state.currentProject) return null
      
      const { type, id, floorId } = selection
      
      if (type === 'floor') {
        return state.currentProject.floors[id]
      }
      
      if (type === 'roof') {
        return state.currentProject.roof
      }
      
      if ((type === 'window' || type === 'door') && floorId) {
        const floor = state.currentProject.floors[floorId]
        const objects = type === 'window' ? floor?.windows : floor?.doors
        return objects?.[id]
      }
      
      return null
    },
    
    // UI state getters
    isCreating: (state) => state.uiState.isCreatingElement,
    hasSelectedTool: (state) => state.uiState.selectedTool !== null,
    hasSelectedCategory: (state) => state.uiState.selectedCategory !== null,
    
    // Flexible element type checking
    isElementType: (state) => (type: string) => {
      return state.selection.selectedObject?.type === type
    },
    
    // Recent events for debugging/monitoring
    recentEvents: (state) => state.events.slice(-10)
  },

  actions: {
    // Event system for debugging and extensibility
    addEvent(type: string, payload?: any) {
      const event: ProjectEvent = {
        type,
        payload,
        timestamp: Date.now()
      }
      
      this.events.push(event)
      
      // Keep only recent events
      if (this.events.length > this.maxEvents) {
        this.events = this.events.slice(-this.maxEvents)
      }
    },

    // Project management actions
    async loadProject(projectId?: string, useStrapi = false, mockScenario?: 1 | 2 | 3) {
      this.isLoading = true
      this.error = null
      this.addEvent('LOAD_PROJECT_START', { projectId, useStrapi, mockScenario })

      try {
        if (useStrapi && projectId) {
          const { loadProject: loadStrapiProject } = useStrapi()
          this.currentProject = await loadStrapiProject(projectId)
        } else {
          // Load mock data (default for development)
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Select mock project based on scenario
          let selectedProject = mockProject
          if (mockScenario === 1) {
            const { mockProject1 } = await import('~/data/mockProject')
            selectedProject = mockProject1
          } else if (mockScenario === 2) {
            const { mockProject2 } = await import('~/data/mockProject')
            selectedProject = mockProject2
          } else if (mockScenario === 3) {
            const { mockProject3 } = await import('~/data/mockProject')
            selectedProject = mockProject3
          }
          
          this.currentProject = selectedProject
        }
        
        this.addEvent('LOAD_PROJECT_SUCCESS', { projectId: this.currentProject?.id })
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load project'
        this.addEvent('LOAD_PROJECT_ERROR', { error: this.error })
        console.error('Error loading project:', err)
      } finally {
        this.isLoading = false
      }
    },

    // Immutable project updates with flexible operations
    updateProject(operation: ProjectUpdateOperation) {
      if (!this.currentProject) return
      
      this.addEvent('PROJECT_UPDATE', operation)
      
      // Create deep copy for immutability
      const updatedProject = this.createProjectCopy(this.currentProject)
      
      switch (operation.type) {
        case 'SET_PROJECT':
          if (operation.value) {
            this.currentProject = operation.value
          }
          break
          
        case 'UPDATE_ELEMENT':
          this.updateElementInProject(updatedProject, operation)
          this.currentProject = updatedProject
          break
          
        case 'ADD_ELEMENT':
          this.addElementToProject(updatedProject, operation)
          this.currentProject = updatedProject
          break
          
        case 'REMOVE_ELEMENT':
          this.removeElementFromProject(updatedProject, operation)
          this.currentProject = updatedProject
          break
          
        case 'BULK_UPDATE':
          // For complex updates that need custom logic
          if (operation.value && typeof operation.value === 'function') {
            this.currentProject = operation.value(updatedProject)
          }
          break
      }
    },

    // Selection management with flexible typing
    selectObject(selection: SelectedObject) {
      this.addEvent('SELECT_OBJECT', selection)
      this.selection.selectedObject = selection
      this.selection.isEditing = false
    },

    clearSelection() {
      if (this.selection.selectedObject) {
        this.addEvent('CLEAR_SELECTION', { 
          previousSelection: this.selection.selectedObject 
        })
      }
      this.selection.selectedObject = null
      this.selection.isEditing = false
    },

    hoverObject(selection: SelectedObject) {
      this.selection.hoveredObject = selection
    },

    clearHover() {
      this.selection.hoveredObject = null
    },

    setSelectionReady(ready: boolean) {
      this.selection.isSelectionReady = ready
      this.addEvent('SELECTION_READY_CHANGED', { ready })
    },

    startEditing() {
      if (this.selection.selectedObject) {
        this.selection.isEditing = true
        this.addEvent('START_EDITING', { object: this.selection.selectedObject })
      }
    },

    stopEditing() {
      this.selection.isEditing = false
      this.addEvent('STOP_EDITING')
    },

    // UI state management
    setSelectedTool(tool: any) {
      this.uiState.selectedTool = tool
      this.addEvent('TOOL_SELECTED', tool)
    },

    clearSelectedTool() {
      this.uiState.selectedTool = null
      this.addEvent('TOOL_CLEARED')
    },

    setSelectedCategory(category: string, categoryName?: string, tools?: any[]) {
      this.uiState.selectedCategory = category
      this.uiState.categoryName = categoryName || null
      this.uiState.categoryTools = tools || []
      this.addEvent('CATEGORY_SELECTED', { category, categoryName, tools })
    },

    clearSelectedCategory() {
      this.uiState.selectedCategory = null
      this.uiState.categoryName = null
      this.uiState.categoryTools = []
      this.addEvent('CATEGORY_CLEARED')
    },

    startCreatingElement(type: string, floorId?: string) {
      this.uiState.isCreatingElement = true
      this.uiState.creatingElementType = type
      this.uiState.creatingFloorId = floorId || null
      this.addEvent('START_CREATING_ELEMENT', { type, floorId })
    },

    stopCreatingElement() {
      this.uiState.isCreatingElement = false
      this.uiState.creatingElementType = null
      this.uiState.creatingFloorId = null
      this.addEvent('STOP_CREATING_ELEMENT')
    },

    // Plugin system for extensibility
    registerPlugin(name: string, plugin: any) {
      this.plugins[name] = plugin
      this.addEvent('PLUGIN_REGISTERED', { name })
    },

    unregisterPlugin(name: string) {
      delete this.plugins[name]
      this.addEvent('PLUGIN_UNREGISTERED', { name })
    },

    // Helper methods for immutable updates using new utilities
    createProjectCopy(project: Project): Project {
      const { deepClone } = await import('~/utils/immutable-updates')
      return deepClone(project)
    },

    updateElementInProject(project: Project, operation: ProjectUpdateOperation) {
      const { floorId, elementType, elementId, value } = operation
      const { ProjectUpdater } = await import('~/utils/immutable-updates')
      const updater = new ProjectUpdater(project)
      
      if (elementType === 'floor' && elementId) {
        return updater.updateFloor(elementId, value).build()
      } else if (elementType === 'roof') {
        return updater.updateRoof(value).build()
      } else if (elementType === 'window' && floorId && elementId) {
        return updater.updateWindow(floorId, elementId, value).build()
      } else if (elementType === 'door' && floorId && elementId) {
        return updater.updateDoor(floorId, elementId, value).build()
      }
      
      return project
    },

    addElementToProject(project: Project, operation: ProjectUpdateOperation) {
      const { floorId, elementType, elementId, value } = operation
      const { ProjectUpdater } = await import('~/utils/immutable-updates')
      const updater = new ProjectUpdater(project)
      
      if (elementType === 'floor' && elementId) {
        return updater.addFloor(elementId, value).build()
      } else if (elementType === 'window' && floorId && elementId) {
        return updater.addWindow(floorId, elementId, value).build()
      } else if (elementType === 'door' && floorId && elementId) {
        return updater.addDoor(floorId, elementId, value).build()
      }
      
      return project
    },

    removeElementFromProject(project: Project, operation: ProjectUpdateOperation) {
      const { floorId, elementType, elementId } = operation
      const { ProjectUpdater } = await import('~/utils/immutable-updates')
      const updater = new ProjectUpdater(project)
      
      if (elementType === 'floor' && elementId) {
        return updater.removeFloor(elementId).build()
      } else if (elementType === 'window' && floorId && elementId) {
        return updater.removeWindow(floorId, elementId).build()
      } else if (elementType === 'door' && floorId && elementId) {
        return updater.removeDoor(floorId, elementId).build()
      }
      
      return project
    },

    // Convenience methods for common operations
    async updateElementProperty(elementType: string, elementId: string, property: string, value: any, floorId?: string) {
      if (!this.currentProject) return

      const { updateElementProperty } = await import('~/utils/immutable-updates')
      const updatedProject = updateElementProperty(
        this.currentProject,
        elementType as any,
        elementId,
        property,
        value,
        floorId
      )
      
      this.updateProject({ type: 'SET_PROJECT', value: updatedProject })
    },

    async duplicateElement(elementType: string, elementId: string, floorId?: string) {
      if (!this.currentProject) return

      const { ProjectUpdater } = await import('~/utils/immutable-updates')
      const updater = new ProjectUpdater(this.currentProject)
      
      let updatedProject = this.currentProject
      
      if (elementType === 'window' && floorId) {
        updatedProject = updater.duplicateWindow(floorId, elementId).build()
      } else if (elementType === 'door' && floorId) {
        updatedProject = updater.duplicateDoor(floorId, elementId).build()
      }
      
      this.updateProject({ type: 'SET_PROJECT', value: updatedProject })
    },

    async transformElement(elementType: string, elementId: string, targetType: string, floorId?: string) {
      if (!this.currentProject || !floorId) return

      const { ProjectUpdater } = await import('~/utils/immutable-updates')
      const updater = new ProjectUpdater(this.currentProject)
      
      let updatedProject = this.currentProject
      
      if (elementType === 'window' && targetType === 'door') {
        updatedProject = updater.transformWindowToDoor(floorId, elementId).build()
      } else if (elementType === 'door' && targetType === 'window') {
        updatedProject = updater.transformDoorToWindow(floorId, elementId).build()
      }
      
      this.updateProject({ type: 'SET_PROJECT', value: updatedProject })
    }
  }
})

// Backward compatibility helpers
export const useProject = () => {
  const store = useProjectStore()
  
  return {
    currentProject: computed(() => store.currentProject),
    isLoading: computed(() => store.isLoading),
    error: computed(() => store.error),
    
    // Legacy methods that delegate to store
    loadProject: store.loadProject,
    updateProject: (project: Project) => {
      store.updateProject({ type: 'SET_PROJECT', value: project })
    },
    updateProjectAsync: async (project: Project) => {
      store.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        store.updateProject({ type: 'SET_PROJECT', value: project })
      } finally {
        store.isLoading = false
      }
    }
  }
}

// Enhanced selection hook that uses store
export const useSelection = () => {
  const store = useProjectStore()
  
  return {
    selectedObject: computed(() => store.selection.selectedObject),
    hoveredObject: computed(() => store.selection.hoveredObject),
    isEditing: computed(() => store.selection.isEditing),
    
    selectObject: store.selectObject,
    clearSelection: store.clearSelection,
    hoverObject: store.hoverObject,
    clearHover: store.clearHover,
    startEditing: store.startEditing,
    stopEditing: store.stopEditing
  }
}