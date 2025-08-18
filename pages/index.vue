<template>
  <div class="app-container">
    <!-- Top Menu Bar (Hamburger) -->
    <TopMenu />
    
    <!-- Top Right Category Buttons -->
    <CategoryButtons 
      @category-selected="onCategorySelected"
      @category-deselected="onCategoryDeselected"
    />
    
    <!-- Main 3D Visualization -->
    <House v-if="currentProject" :project="currentProject" />
    
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
    
    <!-- Legacy PropertyPanel (hidden but kept for backward compatibility) -->
    <PropertyPanel style="display: none;" />
  </div>
</template>

<script setup lang="ts">
import House from '~/components/renderings/house.vue'
import TopMenu from '~/components/ui/TopMenu.vue'
import CategoryButtons from '~/components/ui/CategoryButtons.vue'
import SidePanel from '~/components/ui/SidePanel.vue'
import PropertyPanelActions from '~/components/ui/PropertyPanelActions.vue'
import PropertyPanel from '~/components/ui/PropertyPanel.vue'

interface ToolItem {
  id: string
  name: string
  icon: string
  action: string
}

const { currentProject, loadProject } = useProject()

// Tool and category management
const selectedCategory = ref<string | null>(null)
const selectedCategoryName = ref('')
const selectedCategoryTools = ref<ToolItem[]>([])
const selectedTool = ref<ToolItem | null>(null)
const actionsHandler = ref()

// Handle category selection from ToolDock
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

// Handle tool selection from ToolPanel
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

// Load Strapi data by default - with fix applied
onMounted(async () => {
  try {
    console.log('🚀 Loading Renovatie Budget - New Hierarchical UI Architecture')
    console.log('Loading Strapi data with selection fix...')
    await loadProject('ca66f5looy2mij5rua9yj987', true)
  } catch (error) {
    console.error('Failed to load Strapi data, falling back to mock data:', error)
    // Fallback to mock data if Strapi is unavailable
    await loadProject()
  }
})
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: system-ui, -apple-system, sans-serif;
}

#app {
  height: 100%;
  width: 100%;
}

.app-container {
  height: 100vh;
  width: 100vw;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 3D Visualization should take up remaining space */
.app-container > div:nth-child(3) {
  flex: 1;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  padding-top: 20px; /* Small margin for floating elements */
  padding-bottom: 400px; /* Space for bottom-left panel */
  padding-left: 60px; /* Small margin for menu button */
}

/* Ensure TresJS canvas takes full size */
.app-container canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

/* Responsive adjustments for bottom-left panel and floating elements */
@media (max-width: 768px) {
  .app-container > div:nth-child(3) {
    padding-bottom: 350px; /* Space for smaller bottom panel */
    padding-top: 15px; /* Small margin for floating elements */
    padding-left: 50px; /* Adjust for smaller menu */
  }
}

@media (max-width: 480px) {
  .app-container > div:nth-child(3) {
    padding-bottom: 300px; /* Space for compact bottom panel */
    padding-top: 10px; /* Small margin for floating elements */
    padding-left: 20px; /* Minimal left margin on small screens */
  }
}
</style>