// French building standards

import type { RegionalStandards } from '../core/types'

export const frenchStandards: RegionalStandards = {
  code: 'FR',
  name: 'France',
  nameKey: 'regions.france',
  units: {
    system: 'metric',
    length: 'cm',
    lengthDisplay: 'cm',
    precision: 1
  },
  dimensions: {
    WINDOWS: {
      WIDTH: { min: 25, max: 450 },
      HEIGHT: { min: 25, max: 450 }
    },
    DOORS: {
      WIDTH: { min: 32, max: 450 },
      HEIGHT: { min: 155, max: 450 }
    },
    FLOORS: {
      HEIGHT: { min: 16, max: 55 }
    }
  },
  presets: {
    WINDOWS: [
      { name: 'Small', nameKey: 'presets.windows.small', width: 60, height: 75 },
      { name: 'Medium', nameKey: 'presets.windows.medium', width: 80, height: 115 },
      { name: 'Large', nameKey: 'presets.windows.large', width: 125, height: 135 },
      { name: 'Extra Large', nameKey: 'presets.windows.extra_large', width: 180, height: 215 },
      { name: 'French Door', nameKey: 'presets.windows.french_door', width: 140, height: 215 }
    ],
    DOORS: [
      { name: 'Standard', nameKey: 'presets.doors.standard', width: 83, height: 204 }, // French standard
      { name: 'Wide', nameKey: 'presets.doors.wide', width: 93, height: 204 },
      { name: 'Double', nameKey: 'presets.doors.double', width: 166, height: 204 },
      { name: 'Large', nameKey: 'presets.doors.large', width: 103, height: 224 }
    ]
  },
  practices: {
    standardFloorHeight: 250, // French standard ceiling height
    standardWallThickness: 20, // Standard French wall thickness
    typicalRoomHeight: 240,
    standardDoorHeight: 204,   // French standard door height
    standardWindowSill: 100    // French prefer higher window sills
  },
  codes: {
    minimumCeilingHeight: 230, // French building code
    minimumWindowSize: 90,
    accessibilityRequirements: {
      doorWidth: 90, // French accessibility standards
      corridorWidth: 140
    }
  }
}