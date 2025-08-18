<template>
  <div class="property-form">
    <!-- Form sections are rendered based on configuration -->
    <div 
      v-for="section in enabledSections" 
      :key="section.id"
      class="property-section"
    >
      <div class="section-header" v-if="section.title">
        <h4>{{ section.title }}</h4>
        <slot :name="`section-header-${section.id}`" :section="section">
          <!-- Default header actions like toggles can go here -->
        </slot>
      </div>

      <!-- Size controls section -->
      <template v-if="section.id === 'size'">
        <div class="property-group">
          <label>Width:</label>
          <input 
            type="range" 
            :min="dimensionRanges.width.min" 
            :max="dimensionRanges.width.max" 
            :step="1"
            :value="displayValues.width"
            @input="updateProperty('width', $event.target.value)"
            class="slider"
          >
          <input 
            type="number"
            :min="dimensionRanges.width.min"
            :max="dimensionRanges.width.max"
            :value="displayValues.width"
            @input="updateProperty('width', $event.target.value)"
            class="number-input"
          >
          <span class="unit">{{ displayUnit }}</span>
        </div>
        
        <div class="property-group" v-if="hasHeight">
          <label>Height:</label>
          <input 
            type="range" 
            :min="dimensionRanges.height.min" 
            :max="dimensionRanges.height.max" 
            :step="1"
            :value="displayValues.height"
            @input="updateProperty('height', $event.target.value)"
            class="slider"
          >
          <input 
            type="number"
            :min="dimensionRanges.height.min"
            :max="dimensionRanges.height.max"
            :value="displayValues.height"
            @input="updateProperty('height', $event.target.value)"
            class="number-input"
          >
          <span class="unit">{{ displayUnit }}</span>
        </div>
      </template>

      <!-- Position controls section -->
      <template v-if="section.id === 'position'">
        <div class="property-group">
          <label>X Position:</label>
          <input 
            type="range" 
            :min="0" 
            :max="maxPositions.x" 
            :step="1"
            :value="displayValues.positionX"
            @input="updateProperty('positionX', $event.target.value)"
            class="slider"
          >
          <input 
            type="number"
            :min="0"
            :max="maxPositions.x"
            :value="displayValues.positionX"
            @input="updateProperty('positionX', $event.target.value)"
            class="number-input"
          >
          <span class="unit">{{ displayUnit }}</span>
        </div>
        
        <div class="property-group">
          <label>Y Position:</label>
          <input 
            type="range" 
            :min="0" 
            :max="maxPositions.y" 
            :step="1"
            :value="displayValues.positionY"
            @input="updateProperty('positionY', $event.target.value)"
            class="slider"
          >
          <input 
            type="number"
            :min="0"
            :max="maxPositions.y"
            :value="displayValues.positionY"
            @input="updateProperty('positionY', $event.target.value)"
            class="number-input"
          >
          <span class="unit">{{ displayUnit }}</span>
        </div>
      </template>

      <!-- Orientation controls section -->
      <template v-if="section.id === 'orientation'">
        <div class="property-group">
          <label>Wall:</label>
          <select 
            :value="element?.position?.orientation || 'front'"
            @change="updateProperty('orientation', $event.target.value)"
            class="orientation-select"
          >
            <option 
              v-for="option in orientationOptions" 
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="orientation-info" v-if="orientationDescription">
          <small>{{ orientationDescription }}</small>
        </div>
      </template>

      <!-- Color selection section -->
      <template v-if="section.id === 'color'">
        <div class="property-group">
          <label>Color:</label>
          <div class="color-options">
            <button 
              v-for="color in colorOptions" 
              :key="color.value"
              :style="{ backgroundColor: color.value }"
              :class="{ active: element?.color === color.value }"
              @click="updateProperty('color', color.value)"
              class="color-btn"
              :title="color.name"
            ></button>
          </div>
        </div>
      </template>

      <!-- Type selection section (for roofs, etc.) -->
      <template v-if="section.id === 'type'">
        <div class="property-group">
          <label>Type:</label>
          <select 
            :value="element?.type || typeOptions[0]?.value"
            @change="updateProperty('type', $event.target.value)"
            class="type-select"
          >
            <option 
              v-for="option in typeOptions" 
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </template>

      <!-- Custom section slot for extensibility -->
      <template v-if="section.id === 'custom'">
        <slot :name="`section-${section.id}`" :section="section" :element="element">
          <!-- Custom content will be inserted here -->
        </slot>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PropertyFormSection {
  id: string
  title?: string
  enabled: boolean
  order: number
}

interface PropertyFormConfig {
  sections: PropertyFormSection[]
  dimensionRanges?: {
    width?: { min: number; max: number }
    height?: { min: number; max: number }
  }
  maxPositions?: {
    x: number
    y: number
  }
  orientationOptions?: Array<{ value: string; label: string }>
  colorOptions?: Array<{ name: string; value: string }>
  typeOptions?: Array<{ value: string; label: string }>
  hasHeight?: boolean
  displayUnit?: string
}

interface PropertyFormValue {
  [key: string]: any
}

interface Props {
  element: any
  config: PropertyFormConfig
  displayUnit?: string
  convertToDisplay?: (value: number) => number
  convertFromDisplay?: (value: number) => number
}

const props = withDefaults(defineProps<Props>(), {
  displayUnit: 'cm',
  convertToDisplay: (value: number) => value,
  convertFromDisplay: (value: number) => value
})

const emit = defineEmits<{
  'property-change': [property: string, value: any]
  'bulk-change': [changes: Record<string, any>]
}>()

// Computed properties for form configuration
const enabledSections = computed(() => {
  return props.config.sections
    .filter(section => section.enabled)
    .sort((a, b) => a.order - b.order)
})

const dimensionRanges = computed(() => ({
  width: {
    min: Math.round(props.convertToDisplay(props.config.dimensionRanges?.width?.min || 20)),
    max: Math.round(props.convertToDisplay(props.config.dimensionRanges?.width?.max || 400))
  },
  height: {
    min: Math.round(props.convertToDisplay(props.config.dimensionRanges?.height?.min || 20)),
    max: Math.round(props.convertToDisplay(props.config.dimensionRanges?.height?.max || 400))
  }
}))

const maxPositions = computed(() => ({
  x: props.config.maxPositions?.x || Math.round(props.convertToDisplay(1000)),
  y: props.config.maxPositions?.y || Math.round(props.convertToDisplay(250))
}))

const hasHeight = computed(() => props.config.hasHeight !== false)

const orientationOptions = computed(() => {
  return props.config.orientationOptions || [
    { value: 'front', label: 'Front Wall' },
    { value: 'back', label: 'Back Wall' },
    { value: 'left', label: 'Left Wall' },
    { value: 'right', label: 'Right Wall' }
  ]
})

const colorOptions = computed(() => {
  return props.config.colorOptions || []
})

const typeOptions = computed(() => {
  return props.config.typeOptions || []
})

const orientationDescription = computed(() => {
  const orientation = props.element?.position?.orientation
  switch (orientation) {
    case 'front': return 'Street-facing side of the building'
    case 'back': return 'Garden or rear side of the building'  
    case 'left': return 'Left side when facing the building'
    case 'right': return 'Right side when facing the building'
    default: return 'Select a wall orientation'
  }
})

// Display values - convert from internal to display units
const displayValues = computed(() => {
  const element = props.element
  if (!element) return {}
  
  return {
    width: Math.round(props.convertToDisplay(element.width || 0)),
    height: Math.round(props.convertToDisplay(element.height || 0)),
    positionX: Math.round(props.convertToDisplay(element.position?.x || 0)),
    positionY: Math.round(props.convertToDisplay(element.position?.y || 0))
  }
})

// Update property handler
const updateProperty = (property: string, value: string) => {
  let processedValue: any = value
  
  // Convert numeric values from display to internal units
  if (['width', 'height', 'positionX', 'positionY'].includes(property)) {
    processedValue = props.convertFromDisplay(parseInt(value))
  }
  
  emit('property-change', property, processedValue)
}

// Bulk update helper for complex changes
const updateMultipleProperties = (changes: Record<string, any>) => {
  emit('bulk-change', changes)
}

// Expose methods for parent components
defineExpose({
  updateProperty,
  updateMultipleProperties
})
</script>

<style scoped>
.property-form {
  width: 100%;
}

.property-section {
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.property-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.property-section h4 {
  margin: 0;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.property-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.property-group:last-child {
  margin-bottom: 0;
}

.property-group label {
  min-width: 70px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.slider {
  flex: 1;
  min-width: 0;
  accent-color: #3b82f6;
}

.number-input {
  width: 60px;
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
}

.number-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
}

.unit {
  min-width: 25px;
  font-size: 11px;
  color: #9ca3af;
  text-align: left;
}

.orientation-select,
.type-select {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.8);
}

.orientation-select:focus,
.type-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
}

.orientation-info {
  margin-top: 6px;
  text-align: center;
}

.orientation-info small {
  color: #6b7280;
  font-size: 11px;
  font-style: italic;
}

.color-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-btn {
  width: 28px;
  height: 28px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-btn:hover {
  transform: scale(1.1);
  border-color: #9ca3af;
}

.color-btn.active {
  border-color: #3b82f6;
  border-width: 3px;
}
</style>