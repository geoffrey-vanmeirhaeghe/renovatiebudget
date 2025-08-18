<template>
  <div class="tool-dock">
    <div class="dock-categories">
      <button
        v-for="category in categories"
        :key="category.id"
        @click="selectCategory(category.id)"
        :class="{ 
          active: selectedCategory === category.id,
          'has-subcategory': category.hasSubcategory
        }"
        class="category-btn"
        :title="category.name"
      >
        <span class="category-icon">{{ category.icon }}</span>
        <span v-if="category.hasSubcategory" class="expand-indicator">›</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ToolCategory {
  id: string
  name: string
  icon: string
  hasSubcategory: boolean
  tools?: ToolItem[]
}

interface ToolItem {
  id: string
  name: string
  icon: string
  action: string
}

const selectedCategory = ref<string | null>(null)

// Define the main tool categories
const categories: ToolCategory[] = [
  {
    id: 'layout',
    name: 'Layout/Structure',
    icon: '🏗️',
    hasSubcategory: true,
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
    hasSubcategory: true,
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
    hasSubcategory: true,
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
    hasSubcategory: true,
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
    hasSubcategory: true,
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
    hasSubcategory: true,
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
    hasSubcategory: true,
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

// Expose categories for parent components
defineExpose({
  categories,
  selectedCategory: readonly(selectedCategory)
})
</script>

<style scoped>
.tool-dock {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  height: 70px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 35px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  z-index: 300; /* Standardized z-index for tool dock */
  overflow: hidden;
  padding: 8px 16px;
}

.dock-categories {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
}

.category-btn {
  width: 54px;
  height: 54px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  position: relative;
}

.category-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
}

.category-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-6px) scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.category-btn.active .expand-indicator {
  color: rgba(255, 255, 255, 0.8);
}

.category-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.expand-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 8px;
  color: #9ca3af;
  transition: all 0.3s ease;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

.category-btn.active .expand-indicator {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
}

.category-btn.has-subcategory .expand-indicator {
  opacity: 1;
}

/* Tooltip styles */
.category-btn::after {
  content: attr(title);
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 700; /* Tooltips above other UI elements */
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.category-btn:hover::after {
  opacity: 1;
}

/* Category-specific hover colors */
.category-btn[title*="Layout"]:hover {
  background: rgba(34, 197, 94, 0.1);
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.2);
}

.category-btn[title*="Energy"]:hover {
  background: rgba(251, 191, 36, 0.1);
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.2);
}

.category-btn[title*="Insulation"]:hover {
  background: rgba(139, 92, 246, 0.1);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.2);
}

.category-btn[title*="Plumbing"]:hover {
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
}

.category-btn[title*="Electrical"]:hover {
  background: rgba(245, 158, 11, 0.1);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
}

.category-btn[title*="Finishes"]:hover {
  background: rgba(236, 72, 153, 0.1);
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.2);
}

.category-btn[title*="Outdoor"]:hover {
  background: rgba(16, 185, 129, 0.1);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tool-dock {
    bottom: 15px;
    height: 60px;
    padding: 6px 12px;
  }
  
  .category-btn {
    width: 48px;
    height: 48px;
    padding: 6px;
  }
  
  .category-icon {
    font-size: 18px;
  }
  
  .dock-categories {
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .tool-dock {
    bottom: 10px;
    height: 55px;
    padding: 4px 8px;
  }
  
  .category-btn {
    width: 44px;
    height: 44px;
    padding: 4px;
  }
  
  .category-icon {
    font-size: 16px;
  }
  
  .dock-categories {
    gap: 6px;
  }
  
  .expand-indicator {
    width: 10px;
    height: 10px;
    font-size: 6px;
    bottom: 2px;
    right: 2px;
  }
}
</style>