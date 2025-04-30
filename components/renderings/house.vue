<template>
    <TresCanvas window-size shadows preset="realistic" clear-color="#D4D4D4">
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
            (parseInt(index) + 1) * floor.height - floor.height / 2,
            0,
            ]"
        >
            <TresMeshToonMaterial :color="floor.color" />
        </Box>
        <primitive 
            v-else
            :object="customThreeCreateRoof(floor, project.roof.width, project.roof.depth)"
            :position="calculateRoofPosition(floor, index)"
        >
        </primitive>
        <!-- Doors -->
        <Box
            v-for="door in floor.doors"
            :key="door"
            :args="calculateObjectSize(door)"
            :position="calculateObjectPosition(door, floor)"
        >
            <TresMeshToonMaterial color="red" />
        </Box>
        <!-- Windows -->
        <Box
            v-for="window in floor.windows"
            :key="window"
            :args="calculateObjectSize(window)"
            :position="calculateObjectPosition(window, floor)"
        >
            <TresMeshToonMaterial color="red" />
        </Box>
        </TresGroup>
        <TresAmbientLight :intensity="0.75" />
        <TresGridHelper :args="[250, 20]" />
    </TresCanvas>
</template>
  
<script>
import { TresCanvas } from "@tresjs/core";
import { calcOffsetPosition } from '~/scripts/main.js';
import { calcOffsetSize } from '~/scripts/main.js';
import { customThreeCreateRoof } from '~/scripts/customThree';

export default {
  name: 'House',
  props: ["project"],
  methods: {
    calculateObjectPosition(object, floor) {
      const floorWidth = this.project.generalAttributes.floorSize.width
      const floorDepth = this.project.generalAttributes.floorSize.depth
      const floorHeight = floor.height
      const Storey = floor.storey

      return calcOffsetPosition(object, floorWidth, floorDepth, floorHeight, Storey)
    },

    calculateObjectSize(object) {
      return calcOffsetSize(object)
    },

    calculateRoofPosition(roof, index) {
      const floorWidth = this.project.generalAttributes.floorSize.width
      return [0, parseInt(index) * roof.height, -(floorWidth / 2)]
    },

    customThreeCreateRoof, // expose it as method or use directly in template
  },
};
</script>

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