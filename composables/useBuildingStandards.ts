/**
 * International building standards composable
 * Provides region-aware building standards with backwards compatibility
 * All existing Belgian code continues to work unchanged
 */

import type { Region, RegionalConfig, RegionalAdjustments } from '~/constants/regional-standards'
import { getRegionalConfig, getRegionalAdjustments } from '~/constants/regional-standards'
import type { Unit } from '~/utils/unit-conversion'
import { formatDisplayValue, fromCm, toCm } from '~/utils/unit-conversion'
import { DIMENSION_RANGES as BELGIAN_RANGES, SIZE_PRESETS as BELGIAN_PRESETS } from '~/constants/building-standards'

// Global state for current region
const currentRegion = ref<Region>('BE') // Default to Belgium

export const useBuildingStandards = () => {
  // Current region configuration
  const regionalConfig = computed(() => getRegionalConfig(currentRegion.value))
  const regionalAdjustments = computed(() => getRegionalAdjustments(currentRegion.value))
  
  // Region management
  const setRegion = (region: Region) => {
    currentRegion.value = region
  }
  
  const getCurrentRegion = () => currentRegion.value
  
  // Display utilities
  const getDisplayUnit = () => regionalConfig.value.displayUnit
  
  const formatValue = (cmValue: number) => {
    return formatDisplayValue(cmValue, getDisplayUnit())
  }
  
  const convertToDisplay = (cmValue: number) => {
    return fromCm(cmValue, getDisplayUnit())
  }
  
  const convertFromDisplay = (displayValue: number) => {
    return toCm(displayValue, getDisplayUnit())
  }
  
  // Backwards compatible dimension ranges (returns Belgian ranges by default)
  const getDimensionRanges = () => {
    if (currentRegion.value === 'BE') {
      return BELGIAN_RANGES // Unchanged Belgian implementation
    }
    
    // For other regions, return adjusted ranges
    const adjustments = regionalAdjustments.value
    return {
      WINDOWS: {
        WIDTH: adjustments.dimensionRanges.windows.width,
        HEIGHT: adjustments.dimensionRanges.windows.height
      },
      DOORS: {
        WIDTH: adjustments.dimensionRanges.doors.width,
        HEIGHT: adjustments.dimensionRanges.doors.height
      },
      FLOORS: BELGIAN_RANGES.FLOORS // Floors are similar across regions
    }
  }
  
  // Backwards compatible size presets (returns Belgian presets by default)
  const getSizePresets = () => {
    if (currentRegion.value === 'BE') {
      return BELGIAN_PRESETS // Unchanged Belgian implementation
    }
    
    // For other regions, return adjusted presets
    const adjustments = regionalAdjustments.value
    return {
      WINDOWS: adjustments.windows.standardSizes.map(size => ({
        name: size.name,
        width: size.width,
        height: size.height
      })),
      DOORS: adjustments.doors.standardSizes.map(size => ({
        name: size.name,
        width: size.width,
        height: size.height
      }))
    }
  }
  
  // Regional building characteristics
  const getStandardFloorHeight = () => regionalConfig.value.standardFloorHeight
  const getStandardWallThickness = () => regionalConfig.value.standardWallThickness
  const getStandardCeilingHeight = () => regionalConfig.value.standardCeilingHeight
  
  // Regional features
  const getRegionalFeatures = () => regionalConfig.value.features
  
  // Localization helpers
  const getCurrency = () => regionalConfig.value.currency
  const getLocale = () => regionalConfig.value.locale
  const getMeasurementSystem = () => regionalConfig.value.measurementSystem
  
  return {
    // Region management
    setRegion,
    getCurrentRegion,
    regionalConfig,
    
    // Display utilities
    getDisplayUnit,
    formatValue,
    convertToDisplay,
    convertFromDisplay,
    
    // Backwards compatible standards (existing code continues to work)
    getDimensionRanges,
    getSizePresets,
    
    // Regional characteristics
    getStandardFloorHeight,
    getStandardWallThickness, 
    getStandardCeilingHeight,
    getRegionalFeatures,
    
    // Localization
    getCurrency,
    getLocale,
    getMeasurementSystem
  }
}

// Export backwards compatible constants
// This ensures existing code like `import { DIMENSION_RANGES } from '~/constants/building-standards'` continues to work
export const useBackwardsCompatibleStandards = () => {
  const { getDimensionRanges, getSizePresets } = useBuildingStandards()
  
  return {
    DIMENSION_RANGES: getDimensionRanges(),
    SIZE_PRESETS: getSizePresets()
  }
}