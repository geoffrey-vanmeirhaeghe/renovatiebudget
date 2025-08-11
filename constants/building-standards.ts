// Building dimension ranges for sliders (in cm)

export const DIMENSION_RANGES = {
  WINDOWS: {
    WIDTH: { min: 20, max: 400 },
    HEIGHT: { min: 20, max: 400 }
  },
  DOORS: {
    WIDTH: { min: 30, max: 400 },
    HEIGHT: { min: 150, max: 400 }
  },
  FLOORS: {
    HEIGHT: { min: 15, max: 50 }
  }
} as const

// Simple preset options
export const SIZE_PRESETS = {
  WINDOWS: [
    { name: 'Small', width: 60, height: 80 },
    { name: 'Medium', width: 80, height: 120 },
    { name: 'Large', width: 120, height: 140 },
    { name: 'Extra Large', width: 200, height: 200 }
  ],
  DOORS: [
    { name: 'Standard', width: 80, height: 200 },
    { name: 'Wide', width: 100, height: 200 },
    { name: 'Double', width: 160, height: 200 },
    { name: 'Large', width: 120, height: 220 }
  ]
} as const