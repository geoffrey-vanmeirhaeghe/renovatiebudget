// United Kingdom building standards

import type { RegionalStandards } from '../core/types'

export const britishStandards: RegionalStandards = {
  code: 'GB',
  name: 'United Kingdom',
  nameKey: 'regions.united_kingdom',
  units: {
    system: 'metric', // Modern UK construction is metric
    length: 'cm',
    lengthDisplay: 'cm',
    precision: 1
  },
  dimensions: {
    WINDOWS: {
      WIDTH: { min: 30, max: 400 },
      HEIGHT: { min: 30, max: 400 }
    },
    DOORS: {
      WIDTH: { min: 35, max: 400 },
      HEIGHT: { min: 160, max: 400 }
    },
    FLOORS: {
      HEIGHT: { min: 12, max: 45 } // Lower ceiling heights in UK
    }
  },
  presets: {
    WINDOWS: [
      { name: 'Small', nameKey: 'presets.windows.small', width: 45, height: 60 },
      { name: 'Medium', nameKey: 'presets.windows.medium', width: 60, height: 90 },
      { name: 'Large', nameKey: 'presets.windows.large', width: 120, height: 135 },
      { name: 'Extra Large', nameKey: 'presets.windows.extra_large', width: 180, height: 150 },
      { name: 'Bay Window', nameKey: 'presets.windows.bay', width: 240, height: 135 }
    ],
    DOORS: [
      { name: 'Standard', nameKey: 'presets.doors.standard', width: 76, height: 198 }, // UK standard
      { name: 'Wide', nameKey: 'presets.doors.wide', width: 84, height: 198 },
      { name: 'Double', nameKey: 'presets.doors.double', width: 152, height: 198 },
      { name: 'Large', nameKey: 'presets.doors.large', width: 91, height: 210 }
    ]
  },
  practices: {
    standardFloorHeight: 230, // UK standard ceiling height (lower than continental Europe)
    standardWallThickness: 30, // UK cavity walls are thicker
    typicalRoomHeight: 230,
    standardDoorHeight: 198,   // UK standard door height
    standardWindowSill: 75     // Lower window sills in UK
  },
  codes: {
    minimumCeilingHeight: 210, // UK Building Regulations Part K
    minimumWindowSize: 75,
    accessibilityRequirements: {
      doorWidth: 85, // UK accessibility standards
      corridorWidth: 120
    }
  }
}