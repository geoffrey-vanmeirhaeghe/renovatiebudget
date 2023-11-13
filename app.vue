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
      <!-- Doors -->
      <Box
        v-for="door in floor.doors"
        :key="door"
        :args="[0.5, door.height, door.width]"
        :position="doorPosition"
      >
        <!-- :position="[
          project.generalAttributes.floorSize.depth
            ? project.generalAttributes.floorSize.depth / 2
            : 0,
          door.height ? door.height / 2 : 0,
          0,
        ]" -->
        <TresMeshToonMaterial color="red" />
      </Box>
    </TresGroup>
    <TresAmbientLight :intensity="0.75" />
    <TresGridHelper :args="[250, 20]" />
  </TresCanvas>
</template>

<script>
import { TresCanvas } from "@tresjs/core";

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
            height: 25,
            color: "#E3829E",
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
                position: {
                  orientation: "front",
                  x: 70,
                  y: 0,
                },
              },
              2: {
                width: 10,
                height: 21,
                position: {
                  orientation: "back",
                  x: 50,
                  y: 0,
                },
              },
              3: {
                width: 10,
                height: 21,
                position: {
                  orientation: "left",
                  x: 130,
                  y: 0,
                },
              },
              4: {
                width: 10,
                height: 21,
                position: {
                  orientation: "right",
                  x: 100,
                  y: 0,
                },
              },
            },
          },
          // 1: {
          //   height: 25,
          //   color: "#48ED33",
          // },
          // 2: {
          //   height: 25,
          //   color: "#E5E5E5",
          // },
        },
      },
    };
  },

  computed: {
    doorPosition: function () {
      console.log("test");
      return;
    },
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
