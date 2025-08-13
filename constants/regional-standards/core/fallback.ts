// Fallback mechanisms for graceful degradation

import type { RegionCode, RegionalStandards, SizePreset, DimensionRange } from './types'

export class FallbackManager {
  private static readonly FALLBACK_HIERARCHY: Record<RegionCode, RegionCode[]> = {
    BE: ['NL', 'FR', 'DE'], // Belgian fallbacks to similar European regions
    NL: ['BE', 'DE', 'GB'], // Dutch fallbacks to nearby regions
    DE: ['NL', 'BE', 'FR'], // German fallbacks to nearby regions
    FR: ['BE', 'DE', 'NL'], // French fallbacks to nearby regions
    GB: ['NL', 'DE', 'BE'], // UK fallbacks to metric European regions
    US: ['GB', 'NL', 'BE']  // US fallbacks to English-speaking then metric
  }

  /**
   * Get fallback regions in order of preference
   */
  static getFallbackRegions(region: RegionCode): RegionCode[] {
    return this.FALLBACK_HIERARCHY[region] || ['BE'] // Ultimate fallback is Belgian
  }

  /**
   * Create a safe fallback preset when regional data is missing
   */
  static createFallbackPreset(
    name: string, 
    width: number, 
    height: number, 
    targetRegion: RegionCode
  ): SizePreset {
    return {
      name: `${name} (Fallback)`,
      nameKey: `fallback.${name.toLowerCase().replace(' ', '_')}`,
      width,
      height
    }
  }

  /**
   * Create safe fallback dimension ranges
   */
  static createFallbackDimensionRange(
    min: number = 20, 
    max: number = 400
  ): DimensionRange {
    return { min, max }
  }

  /**
   * Merge regional standards with fallbacks
   */
  static mergeWithFallbacks(
    primary: Partial<RegionalStandards>,
    fallbacks: RegionalStandards[]
  ): RegionalStandards {
    // Start with the first complete fallback as base
    const base = fallbacks[0]
    
    return {
      code: primary.code || base.code,
      name: primary.name || base.name,
      nameKey: primary.nameKey || base.nameKey,
      units: primary.units || base.units,
      dimensions: {
        WINDOWS: {
          WIDTH: primary.dimensions?.WINDOWS?.WIDTH || base.dimensions.WINDOWS.WIDTH,
          HEIGHT: primary.dimensions?.WINDOWS?.HEIGHT || base.dimensions.WINDOWS.HEIGHT
        },
        DOORS: {
          WIDTH: primary.dimensions?.DOORS?.WIDTH || base.dimensions.DOORS.WIDTH,
          HEIGHT: primary.dimensions?.DOORS?.HEIGHT || base.dimensions.DOORS.HEIGHT
        },
        FLOORS: {
          HEIGHT: primary.dimensions?.FLOORS?.HEIGHT || base.dimensions.FLOORS.HEIGHT
        }
      },
      presets: {
        WINDOWS: primary.presets?.WINDOWS || base.presets.WINDOWS,
        DOORS: primary.presets?.DOORS || base.presets.DOORS
      },
      practices: {
        standardFloorHeight: primary.practices?.standardFloorHeight || base.practices.standardFloorHeight,
        standardWallThickness: primary.practices?.standardWallThickness || base.practices.standardWallThickness,
        typicalRoomHeight: primary.practices?.typicalRoomHeight || base.practices.typicalRoomHeight,
        standardDoorHeight: primary.practices?.standardDoorHeight || base.practices.standardDoorHeight,
        standardWindowSill: primary.practices?.standardWindowSill || base.practices.standardWindowSill
      },
      codes: primary.codes || base.codes
    }
  }

  /**
   * Validate regional standards completeness
   */
  static validateStandards(standards: Partial<RegionalStandards>): {
    isValid: boolean
    missingFields: string[]
  } {
    const required = [
      'code', 'name', 'units', 'dimensions', 'presets', 'practices'
    ]
    
    const missingFields: string[] = []
    
    for (const field of required) {
      if (!standards[field as keyof RegionalStandards]) {
        missingFields.push(field)
      }
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    }
  }

  /**
   * Create emergency fallback standards (minimal but functional)
   */
  static createEmergencyFallback(region: RegionCode): RegionalStandards {
    return {
      code: region,
      name: `${region} (Emergency Fallback)`,
      units: {
        system: 'metric',
        length: 'cm',
        lengthDisplay: 'cm',
        precision: 1
      },
      dimensions: {
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
        WINDOWS: [
          { name: 'Small', width: 60, height: 80 },
          { name: 'Medium', width: 80, height: 120 },
          { name: 'Large', width: 120, height: 140 }
        ],
        DOORS: [
          { name: 'Standard', width: 80, height: 200 },
          { name: 'Wide', width: 100, height: 200 }
        ]
      },
      practices: {
        standardFloorHeight: 270,
        standardWallThickness: 20,
        typicalRoomHeight: 250,
        standardDoorHeight: 200,
        standardWindowSill: 90
      }
    }
  }
}