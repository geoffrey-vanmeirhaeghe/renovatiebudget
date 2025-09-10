<template>
  <div class="builder-container">
    <!-- 3D Builder View -->
    <div class="builder-view">
      <!-- Simple Menu (top-left) -->
      <SimpleMenu />
      
      <!-- Category Navigation (top-right) -->
      <CategoryButtons 
        :is-onboarding-mode="isOnboardingMode"
        @category-selected="onCategorySelected"
        @category-deselected="onCategoryDeselected"
      />
      
      <!-- Tool Tooltip (shows instructions for selected tool) -->
      <ToolTooltip 
        :selected-tool="selectedTool"
        @clear-tool="clearToolSelection"
      />
      
      <!-- Main 3D Visualization -->
      <div class="visualization-area">
        <House v-if="displayProject" :project="displayProject" />
      </div>
      
      <!-- Left Side Context Panel -->
      <SidePanel 
        :selected-tool="selectedTool"
        :selected-category="selectedCategory"
        :category-name="selectedCategoryName"
        :category-tools="selectedCategoryTools"
        :actions-handler="actionsHandler"
        @clear-tool-selection="clearToolSelection"
        @element-action="handleElementAction"
        @tool-selected="onToolSelected"
        @category-deselected="onCategoryDeselected"
      />
      
      <!-- Actions Handler (modals, confirmations, etc.) -->
      <PropertyPanelActions ref="actionsHandler" />
      
      <!-- Guided Onboarding Panel -->
      <BuilderGuidePanel 
        v-model="showGuide"
        @house-completed="onHouseCompleted"
        @guide-cancelled="onGuideCancelled"
        @update-project="onProjectUpdate"
      />
      
      <!-- Onboarding Completion Card -->
      <OnboardingCompleteCard
        v-model="showCompletionPanel"
        @continue-building="continueBuilding"
        @go-to-dashboard="goToDashboard"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'onboarding']
})

import SimpleMenu from '~/components/ui/SimpleMenu.vue'
import CategoryButtons from '~/components/ui/CategoryButtons.vue'
import SidePanel from '~/components/ui/SidePanel.vue'
import PropertyPanelActions from '~/components/ui/PropertyPanelActions.vue'
import House from '~/components/renderings/house.vue'
import ToolTooltip from '~/components/ui/ToolTooltip.vue'
import BuilderGuidePanel from '~/components/onboarding/BuilderGuidePanel.vue'
import OnboardingCompleteCard from '~/components/ui/OnboardingCompleteCard.vue'

// Protect this page with authentication and onboarding checks
definePageMeta({
  middleware: ['auth', 'onboarding']
})

interface ToolItem {
  id: string
  name: string
  icon: string
  action: string
}

// Get authentication state
const { currentUser, getUserRegion, logout, fetchUserProfile } = useAuth()

// Get project data
const { currentProject, loadProject, updateProject } = useProject()

// Store the guided project temporarily
const guidedProject = ref(null)

// Use guided project during onboarding, otherwise use current project
const displayProject = computed(() => {
  if (isOnboardingMode.value) {
    // During onboarding, only show project if we have one from the guide
    return guidedProject.value
  }
  return currentProject.value
})

// User phase detection for guided onboarding
const userPhase = ref<string>('')
const showGuide = ref(false)
const isOnboardingMode = ref(false)
const showCompletionPanel = ref(false)

// Check if user is in onboarding phase
onMounted(async () => {
  if (currentUser.value) {
    userPhase.value = currentUser.value.userPhase || 'onboarding'
    
    // Show guide if user is in project-setup phase (just finished onboarding)
    if (userPhase.value === 'project-setup') {
      isOnboardingMode.value = true
      showGuide.value = true
    }
  }
})

// Tool and category management for 3D mode
const selectedCategory = ref<string | null>('layout') // Default to layout category
const selectedCategoryName = ref('Layout & Structure')
const selectedCategoryTools = ref<ToolItem[]>([])
const selectedTool = ref<ToolItem | null>(null)
const actionsHandler = ref()

// Handle category selection from CategoryButtons
const onCategorySelected = (categoryId: string, tools: ToolItem[]) => {
  selectedCategory.value = categoryId
  selectedCategoryTools.value = tools
  
  // Set friendly category names
  const categoryNames: Record<string, string> = {
    'layout': 'Layout & Structure',
    'energy': 'Energy Systems',
    'insulation': 'Insulation',
    'plumbing': 'Plumbing',
    'electrical': 'Electrical',
    'finishes': 'Finishes',
    'outdoor': 'Outdoor'
  }
  
  selectedCategoryName.value = categoryNames[categoryId] || 'Tools'
  clearToolSelection() // Clear any previously selected tool
}

// Handle category deselection
const onCategoryDeselected = () => {
  selectedCategory.value = null
  selectedCategoryName.value = ''
  selectedCategoryTools.value = []
  clearToolSelection()
}

// Handle tool selection from SidePanel
const onToolSelected = (tool: ToolItem) => {
  selectedTool.value = tool
  
  // Handle special tool actions that need confirmation
  if (tool.action === 'clearHouse' && actionsHandler.value) {
    actionsHandler.value.showClearHouseConfirmation()
    return
  }
  
  console.log(`Tool selected: ${tool.name} (${tool.action})`)
}

// Clear selected tool
const clearToolSelection = () => {
  selectedTool.value = null
}

// Handle element actions from SidePanel
const handleElementAction = (action: string, data?: any) => {
  if (!actionsHandler.value) return
  
  switch (action) {
    case 'delete':
      actionsHandler.value.deleteSelectedElement()
      break
    case 'duplicate':
      actionsHandler.value.duplicateSelectedElement()
      break
    case 'transformToDoor':
      actionsHandler.value.transformToDoor()
      break
    case 'transformToWindow':
      actionsHandler.value.transformToWindow()
      break
    case 'clearFloor':
      actionsHandler.value.showClearFloorConfirmation()
      break
    default:
      console.log(`Unhandled element action: ${action}`, data)
  }
}

// Handle guided house creation completion
const onHouseCompleted = async (houseConfiguration: any) => {
  try {
    console.log('🏠 House completed with configuration:', houseConfiguration)
    
    // Create new project from guided configuration
    const newProject = createProjectFromGuide(houseConfiguration)
    
    // Load the new project into the builder
    const { updateProject } = useProject()
    await updateProject(newProject)
    
    // Update user phase to 'onboarded' using the same approach as onboarding completion
    try {
      const token = useCookie('auth-token')
      const config = useRuntimeConfig()
      
      await $fetch(`${config.public.strapi.baseURL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        },
        body: {
          userPhase: 'onboarded'
        }
      })
      
      userPhase.value = 'onboarded'
      console.log('✅ User phase updated to onboarded')
    } catch (error) {
      console.warn('Could not update user phase:', error)
    }
    
    // Hide the guide and show completion panel
    showGuide.value = false
    showCompletionPanel.value = true
    
    console.log('✅ House creation completed successfully!')
  } catch (error) {
    console.error('Error completing house creation:', error)
  }
}

// Handle guide cancellation
const onGuideCancelled = () => {
  console.log('❌ House creation guide cancelled')
  showGuide.value = false
}

const continueBuilding = () => {
  // Exit onboarding mode and show all tools
  isOnboardingMode.value = false
  console.log('✅ Continuing with full builder tools')
}

const goToDashboard = async () => {
  // Navigate to dashboard
  await navigateTo('/dashboard')
}

// Handle real-time project updates from guide panel
const onProjectUpdate = (projectData: any) => {
  console.log('📝 Updating project from guide:', projectData)
  guidedProject.value = projectData
  
  // Update the current project to show changes in 3D
  if (updateProject) {
    updateProject(projectData)
  }
}

// Create a project from guided configuration
const createProjectFromGuide = (config: any) => {
  const baseProject = {
    id: `guided-${Date.now()}`,
    name: 'My House Project',
    description: 'Created through guided onboarding',
    generalAttributes: {
      propertySize: {
        width: config.propertySize.width,
        depth: config.propertySize.depth
      },
      floorSize: {
        width: config.propertySize.width - 100, // Leave some margin
        depth: config.propertySize.depth - 100
      }
    },
    floors: {},
    roof: null
  }

  // Add floors from configuration
  for (let i = 0; i < config.floorCount; i++) {
    const floorId = `floor-${i}`
    baseProject.floors[floorId] = {
      id: floorId,
      storey: i,
      height: config.floorHeight || 280,
      heightPosition: i * (config.floorHeight || 280),
      positionX: 0,
      positionZ: 0,
      doors: {},
      windows: {}
    }
  }

  // Add roof if configured
  if (config.roof && config.roof.type !== 'none') {
    baseProject.roof = {
      type: config.roof.type,
      height: 200,
      width: config.propertySize.width,
      depth: config.propertySize.depth,
      positionX: 0,
      positionZ: 0
    }
  }

  return baseProject
}

// Load project data on mount
onMounted(async () => {
  try {
    const { loadProject } = useProject()
    console.log('🏗️ Loading 3D builder with user context')
    console.log('User:', currentUser.value?.firstName)
    
    // Check user phase to determine if we need guided onboarding
    const userProfile = await fetchUserProfile()
    userPhase.value = userProfile?.userPhase || ''
    
    if (userProfile?.userPhase === 'project-setup') {
      console.log('🏠 New user in project setup - showing guided onboarding')
      
      // Create a completely empty project for guided onboarding
      const { updateProject } = useProject()
      const emptyProject = {
        id: `empty-${Date.now()}`,
        name: 'New House Project',
        description: 'Building your first house',
        generalAttributes: {
          propertySize: {
            width: 1600,
            depth: 1400
          },
          floorSize: {
            width: 1500,
            depth: 1300
          }
        },
        floors: {},
        roof: null
      }
      
      updateProject(emptyProject)
      console.log('📝 Created empty project for guided onboarding:', emptyProject)
      
      // Show the guided onboarding
      showGuide.value = true
      console.log('✨ Guided onboarding activated')
    } else {
      console.log('👤 Existing user - loading regular builder')
      // Load project data (fallback to mock if Strapi unavailable)
      try {
        await loadProject('ca66f5looy2mij5rua9yj987', true)
      } catch (strapiError) {
        console.error('Failed to load Strapi data, falling back to mock data:', strapiError)
        await loadProject()
      }
      
      // Set layout category as active by default for regular users
      const layoutTools: ToolItem[] = [
        { id: 'add-floor', name: 'Add Floor', icon: '🏢', action: 'addFloor' },
        { id: 'add-window', name: 'Add Window', icon: '🪟', action: 'addWindow' },
        { id: 'add-door', name: 'Add Door', icon: '🚪', action: 'addDoor' },
        { id: 'edit-walls', name: 'Edit Walls', icon: '🧱', action: 'editWalls' },
        { id: 'room-config', name: 'Room Configuration', icon: '📐', action: 'roomConfig' },
        { id: 'clear-house', name: 'Clear House', icon: '🧹', action: 'clearHouse' }
      ]
      selectedCategoryTools.value = layoutTools
    }
  } catch (error) {
    console.error('Error in builder setup:', error)
    // Final fallback - ensure we have a project
    const { loadProject } = useProject()
    await loadProject()
    
    // Default to regular UI on error
    const layoutTools: ToolItem[] = [
      { id: 'add-floor', name: 'Add Floor', icon: '🏢', action: 'addFloor' },
      { id: 'add-window', name: 'Add Window', icon: '🪟', action: 'addWindow' },
      { id: 'add-door', name: 'Add Door', icon: '🚪', action: 'addDoor' },
      { id: 'edit-walls', name: 'Edit Walls', icon: '🧱', action: 'editWalls' },
      { id: 'room-config', name: 'Room Configuration', icon: '📐', action: 'roomConfig' },
      { id: 'clear-house', name: 'Clear House', icon: '🧹', action: 'clearHouse' }
    ]
    selectedCategoryTools.value = layoutTools
  }
})
</script>

<style scoped>
.builder-container {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}


/* 3D Builder View */
.builder-view {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.visualization-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  padding-top: 80px; /* Account for combined navigation height */
  padding-bottom: 400px;
  padding-left: 60px;
}

/* Ensure TresJS canvas takes full size */
.visualization-area canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .visualization-area {
    padding-bottom: 350px;
    padding-top: 90px; /* Account for navigation on mobile */
    padding-left: 50px;
  }
}

@media (max-width: 480px) {
  .visualization-area {
    padding-bottom: 300px;
    padding-top: 80px; /* Account for compact navigation */
    padding-left: 20px;
  }
}
</style>