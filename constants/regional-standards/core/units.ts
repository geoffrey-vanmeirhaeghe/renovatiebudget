// Unit system definitions and conversion utilities

import type { UnitConfig, UnitSystem, ConversionResult, RegionCode } from './types'

export const UNIT_CONFIGS: Record<RegionCode, UnitConfig> = {
  BE: {
    system: 'metric',
    length: 'cm',
    lengthDisplay: 'cm',
    precision: 1
  },
  NL: {
    system: 'metric',
    length: 'cm',
    lengthDisplay: 'cm',
    precision: 1
  },
  DE: {
    system: 'metric',
    length: 'cm',
    lengthDisplay: 'cm',
    precision: 1
  },
  FR: {
    system: 'metric',
    length: 'cm',
    lengthDisplay: 'cm',
    precision: 1
  },
  GB: {
    system: 'metric', // Modern UK construction uses metric
    length: 'cm',
    lengthDisplay: 'cm',
    precision: 1
  },
  US: {
    system: 'imperial',
    length: 'in',
    lengthDisplay: 'inches',
    precision: 0.25
  }
}

// Conversion factors to centimeters (base unit)
const CONVERSION_TO_CM: Record<string, number> = {
  mm: 0.1,
  cm: 1,
  m: 100,
  in: 2.54,
  ft: 30.48
}

export class UnitConverter {
  /**
   * Convert a value from one unit to another
   */
  static convert(value: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return value
    
    // Convert to centimeters first, then to target unit
    const valueInCm = value * CONVERSION_TO_CM[fromUnit]
    return valueInCm / CONVERSION_TO_CM[toUnit]
  }

  /**
   * Convert value with full result metadata
   */
  static convertWithMetadata(
    value: number, 
    fromUnit: string, 
    toUnit: string
  ): ConversionResult {
    const convertedValue = this.convert(value, fromUnit, toUnit)
    
    return {
      value: convertedValue,
      unit: toUnit,
      originalValue: value,
      originalUnit: fromUnit
    }
  }

  /**
   * Format a value according to regional unit preferences
   */
  static formatForRegion(value: number, region: RegionCode): string {
    const unitConfig = UNIT_CONFIGS[region]
    const precision = unitConfig.precision
    
    // Round to appropriate precision
    const roundedValue = Math.round(value / precision) * precision
    
    return `${roundedValue}${unitConfig.lengthDisplay}`
  }

  /**
   * Convert a value from base units (cm) to regional units
   */
  static toRegionalUnits(valueInCm: number, region: RegionCode): number {
    const targetUnit = UNIT_CONFIGS[region].length
    return this.convert(valueInCm, 'cm', targetUnit)
  }

  /**
   * Convert a value from regional units to base units (cm)
   */
  static fromRegionalUnits(value: number, region: RegionCode): number {
    const sourceUnit = UNIT_CONFIGS[region].length
    return this.convert(value, sourceUnit, 'cm')
  }

  /**
   * Batch convert an array of values
   */
  static convertBatch(
    values: number[], 
    fromUnit: string, 
    toUnit: string
  ): number[] {
    return values.map(value => this.convert(value, fromUnit, toUnit))
  }

  /**
   * Get the display unit for a region
   */
  static getDisplayUnit(region: RegionCode): string {
    return UNIT_CONFIGS[region].lengthDisplay
  }

  /**
   * Check if two regions use compatible unit systems
   */
  static areUnitsCompatible(region1: RegionCode, region2: RegionCode): boolean {
    return UNIT_CONFIGS[region1].system === UNIT_CONFIGS[region2].system
  }
}