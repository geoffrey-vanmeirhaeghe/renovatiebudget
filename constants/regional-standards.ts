/**
 * Regional building standards system
 * Extends Belgian standards to support international regions
 * All values stored internally in centimeters, converted at display time
 */

import type { Unit } from '~/utils/unit-conversion'
import { DIMENSION_RANGES as BELGIAN_RANGES, SIZE_PRESETS as BELGIAN_PRESETS } from './building-standards'

export type Region = 'BE' | 'NL' | 'DE' | 'FR' | 'UK' | 'US'

export interface RegionalConfig {
  code: Region
  name: string
  displayUnit: Unit
  currency: string
  locale: string
  
  // Regional building characteristics
  standardFloorHeight: number // cm
  standardWallThickness: number // cm
  standardCeilingHeight: number // cm
  
  // Regional measurement preferences
  measurementSystem: 'metric' | 'imperial' | 'mixed'
  
  // Regional building code features
  features: {
    requiresAccessibility: boolean
    hasInsulationStandards: boolean
    requiresEnergyRating: boolean
  }
}

export const REGIONAL_CONFIGS: Record<Region, RegionalConfig> = {
  BE: {
    code: 'BE',
    name: 'Belgium',
    displayUnit: 'cm',
    currency: 'EUR',
    locale: 'nl-BE',
    standardFloorHeight: 270,
    standardWallThickness: 20,
    standardCeilingHeight: 250,
    measurementSystem: 'metric',
    features: {
      requiresAccessibility: true,
      hasInsulationStandards: true,
      requiresEnergyRating: true
    }
  },
  
  NL: {
    code: 'NL',
    name: 'Netherlands',
    displayUnit: 'cm',
    currency: 'EUR',
    locale: 'nl-NL',
    standardFloorHeight: 260,
    standardWallThickness: 20,
    standardCeilingHeight: 240,
    measurementSystem: 'metric',
    features: {
      requiresAccessibility: true,
      hasInsulationStandards: true,
      requiresEnergyRating: true
    }
  },
  
  DE: {
    code: 'DE',
    name: 'Germany',
    displayUnit: 'cm',
    currency: 'EUR',
    locale: 'de-DE',
    standardFloorHeight: 250,
    standardWallThickness: 24,
    standardCeilingHeight: 240,
    measurementSystem: 'metric',
    features: {
      requiresAccessibility: true,
      hasInsulationStandards: true,
      requiresEnergyRating: true
    }
  },
  
  FR: {
    code: 'FR',
    name: 'France',
    displayUnit: 'cm',
    currency: 'EUR',
    locale: 'fr-FR',
    standardFloorHeight: 250,
    standardWallThickness: 20,
    standardCeilingHeight: 240,
    measurementSystem: 'metric',
    features: {
      requiresAccessibility: true,
      hasInsulationStandards: true,
      requiresEnergyRating: true
    }
  },
  
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    displayUnit: 'cm', // Modern UK construction uses metric
    currency: 'GBP',
    locale: 'en-GB',
    standardFloorHeight: 240,
    standardWallThickness: 15,
    standardCeilingHeight: 230,
    measurementSystem: 'mixed',
    features: {
      requiresAccessibility: true,
      hasInsulationStandards: true,
      requiresEnergyRating: true
    }
  },
  
  US: {
    code: 'US',
    name: 'United States',
    displayUnit: 'in',
    currency: 'USD',
    locale: 'en-US',
    standardFloorHeight: 244, // 8 feet = 243.84 cm
    standardWallThickness: 15, // 2x6 framing
    standardCeilingHeight: 244,
    measurementSystem: 'imperial',
    features: {
      requiresAccessibility: true,
      hasInsulationStandards: false, // Varies by state
      requiresEnergyRating: false
    }
  }
}

/**
 * Regional dimension adjustments
 * These modify the Belgian base standards to match regional preferences
 */
export interface RegionalAdjustments {
  windows: {
    widthMultiplier: number
    heightMultiplier: number
    standardSizes: Array<{ width: number; height: number; name: string }> // in cm
  }
  doors: {
    widthMultiplier: number
    heightMultiplier: number
    standardSizes: Array<{ width: number; height: number; name: string }> // in cm
  }
  dimensionRanges: {
    windows: {
      width: { min: number; max: number }
      height: { min: number; max: number }
    }
    doors: {
      width: { min: number; max: number }
      height: { min: number; max: number }
    }
  }
}

export const REGIONAL_ADJUSTMENTS: Record<Region, RegionalAdjustments> = {
  BE: {
    // Belgium is the base standard - no adjustments
    windows: {
      widthMultiplier: 1.0,
      heightMultiplier: 1.0,
      standardSizes: [
        { width: 90, height: 120, name: 'Small' },
        { width: 120, height: 140, name: 'Medium' },
        { width: 150, height: 160, name: 'Large' }
      ]
    },
    doors: {
      widthMultiplier: 1.0,
      heightMultiplier: 1.0,
      standardSizes: [
        { width: 78, height: 201.5, name: 'Standard' },
        { width: 88, height: 201.5, name: 'Wide' },
        { width: 140, height: 201.5, name: 'Double' }
      ]
    },
    dimensionRanges: {
      windows: { width: { min: 40, max: 400 }, height: { min: 60, max: 400 } },
      doors: { width: { min: 60, max: 200 }, height: { min: 180, max: 220 } }
    }
  },
  
  NL: {
    // Netherlands - very similar to Belgium
    windows: {
      widthMultiplier: 1.0,
      heightMultiplier: 1.0,
      standardSizes: [
        { width: 90, height: 115, name: 'Small' },
        { width: 115, height: 140, name: 'Medium' },
        { width: 145, height: 165, name: 'Large' }
      ]
    },
    doors: {
      widthMultiplier: 1.0,
      heightMultiplier: 0.98, // Slightly shorter
      standardSizes: [
        { width: 78, height: 198, name: 'Standard' },
        { width: 88, height: 198, name: 'Wide' },
        { width: 156, height: 198, name: 'Double' }
      ]
    },
    dimensionRanges: {
      windows: { width: { min: 40, max: 400 }, height: { min: 60, max: 400 } },
      doors: { width: { min: 60, max: 200 }, height: { min: 180, max: 220 } }
    }
  },
  
  DE: {
    // Germany - DIN standards
    windows: {
      widthMultiplier: 1.05,
      heightMultiplier: 1.1,
      standardSizes: [
        { width: 100, height: 120, name: 'Standard' },
        { width: 125, height: 140, name: 'Medium' },
        { width: 150, height: 180, name: 'Large' }
      ]
    },
    doors: {
      widthMultiplier: 1.0,
      heightMultiplier: 0.985, // German standard height
      standardSizes: [
        { width: 75, height: 198.5, name: 'Standard' },
        { width: 87.5, height: 198.5, name: 'Wide' },
        { width: 150, height: 198.5, name: 'Double' }
      ]
    },
    dimensionRanges: {
      windows: { width: { min: 50, max: 400 }, height: { min: 60, max: 400 } },
      doors: { width: { min: 60, max: 200 }, height: { min: 180, max: 220 } }
    }
  },
  
  FR: {
    // France - similar to Belgium but different proportions
    windows: {
      widthMultiplier: 1.0,
      heightMultiplier: 1.15, // French prefer taller windows
      standardSizes: [
        { width: 90, height: 135, name: 'Standard' },
        { width: 120, height: 155, name: 'Medium' },
        { width: 150, height: 180, name: 'Large' }
      ]
    },
    doors: {
      widthMultiplier: 1.0,
      heightMultiplier: 1.0,
      standardSizes: [
        { width: 80, height: 200, name: 'Standard' },
        { width: 90, height: 200, name: 'Wide' },
        { width: 160, height: 200, name: 'Double' }
      ]
    },
    dimensionRanges: {
      windows: { width: { min: 40, max: 400 }, height: { min: 60, max: 400 } },
      doors: { width: { min: 60, max: 200 }, height: { min: 180, max: 220 } }
    }
  },
  
  UK: {
    // UK - metric measurements but different standards
    windows: {
      widthMultiplier: 1.0,
      heightMultiplier: 1.0,
      standardSizes: [
        { width: 91, height: 122, name: 'Standard' }, // Roughly 3x4 feet
        { width: 122, height: 137, name: 'Medium' },
        { width: 152, height: 152, name: 'Large' }
      ]
    },
    doors: {
      widthMultiplier: 1.0,
      heightMultiplier: 0.95,
      standardSizes: [
        { width: 76, height: 195, name: 'Standard' },
        { width: 84, height: 195, name: 'Wide' },
        { width: 152, height: 195, name: 'Double' }
      ]
    },
    dimensionRanges: {
      windows: { width: { min: 45, max: 400 }, height: { min: 60, max: 400 } },
      doors: { width: { min: 60, max: 200 }, height: { min: 180, max: 220 } }
    }
  },
  
  US: {
    // United States - converted from imperial standards
    windows: {
      widthMultiplier: 1.2,
      heightMultiplier: 1.0,
      standardSizes: [
        { width: 91, height: 122, name: 'Standard' }, // 3x4 feet
        { width: 122, height: 122, name: 'Square' }, // 4x4 feet
        { width: 152, height: 137, name: 'Large' } // 5x4.5 feet
      ]
    },
    doors: {
      widthMultiplier: 1.1,
      heightMultiplier: 0.98,
      standardSizes: [
        { width: 81, height: 198, name: 'Standard' }, // 32" x 78"
        { width: 91, height: 198, name: 'Wide' }, // 36" x 78"
        { width: 152, height: 198, name: 'Double' } // 60" x 78"
      ]
    },
    dimensionRanges: {
      windows: { width: { min: 50, max: 400 }, height: { min: 60, max: 400 } },
      doors: { width: { min: 60, max: 200 }, height: { min: 180, max: 220 } }
    }
  }
}

/**
 * Get regional configuration for a given region
 * Falls back to Belgian standards if region not found
 */
export const getRegionalConfig = (region: Region): RegionalConfig => {
  return REGIONAL_CONFIGS[region] || REGIONAL_CONFIGS.BE
}

/**
 * Get regional adjustments for a given region
 * Falls back to Belgian standards if region not found
 */
export const getRegionalAdjustments = (region: Region): RegionalAdjustments => {
  return REGIONAL_ADJUSTMENTS[region] || REGIONAL_ADJUSTMENTS.BE
}