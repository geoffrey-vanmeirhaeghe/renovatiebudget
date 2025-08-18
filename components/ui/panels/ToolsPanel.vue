<template>
  <div class="tools-panel">
    <!-- Panel header -->
    <div class="panel-header">
      <h3>{{ title || 'Tools' }}</h3>
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>
    
    <!-- Tools grid - flexible layout -->
    <div 
      class="tools-grid" 
      :class="[
        `grid-${gridColumns}`, 
        { 'compact': compact }
      ]"
    >
      <button
        v-for="tool in visibleTools"
        :key="tool.id"
        @click="selectTool(tool)"
        class="tool-btn"
        :class="[
          tool.id,
          tool.variant || 'default',
          { 
            'active': selectedToolId === tool.id,
            'disabled': tool.disabled 
          }
        ]"
        :title="tool.description || tool.name"
        :disabled="tool.disabled"
      >
        <span class="tool-icon" v-if="tool.icon">{{ tool.icon }}</span>
        <span class="tool-name">{{ tool.name }}</span>
        <span class="tool-badge" v-if="tool.badge">{{ tool.badge }}</span>
      </button>
    </div>
    
    <!-- Tool categories/filters -->
    <div class="tool-filters" v-if="showFilters && categories.length > 1">
      <button
        v-for="category in categories"
        :key="category"
        @click="setActiveCategory(category)"
        class="filter-btn"
        :class="{ active: activeCategory === category }"
      >
        {{ category }}
      </button>
    </div>
    
    <!-- Instructions or context information -->
    <div class="panel-footer" v-if="showInstructions">
      <small class="instruction-text">
        <slot name="instructions">
          {{ instructions || 'Select a tool to get started' }}
        </slot>
      </small>
    </div>

    <!-- Selected tool context (if configured) -->
    <div class="tool-context" v-if="selectedTool && showToolContext">
      <div class="context-header">
        <h4>{{ selectedTool.name }}</h4>
      </div>
      <div class="context-content">
        <slot name="tool-context" :tool="selectedTool">
          <p>{{ getToolInstructions(selectedTool) }}</p>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Flexible tool interface for extensibility
export interface ToolItem {
  id: string
  name: string
  icon?: string
  description?: string
  action: string
  category?: string
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'success'
  disabled?: boolean
  badge?: string
  metadata?: Record<string, any>
  
  // Conditional visibility
  showWhen?: (context: any) => boolean
  
  // Custom rendering
  component?: any
  props?: Record<string, any>
}

interface Props {
  tools: ToolItem[]
  title?: string
  selectedToolId?: string
  
  // Layout configuration
  gridColumns?: number
  compact?: boolean
  showFilters?: boolean
  showInstructions?: boolean
  showToolContext?: boolean
  
  // Content
  instructions?: string
  
  // Behavior
  autoSelectFirst?: boolean
  allowDeselect?: boolean
  
  // Context for conditional tool visibility
  context?: any
}

const props = withDefaults(defineProps<Props>(), {
  gridColumns: 2,
  compact: false,
  showFilters: false,
  showInstructions: true,
  showToolContext: false,
  allowDeselect: true
})

const emit = defineEmits<{
  'tool-selected': [tool: ToolItem]
  'tool-deselected': [tool: ToolItem]
  'tool-executed': [tool: ToolItem]
  'close': []
}>()

// Internal state
const activeCategory = ref<string>('All')

// Computed properties
const categories = computed(() => {
  const cats = ['All', ...new Set(props.tools.map(tool => tool.category).filter(Boolean))]
  return cats as string[]
})

const visibleTools = computed(() => {
  let filtered = props.tools
  
  // Filter by category
  if (activeCategory.value !== 'All') {
    filtered = filtered.filter(tool => tool.category === activeCategory.value)
  }
  
  // Filter by conditional visibility
  if (props.context) {
    filtered = filtered.filter(tool => 
      !tool.showWhen || tool.showWhen(props.context)
    )
  }
  
  return filtered
})

const selectedTool = computed(() => {
  return props.tools.find(tool => tool.id === props.selectedToolId) || null
})

// Methods
const selectTool = (tool: ToolItem) => {
  if (tool.disabled) return
  
  // Handle deselection
  if (props.selectedToolId === tool.id && props.allowDeselect) {
    emit('tool-deselected', tool)
    return
  }
  
  emit('tool-selected', tool)
  
  // Auto-execute if configured
  if (tool.action) {
    emit('tool-executed', tool)
  }
}

const setActiveCategory = (category: string) => {
  activeCategory.value = category
}

const getToolInstructions = (tool: ToolItem): string => {
  // Default instructions based on tool action
  switch (tool.action) {
    case 'addFloor':
      return 'Click anywhere in the 3D view or use the tool again to add a new floor above existing ones.'
    case 'addWindow':
      return 'Click on a floor to select it, then the window will be added to the front wall. You can move it afterwards.'
    case 'addDoor':
      return 'Click on a floor to select it, then the door will be added to the front wall. You can move it afterwards.'
    case 'clearHouse':
      return 'This will remove all floors, windows, and doors from your project. The action requires confirmation.'
    case 'editWalls':
      return 'Select walls to modify their properties, add openings, or change materials.'
    case 'roomConfig':
      return 'Configure room layouts, dimensions, and internal partitions.'
    default:
      return tool.description || `Selected tool: ${tool.name}. Implementation coming soon.`
  }
}

// Auto-select first tool if configured
onMounted(() => {
  if (props.autoSelectFirst && visibleTools.value.length > 0 && !props.selectedToolId) {
    selectTool(visibleTools.value[0])
  }
})

// Expose methods for parent components
defineExpose({
  selectTool,
  setActiveCategory,
  selectedTool,
  visibleTools
})
</script>

<style scoped>
.tools-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px 12px 0 0;
}

.panel-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 18px;
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
  gap: 12px;
}

.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

.compact .tools-grid {
  padding: 12px;
  gap: 8px;
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
  position: relative;
}

.compact .tool-btn {
  padding: 12px 8px;
  min-height: 60px;
  gap: 6px;
}

.tool-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.tool-btn.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.tool-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tool-btn.primary:hover:not(.disabled) {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
}

.tool-btn.danger:hover:not(.disabled) {
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
}

.tool-btn.success:hover:not(.disabled) {
  border-color: rgba(34, 197, 94, 0.4);
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.2);
}

.tool-icon {
  font-size: 24px;
  line-height: 1;
}

.compact .tool-icon {
  font-size: 20px;
}

.tool-name {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  line-height: 1.2;
}

.compact .tool-name {
  font-size: 11px;
}

.tool-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.tool-filters {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #d1d5db;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: white;
  border-color: #3b82f6;
}

.filter-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
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

.tool-context {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(249, 250, 251, 0.8);
}

.context-header {
  padding: 12px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.context-header h4 {
  margin: 0;
  font-size: 14px;
  color: #374151;
  font-weight: 600;
}

.context-content {
  padding: 16px 20px;
}

.context-content p {
  margin: 0;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
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

@media (max-width: 480px) {
  .grid-2,
  .grid-3,
  .grid-4 {
    grid-template-columns: 1fr;
  }
}
</style>