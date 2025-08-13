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
            project.generalAttributes.propertySize.depth / 100,
            project.generalAttributes.propertySize.width / 100,
        ]"
        :position="[0, 0, 0]"
        @click="clearSelection"
        >
        <TresMeshToonMaterial color="#ffff99" />
        </Plane>

        <!-- Floors - ALL floors render as floors -->
        <TresGroup
        v-for="(floor, index) in project.floors"
        :key="floor"
        :ref="floor"
        >
        <Box
            :args="[
            getFloorDimension(floor, 'depth') / 100,
            floor.height / 100,
            getFloorDimension(floor, 'width') / 100,
            ]"
            :position="[
            (floor.positionZ || 0) / 100,
            (floor.heightPosition + floor.height / 2) / 100,
            -(floor.positionX || 0) / 100,
            ]"
            @click="selectFloor(index, floor)"
        >
            <TresMeshToonMaterial 
                :color="isSelected('floor', index, null) ? '#ffaa44' : floor.color"
            />
        </Box>
        <!-- Doors -->
        <Box
            v-for="(door, doorId) in floor.doors"
            :key="doorId"
            :args="calculateObjectSize(door)"
            :position="calculateObjectPosition(door, floor)"
            @click="selectDoor(doorId, door, index)"
        >
            <TresMeshToonMaterial 
                :color="isSelected('door', doorId, index) ? '#ff6b35' : '#5c6063'"
            />
        </Box>
        <!-- Windows -->
        <Box
            v-for="(window, windowId) in floor.windows"
            :key="windowId"
            :args="calculateObjectSize(window)"
            :position="calculateObjectPosition(window, floor)"
            @click="selectWindow(windowId, window, index)"
        >
            <TresMeshToonMaterial 
                :color="isSelected('window', windowId, index) ? '#ff6b35' : '#bdd7ff'"
            />
        </Box>
        </TresGroup>

        <!-- Roof - Always separate from floors -->
        <primitive 
            v-if="project.roof"
            :object="customThreeCreateRoof(project.roof)"
            :position="getRoofPosition(project.roof)"
        >
        </primitive>

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
const { selectedObject, hoveredObject, selectObject, clearSelection, hoverObject, clearHover } = useSelection()

// Prevent auto-selection during component initialization
const isInitializing = ref(true)
onMounted(() => {
  // Allow selections after a short delay to ensure 3D components are fully initialized
  setTimeout(() => {
    isInitializing.value = false
    console.log('3D component initialization complete, selections now allowed')
  }, 1000)
})

const { cameraState, initializeCameraState, updateCameraPosition, updateCameraTarget, getCameraPosition, getCameraTarget } = useCameraState()

// Refs for camera and controls
const cameraRef = ref<PerspectiveCamera>()
const controlsRef = ref<OrbitControls>()

// Default camera positioning based on project size
const defaultCameraPosition = computed(() => [
  (props.project.generalAttributes.propertySize.width / 100) * 2.5,
  1,
  (props.project.generalAttributes.propertySize.depth / 100) * 0.5,
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

const selectWindow = (windowId: string, window: any, floorIndex: string) => {
  if (isInitializing.value) {
    console.log('BLOCKED window selection during initialization:', windowId)
    return
  }
  selectObject({
    id: windowId,
    type: 'window',
    object: window,
    floorId: floorIndex
  })
}

const selectDoor = (doorId: string, door: any, floorIndex: string) => {
  if (isInitializing.value) {
    console.log('BLOCKED door selection during initialization:', doorId)
    return
  }
  selectObject({
    id: doorId,
    type: 'door',
    object: door,
    floorId: floorIndex
  })
}

const selectFloor = (floorId: string, floor: any) => {
  if (isInitializing.value) {
    console.log('BLOCKED floor selection during initialization:', floorId)
    return
  }
  selectObject({
    id: floorId,
    type: 'floor',
    object: floor
  })
}

const isSelected = (type: string, id: string, floorId: string | null) => {
  if (!selectedObject.value) return false
  return selectedObject.value.type === type && 
         selectedObject.value.id === id && 
         (floorId ? selectedObject.value.floorId === floorId : true)
}

const hoverWindow = (windowId: string, window: any, floorIndex: string) => {
  hoverObject({
    id: windowId,
    type: 'window',
    object: window,
    floorId: floorIndex
  })
}

const hoverDoor = (doorId: string, door: any, floorIndex: string) => {
  hoverObject({
    id: doorId,
    type: 'door',
    object: door,
    floorId: floorIndex
  })
}

const hoverFloor = (floorId: string, floor: any) => {
  hoverObject({
    id: floorId,
    type: 'floor',
    object: floor
  })
}
</script>