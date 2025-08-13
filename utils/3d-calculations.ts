import type { WindowOrDoor, Floor } from '~/types/project'

/**
 * COORDINATE SYSTEM EXPLANATION:
 * 
 * Logical Positioning (UI/Input):
 * - Left-bottom origin system: (0,0) = left-bottom reference point for ALL walls
 * - For front wall: position 0 = leftmost edge when looking at front of building
 * - For back wall: position 0 = leftmost edge when looking at back of building (same left as front)
 * - For left wall: position 0 = frontmost edge when looking along left wall
 * - For right wall: position 0 = frontmost edge when looking along right wall
 * - Y-axis: 0 = floor level, increases upward
 * - Element positioning: Element's left/front edge is placed at the specified position
 * 
 * Three.js World Coordinates:
 * - Center origin: (0,0,0) = center of floor
 * - X-axis: negative = left side, positive = right side (when looking from front)
 * - Y-axis: negative = down, positive = up  
 * - Z-axis: negative = back, positive = front
 * 
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
  const shapeWidthM = cmToThreeUnits(shape.width)
  const positionXM = cmToThreeUnits(shape.position.x)
  const positionYM = cmToThreeUnits(shape.position.y)
  
  let x: number
  let y: number
  let z: number

  switch (shape.position.orientation) {
    case 'front':
      // Front wall: positionX=0 means left edge of element aligns with left edge of floor
      // Lower positionX values should move element further left (more negative X)
      x = floorWidthM / 2 - positionXM - shapeWidthM / 2
      y = positionYM + shapeHeightM / 2 + (floorHeightM * storey)
      z = floorDepthM / 2
      return [z, y, x]

    case 'back':
      // Back wall: positionX=0 means left edge from user perspective when facing back wall
      // For consistent left-edge reference, use same logic as front wall but negate Z
      x = -(floorWidthM / 2 - positionXM - shapeWidthM / 2)
      y = positionYM + shapeHeightM / 2 + (floorHeightM * storey)
      z = -floorDepthM / 2
      return [z, y, x]

    case 'left':
      // Left wall: position 0 = left reference point from user perspective (front of building)
      x = floorWidthM / 2
      y = positionYM + shapeHeightM / 2 + (floorHeightM * storey)
      z = -(floorDepthM / 2 - positionXM - shapeWidthM / 2)
      return [z, y, x]

    case 'right':
      // Right wall: positionX=0 means left edge from user perspective when facing right wall
      // This corresponds to the front of the building, so use positive Z direction
      x = -floorWidthM / 2
      y = positionYM + shapeHeightM / 2 + (floorHeightM * storey)
      z = floorDepthM / 2 - positionXM - shapeWidthM / 2
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
 * Validate element positioning to ensure it stays within floor bounds
 * @param element - The window or door element
 * @param floorWidth - Width of the floor in cm
 * @param floorDepth - Depth of the floor in cm
 * @returns Object indicating if position is valid and what the corrected position should be
 */
export const validateElementPosition = (
  element: WindowOrDoor, 
  floorWidth: number, 
  floorDepth: number
): { isValid: boolean; correctedX: number; maxX: number } => {
  const { orientation, x } = element.position
  const elementWidth = element.width
  
  let maxPosition: number
  
  if (orientation === 'front' || orientation === 'back') {
    // For front/back walls, element moves along floor width
    maxPosition = floorWidth - elementWidth
  } else {
    // For left/right walls, element moves along floor depth  
    maxPosition = floorDepth - elementWidth
  }
  
  const isValid = x >= 0 && x <= maxPosition
  const correctedX = Math.max(0, Math.min(x, maxPosition))
  
  return {
    isValid,
    correctedX,
    maxX: maxPosition
  }
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