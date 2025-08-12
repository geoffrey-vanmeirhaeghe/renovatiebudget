import type { WindowOrDoor, Floor } from '~/types/project'

/**
 * Calculate 3D position for windows/doors based on floor and orientation
 */
export const calcOffsetPosition = (
  shape: WindowOrDoor, 
  floorWidth: number, 
  floorDepth: number, 
  floorHeight: number, 
  storey: number
): [number, number, number] => {
  // Convert all dimensions from cm to meters
  const floorWidthM = cmToThreeUnits(floorWidth)
  const floorDepthM = cmToThreeUnits(floorDepth)
  const floorHeightM = cmToThreeUnits(floorHeight)
  const shapeHeightM = cmToThreeUnits(shape.height)
  const positionXM = cmToThreeUnits(shape.position.x)
  const positionYM = cmToThreeUnits(shape.position.y)
  
  let x: number
  let y: number
  let z: number

  switch (shape.position.orientation) {
    case 'front':
      x = -(positionXM - (floorWidthM / 2))
      y = positionYM + (shapeHeightM / 2) + (floorHeightM * storey)
      z = floorDepthM / 2
      return [z, y, x]

    case 'back':
      x = (positionXM - (floorWidthM / 2))
      y = positionYM + (shapeHeightM / 2) + (floorHeightM * storey)
      z = -floorDepthM / 2
      return [z, y, x]

    case 'left':
      x = (floorWidthM / 2)
      y = positionYM + (shapeHeightM / 2) + (floorHeightM * storey)
      z = (positionXM - (floorWidthM / 2))
      return [z, y, x]

    case 'right':
      x = -(floorWidthM / 2)
      y = positionYM + (shapeHeightM / 2) + (floorHeightM * storey)
      z = -(positionXM - (floorWidthM / 2))
      return [z, y, x]

    default:
      throw new Error(`Invalid orientation: ${shape.position.orientation}`)
  }
}

/**
 * Convert centimeters to 3D units (assuming 1 Three.js unit = 1 meter)
 */
const cmToThreeUnits = (cm: number): number => {
  return cm / 100 // Convert cm to meters
}

/**
 * Calculate 3D size for windows/doors based on orientation
 */
export const calcOffsetSize = (shape: WindowOrDoor): [number, number, number] => {
  const WALL_THICKNESS = 0.005 // 0.5cm in meters
  
  // Convert dimensions from cm to meters
  const widthM = cmToThreeUnits(shape.width)
  const heightM = cmToThreeUnits(shape.height)

  switch (shape.position.orientation) {
    case 'front':
    case 'back':
      return [WALL_THICKNESS, heightM, widthM]

    case 'left':
    case 'right':
      return [widthM, heightM, WALL_THICKNESS]

    default:
      throw new Error(`Invalid orientation: ${shape.position.orientation}`)
  }
}

/**
 * Calculate roof position based on roof dimensions
 */
export const calculateRoofPosition = (
  roof: { heightPosition: number, width: number },
  floorWidth: number
): [number, number, number] => {
  // Center the roof properly - use roof width instead of floor width for better alignment
  return [0, cmToThreeUnits(roof.heightPosition), -(cmToThreeUnits(roof.width) / 2)]
}