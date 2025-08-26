<template>
  <div class="builder-navigation">
    <!-- Combined Left Navigation Container -->
    <div class="left-nav-group">
      <!-- Back to Dashboard Button -->
      <button @click="goBackToDashboard" class="nav-btn back-btn" title="Back to Dashboard">
        <span class="nav-icon">←</span>
        <span class="nav-label">Dashboard</span>
      </button>
      
      <!-- Visual Divider -->
      <div class="nav-divider"></div>
      
      <!-- Menu Button -->
      <div class="menu-container">
        <button @click="toggleMenu" class="nav-btn menu-btn" title="Project Menu">
          <span class="nav-icon">☰</span>
          <span class="nav-label">Menu</span>
        </button>

        <!-- Menu Dropdown -->
        <div v-if="menuOpen" class="menu-dropdown" @click.stop>
          <div class="dropdown-header">
            <div class="project-title-container">
              <input 
                v-if="isEditingTitle"
                v-model="editingTitle"
                @blur="saveTitle"
                @keydown.enter="saveTitle"
                @keydown.escape="cancelEditTitle"
                type="text"
                class="title-edit-input"
                placeholder="Project name"
                ref="titleInput"
              >
              <div 
                v-else
                @click="startEditTitle"
                class="project-title"
                :class="{ 'hover-editable': !isEditingTitle }"
              >
                {{ currentProject?.name || 'Untitled Project' }}
                <span class="edit-icon">✏️</span>
              </div>
            </div>
          </div>

          <div class="dropdown-actions">
            <button 
              @click="saveProject" 
              :disabled="!canSave || isSaving"
              class="dropdown-btn save-btn"
              :title="isSaving ? 'Saving...' : 'Save Project'"
            >
              <span class="btn-icon">{{ isSaving ? '⏳' : '💾' }}</span>
              <span class="btn-text">{{ isSaving ? 'Saving...' : 'Save' }}</span>
            </button>

            <button 
              @click="createNewProject" 
              class="dropdown-btn new-btn"
              title="Create New Project"
            >
              <span class="btn-icon">✨</span>
              <span class="btn-text">New Project</span>
            </button>

            <button 
              @click="loadFromStrapi" 
              :class="{ active: dataSource === 'strapi' }"
              class="dropdown-btn load-btn"
              title="Load from Strapi"
            >
              <span class="btn-icon">🌐</span>
              <span class="btn-text">Load from Strapi</span>
            </button>

            <button 
              class="dropdown-btn account-btn"
              title="Account Settings"
            >
              <span class="btn-icon">👤</span>
              <span class="btn-text">Account Settings</span>
            </button>
          </div>

          <div v-if="saveStatus" class="save-status">
            <small :class="{ error: saveStatus.includes('Error'), success: saveStatus.includes('Saved') }">
              {{ saveStatus }}
            </small>
          </div>
        </div>
      </div>
      
      <!-- Another Visual Divider -->
      <div class="nav-divider"></div>
      
      <!-- Category Navigation -->
      <div class="category-nav">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          :class="{ active: selectedCategory === category.id }"
          class="nav-btn category-btn"
          :title="category.name"
        >
          <span class="nav-icon">{{ category.icon }}</span>
          <span class="nav-label">{{ category.name }}</span>
        </button>
      </div>
    </div>

    <!-- Overlay to close menu -->
    <div v-if="menuOpen" @click="closeMenu" class="menu-overlay"></div>
  </div>
</template>

<script setup lang="ts">
interface ToolItem {
  id: string
  name: string
  icon: string
  action: string
}

interface ToolCategory {
  id: string
  name: string
  icon: string
  tools: ToolItem[]
}

const { currentProject, updateProject, loadProject } = useProject()
const { saveProject: saveToStrapi, createProject } = useStrapi()

// Menu state
const menuOpen = ref(false)

// Title editing
const isEditingTitle = ref(false)
const editingTitle = ref('')
const titleInput = ref<HTMLInputElement>()
const dataSource = ref<'mock' | 'strapi'>('strapi')

// Save/Create functionality
const isSaving = ref(false)
const saveStatus = ref('')

// Category selection
const selectedCategory = ref<string | null>('layout')

// Define the main tool categories
const categories: ToolCategory[] = [
  {
    id: 'layout',
    name: 'Layout',
    icon: '🏗️',
    tools: [
      { id: 'add-floor', name: 'Add Floor', icon: '🏢', action: 'addFloor' },
      { id: 'add-window', name: 'Add Window', icon: '🪟', action: 'addWindow' },
      { id: 'add-door', name: 'Add Door', icon: '🚪', action: 'addDoor' },
      { id: 'edit-walls', name: 'Edit Walls', icon: '🧱', action: 'editWalls' },
      { id: 'room-config', name: 'Room Configuration', icon: '📐', action: 'roomConfig' },
      { id: 'clear-house', name: 'Clear House', icon: '🧹', action: 'clearHouse' }
    ]
  },
  {
    id: 'energy',
    name: 'Energy',
    icon: '⚡',
    tools: [
      { id: 'heating', name: 'Heating System', icon: '🔥', action: 'heating' },
      { id: 'solar', name: 'Solar Panels', icon: '☀️', action: 'solar' },
      { id: 'ventilation', name: 'Ventilation', icon: '💨', action: 'ventilation' },
      { id: 'insulation', name: 'Insulation', icon: '🛡️', action: 'insulation' }
    ]
  },
  {
    id: 'insulation',
    name: 'Insulation',
    icon: '🛡️',
    tools: [
      { id: 'wall-insulation', name: 'Wall Insulation', icon: '🧱', action: 'wallInsulation' },
      { id: 'roof-insulation', name: 'Roof Insulation', icon: '🏠', action: 'roofInsulation' },
      { id: 'floor-insulation', name: 'Floor Insulation', icon: '⬇️', action: 'floorInsulation' },
      { id: 'window-upgrade', name: 'Window Upgrades', icon: '🪟', action: 'windowUpgrade' }
    ]
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: '🚿',
    tools: [
      { id: 'pipes', name: 'Pipe Network', icon: '🔧', action: 'pipes' },
      { id: 'fixtures', name: 'Fixtures', icon: '🚽', action: 'fixtures' },
      { id: 'water-heating', name: 'Water Heating', icon: '🔥', action: 'waterHeating' },
      { id: 'drainage', name: 'Drainage', icon: '🕳️', action: 'drainage' }
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: '💡',
    tools: [
      { id: 'wiring', name: 'Wiring', icon: '⚡', action: 'wiring' },
      { id: 'outlets', name: 'Outlets & Switches', icon: '🔌', action: 'outlets' },
      { id: 'lighting', name: 'Lighting', icon: '💡', action: 'lighting' },
      { id: 'smart-home', name: 'Smart Home', icon: '🏠', action: 'smartHome' }
    ]
  },
  {
    id: 'finishes',
    name: 'Finishes',
    icon: '🎨',
    tools: [
      { id: 'flooring', name: 'Flooring', icon: '🪵', action: 'flooring' },
      { id: 'paint', name: 'Paint & Wallpaper', icon: '🖌️', action: 'paint' },
      { id: 'tiles', name: 'Tiles', icon: '🔲', action: 'tiles' },
      { id: 'fixtures-finish', name: 'Fixtures', icon: '🚪', action: 'fixturesFinish' }
    ]
  },
  {
    id: 'outdoor',
    name: 'Outdoor',
    icon: '🌿',
    tools: [
      { id: 'garden', name: 'Garden Design', icon: '🌱', action: 'garden' },
      { id: 'patio', name: 'Patio/Deck', icon: '🪑', action: 'patio' },
      { id: 'fencing', name: 'Fencing', icon: '🚧', action: 'fencing' },
      { id: 'exterior-lighting', name: 'Exterior Lighting', icon: '💡', action: 'exteriorLighting' }
    ]
  }
]

const emit = defineEmits<{
  categorySelected: [category: string, tools: ToolItem[]]
  categoryDeselected: []
}>()

const canSave = computed(() => {
  return currentProject.value && !currentProject.value.id.startsWith('mock-')
})

// Back to dashboard navigation
const goBackToDashboard = () => {
  navigateTo('/dashboard')
}

// Menu functionality
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

// Category selection
const selectCategory = (categoryId: string) => {
  if (selectedCategory.value === categoryId) {
    // Clicking the same category deselects it
    selectedCategory.value = null
    emit('categoryDeselected')
  } else {
    // Select new category
    selectedCategory.value = categoryId
    const category = categories.find(c => c.id === categoryId)
    if (category && category.tools) {
      emit('categorySelected', categoryId, category.tools)
    }
  }
}

// Title editing
const startEditTitle = () => {
  if (!currentProject.value) return
  editingTitle.value = currentProject.value.name || ''
  isEditingTitle.value = true
  nextTick(() => {
    titleInput.value?.focus()
    titleInput.value?.select()
  })
}

const saveTitle = () => {
  if (!currentProject.value || !editingTitle.value.trim()) {
    cancelEditTitle()
    return
  }
  
  const updatedProject = JSON.parse(JSON.stringify(currentProject.value))
  updatedProject.name = editingTitle.value.trim()
  updateProject(updatedProject)
  
  isEditingTitle.value = false
}

const cancelEditTitle = () => {
  isEditingTitle.value = false
  editingTitle.value = ''
}

const loadFromStrapi = async () => {
  dataSource.value = 'strapi'
  await loadProject('ca66f5looy2mij5rua9yj987', true)
  closeMenu()
}

const saveProject = async () => {
  if (!currentProject.value || isSaving.value) return

  isSaving.value = true
  saveStatus.value = ''
  
  try {
    const savedProject = await saveToStrapi(currentProject.value)
    await loadProject(savedProject.id, true)
    
    saveStatus.value = '✅ Project saved successfully!'
    setTimeout(() => { saveStatus.value = '' }, 5000)
  } catch (error) {
    console.error('Save failed:', error)
    saveStatus.value = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    setTimeout(() => { saveStatus.value = '' }, 5000)
  } finally {
    isSaving.value = false
  }
  closeMenu()
}

const createNewProject = async () => {
  const defaultProject = {
    name: `New Project ${new Date().toLocaleDateString()}`,
    generalAttributes: {
      propertySize: { width: 2000, depth: 2000 },
      floorSize: { width: 1150, depth: 1050 }
    },
    floors: {
      '0': {
        storey: 0,
        height: 250,
        heightPosition: 0,
        color: '#f8f9fa',
        windows: {},
        doors: {}
      }
    },
    roof: {
      type: 'gable' as const,
      width: 1150,
      depth: 1050,
      height: 280,
      heightPosition: 250
    }
  }

  isSaving.value = true
  saveStatus.value = ''
  
  try {
    const newProject = await createProject(defaultProject)
    await loadProject(newProject.id, true)
    dataSource.value = 'strapi'
    
    saveStatus.value = '✅ New project created!'
    setTimeout(() => { saveStatus.value = '' }, 3000)
  } catch (error) {
    console.error('Create failed:', error)
    saveStatus.value = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    setTimeout(() => { saveStatus.value = '' }, 5000)
  } finally {
    isSaving.value = false
  }
  closeMenu()
}

// Emit initial category on mount
onMounted(() => {
  const layoutCategory = categories.find(c => c.id === 'layout')
  if (layoutCategory && layoutCategory.tools) {
    emit('categorySelected', 'layout', layoutCategory.tools)
  }
})

// Expose for parent components
defineExpose({
  categories,
  selectedCategory: readonly(selectedCategory)
})
</script>

<style scoped>
.builder-navigation {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 400;
}

.left-nav-group {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 25px;
  padding: 8px 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  gap: 4px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.nav-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-btn:hover {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
}

.menu-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.category-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.category-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.nav-divider {
  width: 1px;
  height: 24px;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1), transparent);
  margin: 0 8px;
}

.menu-container {
  position: relative;
}

.category-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  font-size: 12px;
  line-height: 1;
}

/* Menu dropdown styles */
.menu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  overflow: hidden;
  margin-top: 8px;
  z-index: 500;
}

.dropdown-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.project-title-container {
  position: relative;
}

.project-title {
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-title.hover-editable:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.edit-icon {
  opacity: 0;
  font-size: 14px;
  transition: opacity 0.3s ease;
}

.project-title.hover-editable:hover .edit-icon {
  opacity: 0.7;
}

.title-edit-input {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #3b82f6;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  outline: none;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.dropdown-actions {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.dropdown-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.dropdown-btn.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.save-btn:not(:disabled):hover {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.4);
  color: #16a34a;
}

.new-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
  color: #2563eb;
}

.load-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.4);
  color: #6366f1;
}

.account-btn:hover {
  background: rgba(168, 85, 247, 0.1);
  border-color: rgba(168, 85, 247, 0.4);
  color: #a855f7;
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-size: 14px;
}

.save-status {
  padding: 12px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(248, 250, 252, 0.8);
  text-align: center;
}

.save-status small.success {
  color: #22c55e;
  font-weight: 500;
}

.save-status small.error {
  color: #ef4444;
  font-weight: 500;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 50;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .nav-label {
    display: none;
  }
  
  .nav-btn {
    padding: 8px;
    min-width: 32px;
    justify-content: center;
  }
  
  .nav-icon {
    font-size: 18px;
  }
  
  .left-nav-group {
    padding: 6px 8px;
  }
}

@media (max-width: 768px) {
  .builder-navigation {
    top: 15px;
    left: 15px;
  }
  
  .menu-dropdown {
    width: 280px;
  }
  
  .nav-btn {
    padding: 6px;
    min-width: 28px;
  }
  
  .nav-icon {
    font-size: 16px;
  }
  
  .left-nav-group {
    padding: 4px 6px;
    gap: 2px;
  }
  
  .nav-divider {
    margin: 0 4px;
  }
}

@media (max-width: 480px) {
  .builder-navigation {
    top: 10px;
    left: 10px;
  }
  
  .menu-dropdown {
    width: calc(100vw - 20px);
  }
  
  .nav-btn {
    padding: 4px;
    min-width: 24px;
  }
  
  .nav-icon {
    font-size: 14px;
  }
  
  .left-nav-group {
    gap: 1px;
  }
  
  .nav-divider {
    height: 20px;
    margin: 0 2px;
  }
  
  .category-nav {
    gap: 1px;
  }
}
</style>