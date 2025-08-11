import type { Project } from '~/types/project'

export const mockProject: Project = {
  id: 'mock-project-1',
  name: 'Sample Belgian House Renovation',
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
    '0': {
      storey: 0,
      height: 25,
      heightPosition: 0,
      color: '#EFEF',
      windows: {
        '1': {
          width: 9,
          height: 21,
          position: {
            orientation: 'front',
            x: 12,
            y: 0,
          },
        },
        '2': {
          width: 9,
          height: 21,
          position: {
            orientation: 'front',
            x: 26,
            y: 0,
          },
        },
        '3': {
          width: 9,
          height: 21,
          position: {
            orientation: 'front',
            x: 40,
            y: 0,
          },
        },
        '4': {
          width: 20,
          height: 21,
          position: {
            orientation: 'back',
            x: 57.5,
            y: 0,
          },
        },
      },
      doors: {
        '1': {
          width: 20,
          height: 21,
          position: {
            orientation: 'front',
            x: 62,
            y: 0,
          },
        },
        '2': {
          width: 28,
          height: 21,
          position: {
            orientation: 'front',
            x: 97,
            y: 0,
          },
        },
        '3': {
          width: 22,
          height: 21,
          position: {
            orientation: 'back',
            x: 97,
            y: 0,
          },
        },
        '4': {
          width: 28,
          height: 21,
          position: {
            orientation: 'back',
            x: 19,
            y: 0,
          },
        },
      },
    },
    '1': {
      storey: 1,
      height: 25,
      heightPosition: 25,
      color: '#efef',
      windows: {
        '1': {
          width: 14,
          height: 12,
          position: {
            orientation: 'front',
            x: 14,
            y: 8,
          },
        },
        '2': {
          width: 14,
          height: 12,
          position: {
            orientation: 'front',
            x: 38,
            y: 8,
          },
        },
        '3': {
          width: 14,
          height: 12,
          position: {
            orientation: 'front',
            x: 62,
            y: 8,
          },
        },
        '4': {
          width: 16,
          height: 13,
          position: {
            orientation: 'back',
            x: 19,
            y: 8,
          },
        },
        '5': {
          width: 16,
          height: 13,
          position: {
            orientation: 'back',
            x: 57.5,
            y: 8,
          },
        },
        '6': {
          width: 16,
          height: 13,
          position: {
            orientation: 'back',
            x: 95,
            y: 8,
          },
        },
        '7': {
          width: 16,
          height: 21,
          position: {
            orientation: 'front',
            x: 97,
            y: 0,
          },
        },
      },
    },
    '2': {
      storey: 2,
      height: 25,
      heightPosition: 50,
      color: '#efef',
    },
  },
  roof: {
    type: 'gable',
    width: 115,
    depth: 80,
    height: 25,
    heightPosition: 50,
  },
}

// Additional mock projects for testing different scenarios
export const mockProjectSmall: Project = {
  id: 'mock-project-small',
  name: 'Small Belgian Apartment',
  generalAttributes: {
    propertySize: {
      width: 150,
      depth: 150,
    },
    floorSize: {
      width: 80,
      depth: 60,
    },
  },
  floors: {
    '0': {
      storey: 0,
      height: 25,
      heightPosition: 0,
      color: '#f5f5f5',
      windows: {
        '1': {
          width: 12,
          height: 18,
          position: {
            orientation: 'front',
            x: 20,
            y: 2,
          },
        },
      },
      doors: {
        '1': {
          width: 20,
          height: 21,
          position: {
            orientation: 'front',
            x: 40,
            y: 0,
          },
        },
      },
    },
  },
  roof: {
    type: 'flat',
    width: 80,
    depth: 60,
    height: 5,
    heightPosition: 25,
  },
}