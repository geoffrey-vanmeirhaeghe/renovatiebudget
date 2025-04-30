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
import { calcOffsetPosition } from './scripts/main.js';
import { calcOffsetSize } from './scripts/main.js';

export default {
  data() {
    return {
      project: {
        generalAttributes: {
          propertySize: {
            width: 200,
            depth: 200,
          },
          floorSize: {
            width: 115,
            depth: 105,
          },
        },
        floors: {
          0: {
            storey: 0,
            height: 25,
            color: "#E3829E",
            windows: {
              1: {
                width: 9,
                height: 21,
                position: {
                  orientation: "front",
                  x: 12,
                  y: 0,
                },
              },
              2: {
                width: 9,
                height: 21,
                position: {
                  orientation: "front",
                  x: 26,
                  y: 0,
                },
              },
              3: {
                width: 9,
                height: 21,
                position: {
                  orientation: "front",
                  x: 40,
                  y: 0,
                },
              },
              4: {
                width: 20,
                height: 21,
                position: {
                  orientation: "back",
                  x: 57.5,
                  y: 0,
                },
              },
            },
            doors: {
              1: {
                width: 20,
                height: 21,
                position: {
                  orientation: "front",
                  x: 62,
                  y: 0,
                },
              },
              2: {
                width: 28,
                height: 21,
                position: {
                  orientation: "front",
                  x: 97,
                  y: 0,
                },
              },
              3: {
                width: 22,
                height: 21,
                position: {
                  orientation: "back",
                  x: 97,
                  y: 0,
                },
              },
              4: {
                width: 28,
                height: 21,
                position: {
                  orientation: "back",
                  x: 19,
                  y: 0,
                },
              },
            },
          },
          1: {
            storey: 1,
            height: 25,
            color: "#48ED33",
            windows: {
              1: {
                width: 14,
                height: 12,
                position: {
                  orientation: "front",
                  x: 14,
                  y: 8,
                },
              },
              2: {
                width: 14,
                height: 12,
                position: {
                  orientation: "front",
                  x: 38,
                  y: 8,
                },
              },
              3: {
                width: 14,
                height: 12,
                position: {
                  orientation: "front",
                  x: 62,
                  y: 8,
                },
              },
              4: {
                width: 16,
                height: 13,
                position: {
                  orientation: "back",
                  x: 19,
                  y: 8,
                },
              },
              5: {
                width: 16,
                height: 13,
                position: {
                  orientation: "back",
                  x: 57.5,
                  y: 8,
                },
              },
              6: {
                width: 16,
                height: 13,
                position: {
                  orientation: "back",
                  x: 95,
                  y: 8,
                },
              },
            },
            doors: {
              1: {
                width: 16,
                height: 21,
                position: {
                  orientation: "front",
                  x: 97,
                  y: 0,
                },
              },
            },
          },
          2: {
            storey: 2,
            height: 25,
            color: "#E5E5E5",
          },
        },
        roof: {
          type: "gable",
          width: 115,
          depth: 80,
        }
      },
    };
  },
  methods: {
    calculateObjectPosition(object, floor) {
      const floorWidth = this.project.generalAttributes.floorSize.width
      const floorDepth = this.project.generalAttributes.floorSize.depth
      const floorHeight = floor.height
      const Storey = floor.storey

      const objectPosition = calcOffsetPosition(object, floorWidth, floorDepth, floorHeight, Storey)
      return objectPosition
    },

    calculateObjectSize(object) {
      const objectSize = calcOffsetSize(object)
      return objectSize
    },
    
    calculateRoofPosition(roof, index) {
      const floorWidth = this.project.generalAttributes.floorSize.width
      const floorHeight = roof.height
      const Storey = roof.storey

      return [ 0, parseInt(index) * roof.height, -(floorWidth / 2) ]
    },
  },
};
</script>

<script setup>
import { customThreeCreateRoof } from './scripts/customThree';
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
