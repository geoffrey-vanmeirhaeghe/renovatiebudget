import type { Project } from '~/types/project'

export const mockProject: Project = {
  id: 'mock-project-1',
  name: 'Sample Belgian House Renovation',
  generalAttributes: {
    propertySize: {
      width: 2000,
      depth: 2000,
    },
    floorSize: {
      width: 1150,
      depth: 1050,
    },
  },
  floors: {
    '0': {
      storey: 0,
      height: 250,
      heightPosition: 0,
      color: '#EFEF',
      windows: {
        '1': {
          width: 90,
          height: 210,
          position: {
            orientation: 'front',
            x: 120,
            y: 0,
          },
        },
        '2': {
          width: 90,
          height: 210,
          position: {
            orientation: 'front',
            x: 260,
            y: 0,
          },
        },
        '3': {
          width: 90,
          height: 210,
          position: {
            orientation: 'front',
            x: 400,
            y: 0,
          },
        },
        '4': {
          width: 200,
          height: 210,
          position: {
            orientation: 'back',
            x: 575,
            y: 0,
          },
        },
      },
      doors: {
        '1': {
          width: 200,
          height: 210,
          position: {
            orientation: 'front',
            x: 620,
            y: 0,
          },
        },
        '2': {
          width: 280,
          height: 210,
          position: {
            orientation: 'front',
            x: 970,
            y: 0,
          },
        },
        '3': {
          width: 220,
          height: 210,
          position: {
            orientation: 'back',
            x: 970,
            y: 0,
          },
        },
        '4': {
          width: 280,
          height: 210,
          position: {
            orientation: 'back',
            x: 190,
            y: 0,
          },
        },
      },
    },
    '1': {
      storey: 1,
      height: 250,
      heightPosition: 250,
      color: '#efef',
      windows: {
        '1': {
          width: 140,
          height: 120,
          position: {
            orientation: 'front',
            x: 140,
            y: 80,
          },
        },
        '2': {
          width: 140,
          height: 120,
          position: {
            orientation: 'front',
            x: 380,
            y: 80,
          },
        },
        '3': {
          width: 140,
          height: 120,
          position: {
            orientation: 'front',
            x: 620,
            y: 80,
          },
        },
        '4': {
          width: 160,
          height: 130,
          position: {
            orientation: 'back',
            x: 190,
            y: 80,
          },
        },
        '5': {
          width: 160,
          height: 130,
          position: {
            orientation: 'back',
            x: 575,
            y: 80,
          },
        },
        '6': {
          width: 160,
          height: 130,
          position: {
            orientation: 'back',
            x: 950,
            y: 80,
          },
        },
        '7': {
          width: 160,
          height: 210,
          position: {
            orientation: 'front',
            x: 970,
            y: 0,
          },
        },
      },
    },
    '2': {
      storey: 2,
      height: 250,
      heightPosition: 500,
      color: '#efef',
    },
  },
  roof: {
    type: 'gable',
    width: 1150,
    depth: 800,
    height: 250,
    heightPosition: 500,
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
      height: 250,
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