<template>
  <TresCanvas window-size shadows preset="realistic" clear-color="#D4D4D4">
    <TresPerspectiveCamera :position="[(project.generalAttributes.propertySize.width * 1.5), 125, (project.generalAttributes.propertySize.depth * 1.5)]" />
    <OrbitControls />
    <Plane :args="[project.generalAttributes.propertySize.depth, project.generalAttributes.propertySize.width]" :position="[0, 0, 0]">
      <TresMeshToonMaterial color="#FFF" />
    </Plane>
    <Box 
      v-for="(floor, index) in project.floors"
      ref="boxRef" 
      :args="[project.generalAttributes.floorSize.depth, floor.height, project.generalAttributes.floorSize.width]"
      :position="[
        0, 
        ((parseInt(index) + 1) * floor.height - (floor.height / 2)),
        0
      ]"
    >
      <TresMeshToonMaterial :color="floor.color" />
    </Box>
    <TresAmbientLight :intensity=".75" />
    <TresGridHelper  :args="[250, 20]" />
  </TresCanvas>
</template>

<script>
import { TresCanvas } from '@tresjs/core'

export default {
  data() {
    return {
      project: {
        generalAttributes: {
          propertySize: {
            width: 115,
            depth: 105,
          },
          floorSize: {
            width: 115,
            depth: 105,
          },
        },
        floors: {
          0: {
            height: 25,
            color: "#E5E5E5",
            windows: {
              1: {
                width: 10,
                height: 12,
              },
              2: {
                width: 10,
                height: 12,
              },
              3: {
                width: 10,
                height: 12,
              },
            },
            doors: {
              1: {
                width: 10,
                height: 21,
              },
              2: {
                width: 10,
                height: 21,
              },
            },
          },
          1: {
            height: 25,
            color: "#48ED33",
          },
          2: {
            height: 25,
            color: "#E3829E",
          },
        },
      }
    }
  },
}
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