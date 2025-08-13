/**
 * Unit conversion utilities for international building standards
 * All internal data remains in centimeters (Belgian standard)
 * Conversions happen only at display/input boundaries
 */

export type Unit = 'cm' | 'mm' | 'in' | 'ft' | 'm'

export interface UnitConfig {
  symbol: string
  name: string
  precision: number // decimal places for display
}

export const UNIT_CONFIGS: Record<Unit, UnitConfig> = {
  cm: { symbol: 'cm', name: 'centimeters', precision: 0 },
  mm: { symbol: 'mm', name: 'millimeters', precision: 0 },
  in: { symbol: 'in', name: 'inches', precision: 1 },
  ft: { symbol: 'ft', name: 'feet', precision: 2 },
  m: { symbol: 'm', name: 'meters', precision: 2 }
}

// Conversion factors to centimeters (base unit)
const TO_CM_FACTORS: Record<Unit, number> = {
  cm: 1,
  mm: 0.1,
  in: 2.54,
  ft: 30.48,
  m: 100
}

/**
 * Convert between units
 * @param value - Value to convert
 * @param fromUnit - Source unit
 * @param toUnit - Target unit
 * @returns Converted value
 */
export const convertUnits = (value: number, fromUnit: Unit, toUnit: Unit): number => {
  if (fromUnit === toUnit) return value
  
  // Convert to base (cm) then to target unit
  const cmValue = value * TO_CM_FACTORS[fromUnit]
  return cmValue / TO_CM_FACTORS[toUnit]
}

/**
 * Convert from internal cm to display unit
 * @param cmValue - Value in centimeters (internal format)
 * @param targetUnit - Unit to display in
 * @returns Converted value
 */
export const fromCm = (cmValue: number, targetUnit: Unit): number => {
  return convertUnits(cmValue, 'cm', targetUnit)
}

/**
 * Convert from display unit to internal cm
 * @param value - Value in display unit
 * @param sourceUnit - Unit the value is currently in
 * @returns Value in centimeters (internal format)
 */
export const toCm = (value: number, sourceUnit: Unit): number => {
  return convertUnits(value, sourceUnit, 'cm')
}

/**
 * Format a value for display with proper precision and unit symbol
 * @param cmValue - Value in centimeters (internal format)
 * @param displayUnit - Unit to display in
 * @returns Formatted string with value and unit
 */
export const formatDisplayValue = (cmValue: number, displayUnit: Unit): string => {
  const convertedValue = fromCm(cmValue, displayUnit)
  const config = UNIT_CONFIGS[displayUnit]
  const roundedValue = Number(convertedValue.toFixed(config.precision))
  
  return `${roundedValue} ${config.symbol}`
}

/**
 * Parse a display string back to internal cm value
 * @param displayString - String like "47.2 in" or "120 cm"
 * @returns Value in centimeters
 */
export const parseDisplayValue = (displayString: string): number => {
  const trimmed = displayString.trim()
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/)
  
  if (!match) {
    throw new Error(`Invalid display value format: ${displayString}`)
  }
  
  const [, valueStr, unitStr] = match
  const value = parseFloat(valueStr)
  const unit = unitStr.toLowerCase() as Unit
  
  if (!TO_CM_FACTORS[unit]) {
    throw new Error(`Unsupported unit: ${unit}`)
  }
  
  return toCm(value, unit)
}

/**
 * Round value to appropriate precision for given unit
 * @param value - Value to round
 * @param unit - Unit determines precision
 * @returns Rounded value
 */
export const roundToUnitPrecision = (value: number, unit: Unit): number => {
  const precision = UNIT_CONFIGS[unit].precision
  return Number(value.toFixed(precision))
}