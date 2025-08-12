import type { Project } from '~/types/project'

// Scenario 1: Single Floor + Roof House (Ground floor only + separate roof)
export const mockProject1: Project = {
  id: 'mock-project-1',
  name: 'Single Story Belgian House',
  generalAttributes: {
    propertySize: {
      width: 1800,
      depth: 1600,
    },
    floorSize: {
      width: 1000,
      depth: 800,
    },
  },
  floors: {
    '0': {
      storey: 0,
      height: 280,
      heightPosition: 0,
      color: '#f8f9fa',
      windows: {
        '1': {
          width: 120,
          height: 210,
          position: {
            orientation: 'front',
            x: 150,
            y: 20,
          },
        },
        '2': {
          width: 120,
          height: 210,
          position: {
            orientation: 'front',
            x: 350,
            y: 20,
          },
        },
        '3': {
          width: 180,
          height: 210,
          position: {
            orientation: 'back',
            x: 200,
            y: 20,
          },
        },
        '4': {
          width: 180,
          height: 210,
          position: {
            orientation: 'back',
            x: 600,
            y: 20,
          },
        },
        '5': {
          width: 100,
          height: 150,
          position: {
            orientation: 'left',
            x: 250,
            y: 40,
          },
        },
        '6': {
          width: 100,
          height: 150,
          position: {
            orientation: 'right',
            x: 450,
            y: 40,
          },
        },
      },
      doors: {
        '1': {
          width: 220,
          height: 210,
          position: {
            orientation: 'front',
            x: 650,
            y: 0,
          },
        },
        '2': {
          width: 240,
          height: 210,
          position: {
            orientation: 'back',
            x: 450,
            y: 0,
          },
        },
      },
    },
  },
  roof: {
    type: 'gable',
    width: 1000,
    depth: 800,
    height: 320,
    heightPosition: 280,
  },
}

// Scenario 2: Two Floor + Roof House (Ground + First floor + separate roof)
export const mockProject2: Project = {
  id: 'mock-project-2',
  name: 'Two Story Belgian House Renovation',
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
      color: '#f8f9fa',
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
      color: '#e9ecef',
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
  },
  roof: {
    type: 'gable',
    width: 1150,
    depth: 1050,
    height: 280,
    heightPosition: 500,
  },
}

// Scenario 3: Ground Floor + Attic House (Ground floor + attic floor that IS the roof)
export const mockProject3: Project = {
  id: 'mock-project-3',
  name: 'Belgian House with Habitable Attic',
  generalAttributes: {
    propertySize: {
      width: 1900,
      depth: 1800,
    },
    floorSize: {
      width: 1100,
      depth: 900,
    },
  },
  floors: {
    '0': {
      storey: 0,
      height: 270,
      heightPosition: 0,
      color: '#f8f9fa',
      windows: {
        '1': {
          width: 110,
          height: 220,
          position: {
            orientation: 'front',
            x: 180,
            y: 15,
          },
        },
        '2': {
          width: 110,
          height: 220,
          position: {
            orientation: 'front',
            x: 350,
            y: 15,
          },
        },
        '3': {
          width: 160,
          height: 220,
          position: {
            orientation: 'back',
            x: 300,
            y: 15,
          },
        },
        '4': {
          width: 160,
          height: 220,
          position: {
            orientation: 'back',
            x: 650,
            y: 15,
          },
        },
      },
      doors: {
        '1': {
          width: 240,
          height: 220,
          position: {
            orientation: 'front',
            x: 580,
            y: 0,
          },
        },
        '2': {
          width: 200,
          height: 220,
          position: {
            orientation: 'back',
            x: 150,
            y: 0,
          },
        },
      },
    },
    '1': {
      storey: 1,
      height: 200,
      heightPosition: 270,
      color: '#fff3cd',
      windows: {
        '1': {
          width: 80,
          height: 120,
          position: {
            orientation: 'front',
            x: 220,
            y: 40,
          },
        },
        '2': {
          width: 80,
          height: 120,
          position: {
            orientation: 'front',
            x: 400,
            y: 40,
          },
        },
        '3': {
          width: 80,
          height: 120,
          position: {
            orientation: 'front',
            x: 580,
            y: 40,
          },
        },
        '4': {
          width: 100,
          height: 100,
          position: {
            orientation: 'back',
            x: 250,
            y: 50,
          },
        },
        '5': {
          width: 100,
          height: 100,
          position: {
            orientation: 'back',
            x: 500,
            y: 50,
          },
        },
        '6': {
          width: 100,
          height: 100,
          position: {
            orientation: 'back',
            x: 750,
            y: 50,
          },
        },
      },
    },
  },
  roof: {
    type: 'gable',
    width: 1100, // Match floorSize.width exactly
    depth: 900,  // Match floorSize.depth exactly  
    height: 300,
    heightPosition: 470,
  },
}

// Keep the original mockProject for backward compatibility
export const mockProject: Project = mockProject2

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