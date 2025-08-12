export interface Position {
  orientation: 'front' | 'back' | 'left' | 'right'
  x: number
  y: number
}

export interface WindowOrDoor {
  width: number
  height: number
  position: Position
}

export interface Floor {
  storey: number
  height: number
  heightPosition: number
  width?: number  // Individual floor width (optional, falls back to generalAttributes)
  depth?: number  // Individual floor depth (optional, falls back to generalAttributes)
  positionX?: number  // Horizontal X position (optional, defaults to 0)
  positionZ?: number  // Horizontal Z position (optional, defaults to 0)
  color: string
  windows?: Record<string, WindowOrDoor>
  doors?: Record<string, WindowOrDoor>
}

export interface PropertySize {
  width: number
  depth: number
}

export interface GeneralAttributes {
  propertySize: PropertySize
  floorSize: PropertySize
}

export interface Roof {
  type: 'gable' | 'hip' | 'flat' | 'shed'
  width: number
  depth: number
  height: number
  heightPosition: number
}

export interface Project {
  id?: string
  name?: string
  generalAttributes: GeneralAttributes
  floors: Record<string, Floor>
  roof: Roof
}