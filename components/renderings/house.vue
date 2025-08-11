<template>
    <TresCanvas window-size shadows preset="realistic" clear-color="#dfdf">
        <TresPerspectiveCamera
        :position="[
            project.generalAttributes.propertySize.width * 2.5,
            100,
            project.generalAttributes.propertySize.depth * 0.5,
        ]"
        />
        <OrbitControls />
        <!-- Surface -->
        <Plane
        :args="[
            project.generalAttributes.propertySize.depth,
            project.generalAttributes.propertySize.width,
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
            project.generalAttributes.floorSize.depth,
            floor.height,
            project.generalAttributes.floorSize.width,
            ]"
            :position="[
            0,
            floor.heightPosition + floor.height / 2,
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
        <TresGridHelper :args="[250, 20]" />
    </TresCanvas>
</template>
  
<script setup lang="ts">
import type { Project } from '~/types/project'
import { calcOffsetPosition, calcOffsetSize, calculateRoofPosition } from '~/utils/3d-calculations'
import { customThreeCreateRoof } from '~/scripts/customThree'

interface Props {
  project: Project
}

const props = defineProps<Props>()
const { selectedObject, selectObject, clearSelection } = useSelection()

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
  selectObject({
    id: windowId,
    type: 'window',
    object: window,
    floorId: floorIndex
  })
}

const selectDoor = (doorId: string, door: any, floorIndex: string) => {
  selectObject({
    id: doorId,
    type: 'door',
    object: door,
    floorId: floorIndex
  })
}

const selectFloor = (floorId: string, floor: any) => {
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