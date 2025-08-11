<template>
    <TresCanvas window-size shadows preset="realistic" clear-color="#dfdf">
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
        >
        <TresMeshToonMaterial color="#ffff99" />
        </Plane>

        <!-- Floors -->
        <TresGroup
        v-for="(floor, index) in project.floors"
        :key="floor"
        :ref="floor"
        >
        <Box
            v-if="index != Object.keys(project.floors).length - 1"
            :args="[
            project.generalAttributes.floorSize.depth / 100,
            floor.height / 100,
            project.generalAttributes.floorSize.width / 100,
            ]"
            :position="[
            0,
            (floor.heightPosition + floor.height / 2) / 100,
            0,
            ]"
            @click="selectFloor(index, floor)"
        >
            <TresMeshToonMaterial 
                :color="isSelected('floor', index, null) ? '#ffaa44' : floor.color"
            />
        </Box>
        <primitive 
            v-else
            :object="customThreeCreateRoof(project.roof)"
            :position="getRoofPosition(project.roof, index)"
        >
        </primitive>
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
        <TresAmbientLight :intensity="0.75" />
        <TresGridHelper :args="[2.5, 20]" />
    </TresCanvas>
</template>
  
<script setup lang="ts">
import type { Project } from '~/types/project'
import { calcOffsetPosition, calcOffsetSize, calculateRoofPosition } from '~/utils/3d-calculations'
import { customThreeCreateRoof } from '~/scripts/customThree'
import { Vector3 } from 'three'
import type { PerspectiveCamera } from 'three'
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
  nextTick(() => {
    if (!cameraState.value.isInitialized) {
      const defaultPos = new Vector3(...defaultCameraPosition.value)
      const defaultTarget = new Vector3(...defaultCameraTarget.value)
      initializeCameraState(defaultPos, defaultTarget, 1)
    }

    // Set up controls target after initialization
    if (controlsRef.value && controlsRef.value.target && controlsRef.value.target.set) {
      controlsRef.value.target.set(...cameraTarget.value)
      controlsRef.value.update()
    }
  })
})

// Handle camera/controls changes
const onControlsChange = () => {
  if (cameraRef.value && controlsRef.value && controlsRef.value.target) {
    // Update stored camera state when user interacts with controls
    updateCameraPosition(cameraRef.value.position)
    updateCameraTarget(controlsRef.value.target)
  }
}

// Watch for project changes and restore camera state after re-render
watch(() => props.project, () => {
  nextTick(() => {
    restoreCameraState()
  })
}, { deep: true })

// Function to restore camera state after scene updates
const restoreCameraState = () => {
  if (cameraRef.value && controlsRef.value && cameraState.value.isInitialized) {
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

const calculateObjectPosition = (object: any, floor: any) => {
  const floorWidth = props.project.generalAttributes.floorSize.width
  const floorDepth = props.project.generalAttributes.floorSize.depth
  const floorHeight = floor.height
  const storey = floor.storey

  return calcOffsetPosition(object, floorWidth, floorDepth, floorHeight, storey)
}

const calculateObjectSize = (object: any) => {
  return calcOffsetSize(object)
}

const getRoofPosition = (roof: any, index: number) => {
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
         selectedObject.value.floorId === floorId
}

const isHovered = (type: string, id: string, floorId: string | null) => {
  if (!hoveredObject.value) return false
  return hoveredObject.value.type === type && 
         hoveredObject.value.id === id &&
         hoveredObject.value.floorId === floorId
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
}</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
#app {
  height: 100%;
  width: 100%;
}
</style>