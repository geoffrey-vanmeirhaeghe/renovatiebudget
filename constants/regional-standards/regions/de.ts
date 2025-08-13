// German building standards (DIN standards)

import type { RegionalStandards } from '../core/types'

export const germanStandards: RegionalStandards = {
  code: 'DE',
  name: 'Germany',
  nameKey: 'regions.germany',
  units: {
    system: 'metric',
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
      HEIGHT: { min: 18, max: 50 }
    }
  },
  presets: {
    WINDOWS: [
      { name: 'Small', nameKey: 'presets.windows.small', width: 60, height: 90 },
      { name: 'Medium', nameKey: 'presets.windows.medium', width: 80, height: 120 },
      { name: 'Large', nameKey: 'presets.windows.large', width: 120, height: 150 },
      { name: 'Extra Large', nameKey: 'presets.windows.extra_large', width: 180, height: 210 }
    ],
    DOORS: [
      { name: 'Standard', nameKey: 'presets.doors.standard', width: 80, height: 198.5 }, // DIN standard
      { name: 'Wide', nameKey: 'presets.doors.wide', width: 90, height: 198.5 },
      { name: 'Double', nameKey: 'presets.doors.double', width: 160, height: 198.5 },
      { name: 'Large', nameKey: 'presets.doors.large', width: 100, height: 223.5 }
    ]
  },
  practices: {
    standardFloorHeight: 250, // German standard ceiling height
    standardWallThickness: 25, // Thicker walls for insulation
    typicalRoomHeight: 240,
    standardDoorHeight: 198.5, // DIN 18101 standard
    standardWindowSill: 85
  },
  codes: {
    minimumCeilingHeight: 240, // German building code (DIN 18065)
    minimumWindowSize: 100,
    accessibilityRequirements: {
      doorWidth: 90, // DIN 18040 accessibility standard
      corridorWidth: 120
    }
  }
}