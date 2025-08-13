// Core type definitions for international building standards

export type RegionCode = 'BE' | 'NL' | 'DE' | 'FR' | 'GB' | 'US'

export type UnitSystem = 'metric' | 'imperial'

export interface UnitConfig {
  system: UnitSystem
  length: 'cm' | 'mm' | 'in' | 'ft'
  lengthDisplay: string
  precision: number
}

export interface DimensionRange {
  min: number
  max: number
}

export interface StandardDimensions {
  WINDOWS: {
    WIDTH: DimensionRange
    HEIGHT: DimensionRange
  }
  DOORS: {
    WIDTH: DimensionRange
    HEIGHT: DimensionRange
  }
  FLOORS: {
    HEIGHT: DimensionRange
  }
}

export interface SizePreset {
  name: string
  nameKey?: string  // For i18n
  width: number
  height: number
}

export interface SizePresets {
  WINDOWS: SizePreset[]
  DOORS: SizePreset[]
}

export interface BuildingPractices {
  standardFloorHeight: number
  standardWallThickness: number
  typicalRoomHeight: number
  standardDoorHeight: number
  standardWindowSill: number
}

export interface RegionalStandards {
  code: RegionCode
  name: string
  nameKey?: string  // For i18n
  units: UnitConfig
  dimensions: StandardDimensions
  presets: SizePresets
  practices: BuildingPractices
  // Region-specific building codes
  codes?: {
    minimumCeilingHeight?: number
    minimumWindowSize?: number
    accessibilityRequirements?: any
  }
}

export interface ConversionResult {
  value: number
  unit: string
  originalValue: number
  originalUnit: string
}

// Template system types
export interface ElementTemplate {
  id: string
  name: string
  nameKey?: string
  width: number
  height: number
  category: 'standard' | 'large' | 'small' | 'custom'
  region: RegionCode
  description?: string
  descriptionKey?: string
}

export interface WindowTemplate extends ElementTemplate {
  type: 'single' | 'double' | 'bay' | 'french' | 'sliding'
  glazingType?: 'single' | 'double' | 'triple'
}

export interface DoorTemplate extends ElementTemplate {
  type: 'standard' | 'double' | 'sliding' | 'french' | 'bi-fold'
  material?: 'wood' | 'metal' | 'glass' | 'composite'
}

// Runtime configuration
export interface BuildingStandardsConfig {
  currentRegion: RegionCode
  fallbackRegion: RegionCode
  enableUnitConversion: boolean
  autoDetectRegion: boolean
}