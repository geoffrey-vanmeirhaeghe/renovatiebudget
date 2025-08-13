// Dutch building standards

import type { RegionalStandards } from '../core/types'

export const dutchStandards: RegionalStandards = {
  code: 'NL',
  name: 'Netherlands',
  nameKey: 'regions.netherlands',
  units: {
    system: 'metric',
    length: 'cm',
    lengthDisplay: 'cm',
    precision: 1
  },
  dimensions: {
    WINDOWS: {
      WIDTH: { min: 25, max: 350 },
      HEIGHT: { min: 25, max: 350 }
    },
    DOORS: {
      WIDTH: { min: 30, max: 350 },
      HEIGHT: { min: 150, max: 350 }
    },
    FLOORS: {
      HEIGHT: { min: 15, max: 45 }
    }
  },
  presets: {
    WINDOWS: [
      { name: 'Small', nameKey: 'presets.windows.small', width: 58, height: 78 },
      { name: 'Medium', nameKey: 'presets.windows.medium', width: 78, height: 118 },
      { name: 'Large', nameKey: 'presets.windows.large', width: 118, height: 138 },
      { name: 'Extra Large', nameKey: 'presets.windows.extra_large', width: 158, height: 198 }
    ],
    DOORS: [
      { name: 'Standard', nameKey: 'presets.doors.standard', width: 78, height: 201.5 },
      { name: 'Wide', nameKey: 'presets.doors.wide', width: 98, height: 201.5 },
      { name: 'Double', nameKey: 'presets.doors.double', width: 156, height: 201.5 },
      { name: 'Large', nameKey: 'presets.doors.large', width: 118, height: 221.5 }
    ]
  },
  practices: {
    standardFloorHeight: 240, // Dutch standard ceiling height (lower than Belgium)
    standardWallThickness: 18, // Typical Dutch cavity wall
    typicalRoomHeight: 240,
    standardDoorHeight: 201.5,
    standardWindowSill: 85     // Slightly lower than Belgian standard
  },
  codes: {
    minimumCeilingHeight: 220, // Dutch building code
    minimumWindowSize: 80,
    accessibilityRequirements: {
      doorWidth: 85,
      corridorWidth: 110
    }
  }
}