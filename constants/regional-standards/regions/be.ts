// Belgian building standards (mirrors existing constants for backwards compatibility)

import type { RegionalStandards } from '../core/types'

export const belgianStandards: RegionalStandards = {
  code: 'BE',
  name: 'Belgium',
  nameKey: 'regions.belgium',
  units: {
    system: 'metric',
    length: 'cm',
    lengthDisplay: 'cm',
    precision: 1
  },
  dimensions: {
    // Exact match with existing DIMENSION_RANGES
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
  },
  presets: {
    // Exact match with existing SIZE_PRESETS
    WINDOWS: [
      { name: 'Small', nameKey: 'presets.windows.small', width: 60, height: 80 },
      { name: 'Medium', nameKey: 'presets.windows.medium', width: 80, height: 120 },
      { name: 'Large', nameKey: 'presets.windows.large', width: 120, height: 140 },
      { name: 'Extra Large', nameKey: 'presets.windows.extra_large', width: 200, height: 200 }
    ],
    DOORS: [
      { name: 'Standard', nameKey: 'presets.doors.standard', width: 80, height: 200 },
      { name: 'Wide', nameKey: 'presets.doors.wide', width: 100, height: 200 },
      { name: 'Double', nameKey: 'presets.doors.double', width: 160, height: 200 },
      { name: 'Large', nameKey: 'presets.doors.large', width: 120, height: 220 }
    ]
  },
  practices: {
    standardFloorHeight: 270, // Belgian standard ceiling height
    standardWallThickness: 20, // Standard 20cm brick walls
    typicalRoomHeight: 250,   // Typical room height
    standardDoorHeight: 201.5, // Standard Belgian door height
    standardWindowSill: 90     // Standard window sill height
  },
  codes: {
    minimumCeilingHeight: 230,
    minimumWindowSize: 100, // cm²
    accessibilityRequirements: {
      doorWidth: 85, // Minimum door width for accessibility
      corridorWidth: 120
    }
  }
}