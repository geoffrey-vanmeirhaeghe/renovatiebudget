<template>
  <div class="hamburger-menu">
    <!-- Left: Hamburger button -->
    <div class="hamburger-container">
      <button @click="toggleMenu" class="hamburger-btn">
        <span class="hamburger-icon">☰</span>
        <span class="menu-label">Menu</span>
      </button>

      <!-- Dropdown menu -->
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

    <!-- Overlay to close menu -->
    <div v-if="menuOpen" @click="closeMenu" class="menu-overlay"></div>
  </div>
</template>

<script setup lang="ts">
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

const canSave = computed(() => {
  return currentProject.value && !currentProject.value.id.startsWith('mock-')
})

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
  
  // Create a deep copy to trigger reactivity
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
  // TODO: Replace hard-coded documentId with dynamic selection
  await loadProject('ca66f5looy2mij5rua9yj987', true)
  closeMenu()
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

// Close menu when clicking actions
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
</script>

<style scoped>
.hamburger-menu {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 400; /* Standardized z-index for menu container */
}

.hamburger-container {
  position: relative;
}

.hamburger-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 25px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
}

.hamburger-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.hamburger-icon {
  font-size: 18px;
}

.menu-label {
  font-size: 14px;
}

/* Dropdown menu styles */
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
  z-index: 500; /* Above the overlay */
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

/* Menu overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 50; /* Behind dropdown but above base content */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hamburger-menu {
    top: 15px;
    left: 15px;
  }
  
  .menu-dropdown {
    width: 280px;
  }
  
  .hamburger-btn {
    padding: 10px 14px;
  }
  
  .hamburger-icon {
    font-size: 16px;
  }
  
  .menu-label {
    font-size: 13px;
  }
  
  .project-title {
    font-size: 16px;
  }
  
  .title-edit-input {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .hamburger-menu {
    top: 10px;
    left: 10px;
  }
  
  .menu-dropdown {
    width: calc(100vw - 20px);
  }
  
  .hamburger-btn {
    padding: 8px 12px;
  }
  
  .menu-label {
    display: none;
  }
}
</style>