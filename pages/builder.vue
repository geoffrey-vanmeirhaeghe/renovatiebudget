<template>
  <div class="builder-container">
    <!-- 3D Builder View -->
    <div class="builder-view">
      <!-- Floating Menu Button -->
      <TopMenu />
      <!-- Top Category Buttons -->
      <CategoryButtons 
        @category-selected="onCategorySelected"
        @category-deselected="onCategoryDeselected"
      />
      
      <!-- Main 3D Visualization -->
      <div class="visualization-area">
        <House v-if="currentProject" :project="currentProject" />
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
    </div>
  </div>
</template>

<script setup lang="ts">
import TopMenu from '~/components/ui/TopMenu.vue'
import CategoryButtons from '~/components/ui/CategoryButtons.vue'
import SidePanel from '~/components/ui/SidePanel.vue'
import PropertyPanelActions from '~/components/ui/PropertyPanelActions.vue'
import House from '~/components/renderings/house.vue'

// Protect this page with authentication
definePageMeta({
  middleware: 'auth'
})

interface ToolItem {
  id: string
  name: string
  icon: string
  action: string
}

// Get authentication state
const { currentUser, getUserRegion, logout } = useAuth()

// Get project data
const { currentProject, loadProject } = useProject()

// Navigation
const goBackToDashboard = () => {
  navigateTo('/dashboard')
}

// Tool and category management for 3D mode
const selectedCategory = ref<string | null>(null)
const selectedCategoryName = ref('')
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

// Load project data on mount
onMounted(async () => {
  try {
    const { loadProject } = useProject()
    console.log('🏗️ Loading 3D builder with user context')
    console.log('User:', currentUser.value?.firstName, currentUser.value?.address?.municipality)
    
    // Load project data (fallback to mock if Strapi unavailable)
    await loadProject('ca66f5looy2mij5rua9yj987', true)
  } catch (error) {
    console.error('Failed to load Strapi data, falling back to mock data:', error)
    const { loadProject } = useProject()
    await loadProject()
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
  padding-top: 20px;
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
    padding-top: 15px;
    padding-left: 50px;
  }
}

@media (max-width: 480px) {
  .visualization-area {
    padding-bottom: 300px;
    padding-top: 10px;
    padding-left: 20px;
  }
}
</style>