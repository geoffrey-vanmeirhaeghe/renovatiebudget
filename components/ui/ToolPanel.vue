<template>
  <Transition name="slide-in">
    <div v-if="isVisible" class="tool-panel">
      <div class="panel-header">
        <h3>{{ currentCategoryName }}</h3>
        <button @click="closePanel" class="close-btn">×</button>
      </div>
      
      <div class="tools-grid">
        <button
          v-for="tool in tools"
          :key="tool.id"
          @click="executeTool(tool)"
          class="tool-btn"
          :class="tool.id"
          :title="tool.name"
        >
          <span class="tool-icon">{{ tool.icon }}</span>
          <span class="tool-name">{{ tool.name }}</span>
        </button>
      </div>
      
      <!-- Instructions for users -->
      <div class="panel-footer">
        <small class="instruction-text">
          Select a tool to add elements or configure settings
        </small>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface ToolItem {
  id: string
  name: string
  icon: string
  action: string
}

interface Props {
  category: string | null
  categoryName: string
  tools: ToolItem[]
  isVisible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toolSelected: [tool: ToolItem]
  close: []
}>()

const currentCategoryName = computed(() => props.categoryName || 'Tools')

const { selectedObject, clearSelection } = useSelection()
const { updateProject, currentProject } = useProject()
const { quickCreateElement, startCreating } = useElementCreation()

const closePanel = () => {
  emit('close')
}

const executeTool = (tool: ToolItem) => {
  emit('toolSelected', tool)
  
  // Execute the tool action based on the action type
  switch (tool.action) {
    case 'addFloor':
      addFloor()
      break
    case 'addWindow':
      startWindowCreation()
      break
    case 'addDoor':
      startDoorCreation()
      break
    case 'clearHouse':
      // This will be handled by the parent component or a confirmation modal
      break
    case 'editWalls':
    case 'roomConfig':
      // Future implementation - show context panel for configuration
      showNotImplemented(tool.name)
      break
    default:
      // For future categories (Energy, Insulation, etc.)
      showNotImplemented(tool.name)
  }
}

const addFloor = () => {
  if (!currentProject.value) return
  
  // Create a deep copy for reactivity
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  // Generate new floor properties
  const newFloorId = generateFloorId(updatedProject.floors)
  const heightPosition = calculateFloorHeightPosition(updatedProject.floors)
  const storeyNumber = parseInt(newFloorId)
  
  // Default floor properties (matching Belgian building standards)
  const newFloor = {
    storey: storeyNumber,
    height: 250, // 2.5m standard ceiling height
    heightPosition: heightPosition,
    color: storeyNumber % 2 === 0 ? '#f8f9fa' : '#e9ecef', // Alternate colors
    windows: {},
    doors: {}
  }
  
  // Add the new floor
  updatedProject.floors[newFloorId] = newFloor
  
  // Update roof position to sit on top of highest floor
  updateRoofPosition(updatedProject)
  
  // Update the project
  updateProject(updatedProject)
  
  // Auto-select the new floor for immediate editing
  const { selectObject } = useSelection()
  selectObject({ type: 'floor', id: newFloorId, object: newFloor })
}

const startWindowCreation = () => {
  // Check if a floor is selected
  if (!selectedObject.value || selectedObject.value.type !== 'floor') {
    // Auto-select ground floor if available
    if (currentProject.value?.floors?.['0']) {
      const { selectObject } = useSelection()
      selectObject({ 
        type: 'floor', 
        id: '0', 
        object: currentProject.value.floors['0'] 
      })
    } else {
      alert('Please select a floor first')
      return
    }
  }
  
  if (selectedObject.value && selectedObject.value.type === 'floor') {
    startCreating('window', selectedObject.value.id)
    quickCreateElement('front') // Default to front wall
  }
}

const startDoorCreation = () => {
  // Check if a floor is selected
  if (!selectedObject.value || selectedObject.value.type !== 'floor') {
    // Auto-select ground floor if available
    if (currentProject.value?.floors?.['0']) {
      const { selectObject } = useSelection()
      selectObject({ 
        type: 'floor', 
        id: '0', 
        object: currentProject.value.floors['0'] 
      })
    } else {
      alert('Please select a floor first')
      return
    }
  }
  
  if (selectedObject.value && selectedObject.value.type === 'floor') {
    startCreating('door', selectedObject.value.id)
    quickCreateElement('front') // Default to front wall
  }
}

const showNotImplemented = (toolName: string) => {
  console.log(`${toolName} tool selected - Implementation coming soon!`)
  // For now, just show a simple message
  // Later this could trigger context panels or specialized interfaces
}

// Helper functions (shared with PropertyPanel - should potentially be moved to composables)
const generateFloorId = (floors: Record<string, any>): string => {
  const existingStoreys = Object.values(floors).map((floor: any) => floor.storey)
  const maxStorey = existingStoreys.length > 0 ? Math.max(...existingStoreys) : -1
  return (maxStorey + 1).toString()
}

const calculateFloorHeightPosition = (floors: Record<string, any>): number => {
  if (Object.keys(floors).length === 0) return 0
  
  // Find the highest positioned floor and add its height
  let maxPosition = 0
  for (const floor of Object.values(floors) as any[]) {
    const topPosition = floor.heightPosition + floor.height
    if (topPosition > maxPosition) {
      maxPosition = topPosition
    }
  }
  
  return maxPosition
}

const updateRoofPosition = (project: any): void => {
  if (project.roof) {
    project.roof.heightPosition = calculateRoofHeightPosition(project.floors)
  }
}

const calculateRoofHeightPosition = (floors: Record<string, any>): number => {
  let maxPosition = 0
  
  // Find the highest point of all floors
  for (const floor of Object.values(floors) as any[]) {
    const topPosition = floor.heightPosition + floor.height
    if (topPosition > maxPosition) {
      maxPosition = topPosition
    }
  }
  
  return maxPosition
}
</script>

<style scoped>
.tool-panel {
  position: fixed;
  left: 320px; /* Next to the ToolDock */
  top: 80px; /* Below the TopMenu */
  width: 280px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  z-index: 850;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.panel-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(148, 163, 184, 0.2);
  color: #374151;
}

.tools-grid {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-height: 80px;
  backdrop-filter: blur(10px);
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  font-size: 24px;
  line-height: 1;
}

.tool-name {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  line-height: 1.2;
}

.panel-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(248, 250, 252, 0.8);
  text-align: center;
}

.instruction-text {
  color: #64748b;
  font-size: 11px;
  font-style: italic;
}

/* Specific tool button styling */
.tool-btn.add-floor:hover {
  border-color: rgba(34, 197, 94, 0.4);
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.2);
}

.tool-btn.add-window:hover {
  border-color: rgba(14, 165, 233, 0.4);
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.2);
}

.tool-btn.add-door:hover {
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.2);
}

.tool-btn.edit-walls:hover {
  border-color: rgba(245, 158, 11, 0.4);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
}

.tool-btn.room-config:hover {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
}

.tool-btn.clear-house:hover {
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
}

/* Transitions */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: all 0.3s ease;
}

.slide-in-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-in-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tool-panel {
    left: 280px;
    width: 250px;
  }
  
  .tools-grid {
    padding: 12px;
    gap: 10px;
  }
  
  .tool-btn {
    padding: 12px 8px;
    min-height: 70px;
  }
  
  .tool-icon {
    font-size: 20px;
  }
  
  .tool-name {
    font-size: 11px;
  }
}

@media (max-width: 640px) {
  .tool-panel {
    left: 260px;
    width: 220px;
  }
  
  .tools-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .tool-btn {
    padding: 10px 6px;
    min-height: 65px;
  }
  
  .tool-icon {
    font-size: 18px;
  }
  
  .tool-name {
    font-size: 10px;
  }
}
</style>