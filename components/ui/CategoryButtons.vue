<template>
  <div class="category-buttons">
    <button
      v-for="category in availableCategories"
      :key="category.id"
      @click="selectCategory(category.id)"
      :class="{ active: selectedCategory === category.id }"
      class="category-btn"
      :title="category.name"
    >
      <span class="category-icon">{{ category.icon }}</span>
      <span class="category-label">{{ category.name }}</span>
    </button>
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

const props = defineProps<{
  isOnboardingMode?: boolean
}>()

const selectedCategory = ref<string | null>('layout') // Default to layout category

// Available categories based on mode
const availableCategories = computed(() => {
  if (props.isOnboardingMode) {
    // Only show basic layout tools during onboarding
    return categories.filter(cat => cat.id === 'layout').map(cat => ({
      ...cat,
      tools: cat.tools.filter(tool => 
        ['add-floor', 'add-window', 'add-door'].includes(tool.id)
      )
    }))
  }
  return categories
})

// Define the main tool categories (from ToolDock)
const categories: ToolCategory[] = [
  {
    id: 'layout',
    name: 'Layout/Structure',
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

// Emit initial category on mount
onMounted(() => {
  // Emit the default layout category
  const layoutCategory = categories.find(c => c.id === 'layout')
  if (layoutCategory && layoutCategory.tools) {
    emit('categorySelected', 'layout', layoutCategory.tools)
  }
})

// Expose categories for parent components
defineExpose({
  categories,
  selectedCategory: readonly(selectedCategory)
})
</script>

<style scoped>
.category-buttons {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 25px;
  padding: 8px 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  z-index: 200; /* Standardized z-index for top-right tools */
  flex-wrap: wrap;
  max-width: calc(100vw - 220px); /* Leave space for floating menu button */
}

.category-btn {
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

.category-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.category-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.category-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-label {
  font-size: 12px;
  line-height: 1;
}

/* Category-specific hover colors */
.category-btn:not(.active):hover {
  color: #1e293b;
}

.category-btn[title*="Layout"]:not(.active):hover {
  background: rgba(34, 197, 94, 0.1);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
}

.category-btn[title*="Energy"]:not(.active):hover {
  background: rgba(251, 191, 36, 0.1);
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);
}

.category-btn[title*="Insulation"]:not(.active):hover {
  background: rgba(139, 92, 246, 0.1);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
}

.category-btn[title*="Plumbing"]:not(.active):hover {
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.category-btn[title*="Electrical"]:not(.active):hover {
  background: rgba(245, 158, 11, 0.1);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.category-btn[title*="Finishes"]:not(.active):hover {
  background: rgba(236, 72, 153, 0.1);
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.2);
}

.category-btn[title*="Outdoor"]:not(.active):hover {
  background: rgba(16, 185, 129, 0.1);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .category-buttons {
    max-width: calc(100vw - 200px);
  }
  
  .category-label {
    display: none;
  }
  
  .category-btn {
    padding: 8px;
    min-width: 32px;
    justify-content: center;
  }
  
  .category-icon {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .category-buttons {
    top: 80px; /* Below floating elements */
    right: 10px;
    left: 180px; /* Align with side panel */
    max-width: none;
    justify-content: center;
    padding: 6px 8px;
  }
  
  .category-btn {
    padding: 6px;
    min-width: 28px;
  }
  
  .category-icon {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .category-buttons {
    left: 70px; /* Leave space for compact menu button */
    gap: 4px;
    padding: 4px 6px;
  }
  
  .category-btn {
    padding: 4px;
    min-width: 24px;
  }
  
  .category-icon {
    font-size: 14px;
  }
}
</style>