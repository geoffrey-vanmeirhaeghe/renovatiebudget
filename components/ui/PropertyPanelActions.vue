<template>
  <ClientOnly>
    <!-- Element Actions Handler - handles complex operations like delete, duplicate, transform, etc. -->
    
    <!-- Confirmation Modals -->
    <Teleport to="body">
      <!-- Clear Floor Confirmation Modal -->
      <div v-if="showClearFloorModal" class="modal-overlay" @click="showClearFloorModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Clear Floor</h3>
            <button @click="showClearFloorModal = false" class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to clear all windows and doors from this floor?</p>
            <p class="modal-warning">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button @click="showClearFloorModal = false" class="modal-btn cancel">Cancel</button>
            <button @click="clearFloor" class="modal-btn danger">Clear Floor</button>
          </div>
        </div>
      </div>

      <!-- Clear House Confirmation Modal -->
      <div v-if="showClearHouseModal" class="modal-overlay" @click="showClearHouseModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Clear Entire House</h3>
            <button @click="showClearHouseModal = false" class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to clear the entire house?</p>
            <p>This will remove all floors except the ground floor, and clear all windows and doors.</p>
            <p class="modal-warning">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button @click="showClearHouseModal = false" class="modal-btn cancel">Cancel</button>
            <button @click="clearHouse" class="modal-btn danger">Clear House</button>
          </div>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
/**
 * PropertyPanelActions Component - Handles element actions and confirmations
 * 
 * This component provides:
 * - Element deletion, duplication, and transformation
 * - Floor and house clearing operations
 * - Confirmation modals for destructive actions
 * - Integration with the new hierarchical UI architecture
 */

const { selectedObject, clearSelection } = useSelection()
const { updateProject, currentProject } = useProject()

// Confirmation modals state
const showClearFloorModal = ref(false)
const showClearHouseModal = ref(false)

// Status for feedback
const saveStatus = ref('')

// Expose methods for other components to use
const showClearFloorConfirmation = () => {
  showClearFloorModal.value = true
}

const showClearHouseConfirmation = () => {
  showClearHouseModal.value = true
}

// Delete selected element
const deleteSelectedElement = () => {
  if (!selectedObject.value || !currentProject.value) return
  
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  const { type, id, floorId } = selectedObject.value
  
  if (type === 'floor') {
    // Delete entire floor
    delete updatedProject.floors[id]
    
    // Update roof position to sit on top of remaining floors
    updateRoofPosition(updatedProject)
  } else if (type === 'window' && floorId) {
    // Delete window from specific floor
    const floor = updatedProject.floors[floorId]
    if (floor?.windows) {
      delete floor.windows[id]
    }
  } else if (type === 'door' && floorId) {
    // Delete door from specific floor
    const floor = updatedProject.floors[floorId]
    if (floor?.doors) {
      delete floor.doors[id]
    }
  } else if (type === 'roof') {
    // Delete roof (set to undefined)
    updatedProject.roof = undefined
  }
  
  // Clear selection and update project
  clearSelection()
  updateProject(updatedProject)
}

// Duplicate selected element
const duplicateSelectedElement = () => {
  if (!selectedObject.value || !currentProject.value) return
  
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  const { type, id, floorId } = selectedObject.value
  
  if (type === 'floor') {
    // Duplicate entire floor
    const originalFloor = updatedProject.floors[id]
    const newFloorId = generateFloorId(updatedProject.floors)
    const heightPosition = calculateFloorHeightPosition(updatedProject.floors)
    
    const duplicatedFloor = {
      ...originalFloor,
      storey: parseInt(newFloorId),
      heightPosition: heightPosition,
      // Duplicate all windows and doors with new IDs
      windows: Object.fromEntries(
        Object.entries(originalFloor.windows || {}).map(([_, window], index) => [
          String(index + 1), { ...window }
        ])
      ),
      doors: Object.fromEntries(
        Object.entries(originalFloor.doors || {}).map(([_, door], index) => [
          String(index + 1), { ...door }
        ])
      )
    }
    
    updatedProject.floors[newFloorId] = duplicatedFloor
    updateRoofPosition(updatedProject)
    
    // Select the new floor
    const { selectObject } = useSelection()
    nextTick(() => {
      selectObject({ type: 'floor', id: newFloorId, object: duplicatedFloor })
    })
  } else if ((type === 'window' || type === 'door') && floorId) {
    // Duplicate window or door on the same floor
    const floor = updatedProject.floors[floorId]
    const elements = type === 'window' ? floor?.windows : floor?.doors
    
    if (elements && elements[id]) {
      const originalElement = elements[id]
      
      // Find next available ID
      const existingIds = Object.keys(elements).map(k => parseInt(k)).filter(n => !isNaN(n))
      const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
      
      // Create duplicate with slight position offset
      const duplicatedElement = {
        ...originalElement,
        position: {
          ...originalElement.position,
          x: originalElement.position.x + 50 // Offset by 50cm
        }
      }
      
      elements[String(nextId)] = duplicatedElement
      
      // Select the new element
      const { selectObject } = useSelection()
      nextTick(() => {
        selectObject({ type, id: String(nextId), object: duplicatedElement, floorId })
      })
    }
  } else if (type === 'roof') {
    // For roof, we can't really duplicate
    saveStatus.value = 'ℹ️ Roof duplication not implemented - only one roof per building'
    setTimeout(() => { saveStatus.value = '' }, 3000)
    return
  }
  
  updateProject(updatedProject)
}

// Transform window to door
const transformToDoor = () => {
  if (!selectedObject.value || selectedObject.value.type !== 'window' || !currentProject.value) return
  
  const { id, floorId } = selectedObject.value
  if (!floorId) return
  
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  const floor = updatedProject.floors[floorId]
  
  if (floor?.windows?.[id]) {
    const window = floor.windows[id]
    
    // Find next available door ID
    const existingDoorIds = Object.keys(floor.doors || {}).map(k => parseInt(k)).filter(n => !isNaN(n))
    const nextDoorId = existingDoorIds.length > 0 ? Math.max(...existingDoorIds) + 1 : 1
    
    // Create door with exact window dimensions
    const newDoor = {
      width: window.width,
      height: window.height,
      position: { ...window.position }
    }
    
    // Remove window and add door
    delete floor.windows[id]
    if (!floor.doors) floor.doors = {}
    floor.doors[String(nextDoorId)] = newDoor
    
    // Select the new door
    const { selectObject } = useSelection()
    nextTick(() => {
      selectObject({ type: 'door', id: String(nextDoorId), object: newDoor, floorId })
    })
    
    updateProject(updatedProject)
  }
}

// Transform door to window
const transformToWindow = () => {
  if (!selectedObject.value || selectedObject.value.type !== 'door' || !currentProject.value) return
  
  const { id, floorId } = selectedObject.value
  if (!floorId) return
  
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  const floor = updatedProject.floors[floorId]
  
  if (floor?.doors?.[id]) {
    const door = floor.doors[id]
    
    // Find next available window ID
    const existingWindowIds = Object.keys(floor.windows || {}).map(k => parseInt(k)).filter(n => !isNaN(n))
    const nextWindowId = existingWindowIds.length > 0 ? Math.max(...existingWindowIds) + 1 : 1
    
    // Create window with exact door dimensions
    const newWindow = {
      width: door.width,
      height: door.height,
      position: { ...door.position }
    }
    
    // Remove door and add window
    delete floor.doors[id]
    if (!floor.windows) floor.windows = {}
    floor.windows[String(nextWindowId)] = newWindow
    
    // Select the new window
    const { selectObject } = useSelection()
    nextTick(() => {
      selectObject({ type: 'window', id: String(nextWindowId), object: newWindow, floorId })
    })
    
    updateProject(updatedProject)
  }
}

// Clear all elements from selected floor
const clearFloor = () => {
  if (!selectedObject.value || selectedObject.value.type !== 'floor' || !currentProject.value) return
  
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  const floor = updatedProject.floors[selectedObject.value.id]
  
  if (floor) {
    // Clear all windows and doors
    floor.windows = {}
    floor.doors = {}
    
    updateProject(updatedProject)
    saveStatus.value = '✅ Floor cleared successfully'
    setTimeout(() => { saveStatus.value = '' }, 3000)
  }
  
  showClearFloorModal.value = false
}

// Clear entire house (remove all floors)
const clearHouse = () => {
  if (!currentProject.value) return
  
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  
  // Keep only one ground floor with default settings
  updatedProject.floors = {
    '0': {
      storey: 0,
      height: 250,
      heightPosition: 0,
      color: '#f8f9fa',
      windows: {},
      doors: {}
    }
  }
  
  // Reset roof position
  if (updatedProject.roof) {
    updatedProject.roof.heightPosition = 250
  }
  
  clearSelection()
  updateProject(updatedProject)
  
  saveStatus.value = '✅ House cleared - reset to ground floor only'
  setTimeout(() => { saveStatus.value = '' }, 3000)
  
  showClearHouseModal.value = false
}

// Helper functions
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

const updateRoofPosition = (project: any): void => {
  if (project.roof) {
    project.roof.heightPosition = calculateRoofHeightPosition(project.floors)
  }
}

// Expose methods for parent components
defineExpose({
  deleteSelectedElement,
  duplicateSelectedElement,
  transformToDoor,
  transformToWindow,
  showClearFloorConfirmation,
  showClearHouseConfirmation
})
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: modal-appear 0.2s ease-out;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e9ecef;
  color: #333;
}

.modal-body {
  padding: 20px;
  line-height: 1.5;
}

.modal-body p {
  margin: 0 0 12px 0;
  color: #555;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.modal-warning {
  color: #dc3545 !important;
  font-weight: 500;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

.modal-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 80px;
}

.modal-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.modal-btn.cancel {
  color: #6c757d;
  border-color: #6c757d;
}

.modal-btn.cancel:hover {
  background: #6c757d;
  color: white;
}

.modal-btn.danger {
  color: #dc3545;
  border-color: #dc3545;
}

.modal-btn.danger:hover {
  background: #dc3545;
  color: white;
}
</style>