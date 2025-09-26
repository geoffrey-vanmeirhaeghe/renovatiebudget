<template>
  <div>
    <TresCanvas 
        ref="canvasRef"
        window-size 
        shadows 
        preset="realistic" 
        clear-color="#dfdf"
    >
        <TresPerspectiveCamera
        ref="cameraRef"
        :position="cameraPosition"
        />
        <OrbitControls 
        ref="controlsRef"
        :target="cameraTarget"
        @change="onControlsChange"
        />
        <!-- Surface -->
        <Plane
        :args="[
            safePropertySize.depth / 100,
            safePropertySize.width / 100,
        ]"
        :position="[0, 0, 0]"
        @click="clearSelection"
        >
        <TresMeshToonMaterial color="#ffff99" />
        </Plane>

        <!-- Floors - ALL floors render as floors -->
        <TresGroup
        v-for="(floor, index) in (project?.floors || {})"
        :key="floor"
        :ref="floor"
        >
        <Box
            :args="[
            getFloorDimension(floor, 'depth') / 100,
            (floor.height || 280) / 100,
            getFloorDimension(floor, 'width') / 100,
            ]"
            :position="[
            (floor.positionZ || 0) / 100,
            ((floor.heightPosition || 0) + (floor.height || 280) / 2) / 100,
            -(floor.positionX || 0) / 100,
            ]"
            @click="selectFloor(index, floor)"
            @pointer-enter="hoverFloor(index, floor)"
            @pointer-leave="clearHover"
        >
            <TresMeshToonMaterial 
                :color="getFloorColor(index, floor).value"
            />
        </Box>
        <!-- Doors -->
        <Box
            v-for="(door, doorId) in floor.doors"
            :key="doorId"
            :args="calculateObjectSize(door)"
            :position="calculateObjectPosition(door, floor)"
            @click="selectDoor(doorId, door, index)"
            @pointer-enter="hoverDoor(doorId, door, index)"
            @pointer-leave="clearHover"
        >
            <TresMeshToonMaterial 
                :color="getDoorColor(doorId, index).value"
            />
        </Box>
        <!-- Windows -->
        <Box
            v-for="(window, windowId) in floor.windows"
            :key="windowId"
            :args="calculateObjectSize(window)"
            :position="calculateObjectPosition(window, floor)"
            @click="selectWindow(windowId, window, index)"
            @pointer-enter="hoverWindow(windowId, window, index)"
            @pointer-leave="clearHover"
        >
            <TresMeshToonMaterial 
                :color="getWindowColor(windowId, index).value"
            />
        </Box>
        </TresGroup>

        <!-- Roof - Always separate from floors -->
        <TresGroup v-if="project.roof && roofObject" :position="getRoofPosition(project.roof)">
            <primitive 
                :object="roofObject"
            >
            </primitive>
            <!-- Invisible clickable box overlay for roof selection -->
            <Box
                :args="[
                    (project.roof.depth || 1000) / 100,
                    (project.roof.height || 300) / 100,
                    (project.roof.width || 1000) / 100
                ]"
                :position="[0, (project.roof.height || 300) / 200, 0]"
                @click="selectRoof"
                @pointer-enter="hoverRoof(project.roof)"
                @pointer-leave="clearHover"
            >
                <TresMeshBasicMaterial :transparent="true" :opacity="0" />
            </Box>
        </TresGroup>

        <TresAmbientLight :intensity="0.75" />
        <TresGridHelper :args="[2.5, 20]" />
    </TresCanvas>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import { calcOffsetPosition, calcOffsetSize, calculateRoofPosition } from '~/utils/3d-calculations'
import { customThreeCreateRoof } from '~/scripts/customThree'
import type { PerspectiveCamera } from 'three'
import { Vector3 } from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface Props {
  project: Project
}

const props = defineProps<Props>()
// Use the new global element selection system
const {
  // Core selection functions
  selectFloor,
  selectWindow,
  selectDoor,
  selectRoof,
  // Color functions
  getFloorColor,
  getWindowColor,
  getDoorColor,
  getRoofColor,
  // Hover functions
  hoverFloor,
  hoverWindow,
  hoverDoor,
  hoverRoof,
  // System management
  initializeSelection,
  isSelectionReady,
  clearSelection,
  clearHover,
  selectedObject
} = useElementSelection()

// Initialize the selection system after component mount
onMounted(() => {
  // Initialize selection system with the same delay as before
  initializeSelection(1000)
})

const { cameraState, initializeCameraState, updateCameraPosition, updateCameraTarget, getCameraPosition, getCameraTarget } = useCameraState()

// Refs for camera and controls
const cameraRef = ref<PerspectiveCamera>()
const controlsRef = ref<OrbitControls>()

// Safe property getters with fallbacks
const safePropertySize = computed(() => ({
  width: props.project?.generalAttributes?.propertySize?.width || 1800,
  depth: props.project?.generalAttributes?.propertySize?.depth || 1600
}))

const safeFloorSize = computed(() => ({
  width: props.project?.generalAttributes?.floorSize?.width || 1000,
  depth: props.project?.generalAttributes?.floorSize?.depth || 800
}))

// Default camera positioning based on project size
const defaultCameraPosition = computed(() => [
  (safePropertySize.value.width / 100) * 2.5,
  1,
  (safePropertySize.value.depth / 100) * 0.5,
])

const defaultCameraTarget = computed(() => [0, 0, 0])

// Reactive camera position and target that uses stored state if available
const cameraPosition = computed(() => {
  if (cameraState.value.isInitialized) {
    return [cameraState.value.position.x, cameraState.value.position.y, cameraState.value.position.z]
  }
  return defaultCameraPosition.value
})

const cameraTarget = computed(() => {
  if (cameraState.value.isInitialized) {
    return [cameraState.value.target.x, cameraState.value.target.y, cameraState.value.target.z]
  }
  return defaultCameraTarget.value
})

// Initialize camera state on component mount
onMounted(() => {
  setTimeout(() => {
    console.log('Initial camera setup - initializing state')
    // Create Vector3 objects with default values for proper initialization
    const defaultPos = new Vector3(...defaultCameraPosition.value)
    const defaultTarget = new Vector3(...defaultCameraTarget.value)
    initializeCameraState(defaultPos, defaultTarget)
  }, 200)
})

// Handle camera and controls changes to save state
const onControlsChange = () => {
  if (cameraRef.value && controlsRef.value && controlsRef.value.target && cameraState.value.isInitialized) {
    // Only update stored camera state when user interacts with controls and camera is fully initialized
    updateCameraPosition(cameraRef.value.position)
    updateCameraTarget(controlsRef.value.target)
  }
}

// Watch for project changes and restore camera state after re-render
// Only watch for structural changes (project ID), not property edits that shouldn't affect camera
watch(() => props.project?.id, () => {
  nextTick(() => {
    restoreCameraState()
  })
}, { deep: false }) // Explicitly set deep: false to avoid watching nested property changes

// Function to restore camera state after scene updates
const restoreCameraState = () => {
  if (cameraRef.value && controlsRef.value && cameraState.value.isInitialized) {
    console.log('Restoring camera state:', cameraState.value)
    
    // Temporarily disable the onControlsChange handler to prevent feedback loops
    const originalHandler = controlsRef.value.change
    
    // Restore camera position
    cameraRef.value.position.set(
      cameraState.value.position.x,
      cameraState.value.position.y,
      cameraState.value.position.z
    )
    
    // Restore controls target
    controlsRef.value.target.set(
      cameraState.value.target.x,
      cameraState.value.target.y,
      cameraState.value.target.z
    )
    
    // Update the controls and camera
    controlsRef.value.update()
    cameraRef.value.updateProjectionMatrix()
  }
}

const getFloorDimension = (floor: any, dimension: 'width' | 'depth') => {
  // Use floor-specific dimension if available, otherwise fall back to general attributes
  return floor[dimension] || props.project.generalAttributes.floorSize[dimension]
}

const calculateObjectPosition = (object: any, floor: any) => {
  const floorWidth = getFloorDimension(floor, 'width')
  const floorDepth = getFloorDimension(floor, 'depth')
  const floorHeight = floor.height
  const storey = floor.storey

  const basePosition = calcOffsetPosition(object, floorWidth, floorDepth, floorHeight, storey)
  
  // Add floor offset to object position
  const floorOffsetX = (floor.positionX || 0) / 100
  const floorOffsetZ = (floor.positionZ || 0) / 100
  
  return [
    basePosition[0] + floorOffsetZ,  // Z component  
    basePosition[1],                  // Y component (height)
    basePosition[2] - floorOffsetX   // X component (inverted to match floor positioning)
  ]
}

const calculateObjectSize = (object: any) => {
  return calcOffsetSize(object)
}

const getRoofPosition = (roof: any) => {
  const floorWidth = props.project.generalAttributes.floorSize.width
  return calculateRoofPosition(roof, floorWidth)
}

// Reactive roof object that updates based on hover/selection state
const roofObject = computed(() => {
  if (!props.project.roof) return null
  const color = getRoofColor().value
  return customThreeCreateRoof(props.project.roof, color)
})

// All selection and color functions are now provided by useElementSelection composable
// No local selection functions needed - using selectFloor, selectWindow, selectDoor, selectRoof from composable
// No local color functions needed - using getFloorColor, getWindowColor, getDoorColor from composable

// Hover functions are now provided by useElementSelection composable
// Using hoverFloor, hoverWindow, hoverDoor from composable
</script>

<style scoped>
/* House component styles */
</style>