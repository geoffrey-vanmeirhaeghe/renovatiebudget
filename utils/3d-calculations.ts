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
  let x: number
  let y: number
  let z: number

  switch (shape.position.orientation) {
    case 'front':
      x = -(shape.position.x - (floorWidth / 2))
      y = shape.position.y + (shape.height / 2) + (floorHeight * storey)
      z = floorDepth / 2
      return [z, y, x]

    case 'back':
      x = (shape.position.x - (floorWidth / 2))
      y = shape.position.y + (shape.height / 2) + (floorHeight * storey)
      z = -floorDepth / 2
      return [z, y, x]

    case 'left':
      x = (floorWidth / 2)
      y = shape.position.y + (shape.height / 2) + (floorHeight * storey)
      z = (shape.position.x - (floorWidth / 2))
      return [z, y, x]

    case 'right':
      x = -(floorWidth / 2)
      y = shape.position.y + (shape.height / 2) + (floorHeight * storey)
      z = -(shape.position.x - (floorWidth / 2))
      return [z, y, x]

    default:
      throw new Error(`Invalid orientation: ${shape.position.orientation}`)
  }
}

/**
 * Calculate 3D size for windows/doors based on orientation
 */
export const calcOffsetSize = (shape: WindowOrDoor): [number, number, number] => {
  const WALL_THICKNESS = 0.5

  switch (shape.position.orientation) {
    case 'front':
    case 'back':
      return [WALL_THICKNESS, shape.height, shape.width]

    case 'left':
    case 'right':
      return [shape.width, shape.height, WALL_THICKNESS]

    default:
      throw new Error(`Invalid orientation: ${shape.position.orientation}`)
  }
}

/**
 * Calculate roof position based on floor dimensions
 */
export const calculateRoofPosition = (
  roof: { heightPosition: number },
  floorWidth: number
): [number, number, number] => {
  return [0, roof.heightPosition, -(floorWidth / 2)]
}