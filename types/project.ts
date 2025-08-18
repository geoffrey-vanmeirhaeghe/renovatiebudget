// Flexible position interface for future 3D coordinates
export interface Position {
  orientation: 'front' | 'back' | 'left' | 'right'
  x: number
  y: number
  z?: number  // For future 3D positioning
}

// Base element interface for extensibility
export interface BaseElement {
  id?: string
  width: number
  height: number
  position: Position
  metadata?: Record<string, any>  // For custom properties
}

// Window and door interface extending base element
export interface WindowOrDoor extends BaseElement {
  type?: 'standard' | 'french' | 'sliding' | 'folding' | string  // Extensible types
  material?: string
  glazing?: 'single' | 'double' | 'triple'
  frame?: string
}

// Floor interface with extensible properties
export interface Floor {
  storey: number
  height: number
  heightPosition: number
  width?: number  // Individual floor width (optional, falls back to generalAttributes)
  depth?: number  // Individual floor depth (optional, falls back to generalAttributes)
  positionX?: number  // Horizontal X position (optional, defaults to 0)
  positionZ?: number  // Horizontal Z position (optional, defaults to 0)
  color: string
  
  // Element collections - extensible for future element types
  windows?: Record<string, WindowOrDoor>
  doors?: Record<string, WindowOrDoor>
  walls?: Record<string, any>  // Future wall elements
  furniture?: Record<string, any>  // Future furniture elements
  
  // Metadata for custom properties
  metadata?: Record<string, any>
}

// Property size interface
export interface PropertySize {
  width: number
  depth: number
  area?: number  // Calculated or manual override
}

// General attributes interface
export interface GeneralAttributes {
  propertySize: PropertySize
  floorSize: PropertySize
  
  // Building standards and constraints
  region?: string  // For regional building standards
  buildingCode?: string
  
  // Metadata for extensibility
  metadata?: Record<string, any>
}

// Roof interface with extensible types
export interface Roof {
  type: 'gable' | 'hip' | 'flat' | 'shed' | string  // Allow custom types
  width: number
  depth: number
  height: number
  heightPosition: number
  positionX?: number  // Horizontal X position (optional, defaults to 0)
  positionZ?: number  // Horizontal Z position (optional, defaults to 0)
  
  // Roof-specific properties
  pitch?: number  // Roof angle in degrees
  overhang?: number  // Roof overhang distance
  material?: string
  
  // Metadata for custom properties
  metadata?: Record<string, any>
}

// Main project interface
export interface Project {
  id?: string
  name?: string
  description?: string
  
  // Core structure
  generalAttributes: GeneralAttributes
  floors: Record<string, Floor>
  roof: Roof
  
  // Project metadata
  createdAt?: string
  updatedAt?: string
  version?: string
  
  // User and collaboration
  ownerId?: string
  collaborators?: string[]
  
  // Settings and preferences
  settings?: {
    units?: 'metric' | 'imperial'
    precision?: number
    autoSave?: boolean
    [key: string]: any  // Extensible settings
  }
  
  // Custom data for plugins/extensions
  metadata?: Record<string, any>
}

// Type guards for element identification
export function isWindow(element: any): element is WindowOrDoor {
  return element && typeof element.width === 'number' && element.position
}

export function isDoor(element: any): element is WindowOrDoor {
  return element && typeof element.width === 'number' && element.position
}

export function isFloor(element: any): element is Floor {
  return element && typeof element.storey === 'number' && typeof element.height === 'number'
}

export function isRoof(element: any): element is Roof {
  return element && element.type && typeof element.width === 'number'
}

// Element type enumeration for type safety
export enum ElementType {
  FLOOR = 'floor',
  WINDOW = 'window',
  DOOR = 'door',
  ROOF = 'roof',
  WALL = 'wall',
  FURNITURE = 'furniture'
}

// Element union type for flexible handling
export type ProjectElement = Floor | WindowOrDoor | Roof | any

// Helper types for component props and events
export type ElementId = string | number
export type FloorId = string | number

// Validation interfaces
export interface ValidationRule {
  field: string
  rule: 'required' | 'min' | 'max' | 'range' | 'custom'
  value?: any
  message?: string
  validator?: (value: any, element?: any) => boolean
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string[]>
  warnings?: Record<string, string[]>
}

// Configuration interfaces for flexible components
export interface ElementConfig {
  type: ElementType
  allowedProperties: string[]
  requiredProperties: string[]
  defaultValues: Record<string, any>
  validationRules: ValidationRule[]
  displayName: string
  icon?: string
}

// Export helper for element configurations
export const ElementConfigs: Record<ElementType, ElementConfig> = {
  [ElementType.FLOOR]: {
    type: ElementType.FLOOR,
    allowedProperties: ['storey', 'height', 'color', 'width', 'depth'],
    requiredProperties: ['storey', 'height', 'color'],
    defaultValues: { height: 250, color: '#f0f0f0' },
    validationRules: [
      { field: 'height', rule: 'range', value: [200, 400], message: 'Height must be between 200-400cm' }
    ],
    displayName: 'Floor',
    icon: '🏢'
  },
  [ElementType.WINDOW]: {
    type: ElementType.WINDOW,
    allowedProperties: ['width', 'height', 'position', 'type', 'material'],
    requiredProperties: ['width', 'height', 'position'],
    defaultValues: { width: 120, height: 140 },
    validationRules: [
      { field: 'width', rule: 'range', value: [40, 300], message: 'Width must be between 40-300cm' }
    ],
    displayName: 'Window',
    icon: '🪟'
  },
  [ElementType.DOOR]: {
    type: ElementType.DOOR,
    allowedProperties: ['width', 'height', 'position', 'type', 'material'],
    requiredProperties: ['width', 'height', 'position'],
    defaultValues: { width: 80, height: 210 },
    validationRules: [
      { field: 'width', rule: 'range', value: [60, 120], message: 'Width must be between 60-120cm' }
    ],
    displayName: 'Door',
    icon: '🚪'
  },
  [ElementType.ROOF]: {
    type: ElementType.ROOF,
    allowedProperties: ['type', 'width', 'depth', 'height', 'pitch', 'material'],
    requiredProperties: ['type', 'width', 'depth', 'height'],
    defaultValues: { type: 'gable', height: 300 },
    validationRules: [],
    displayName: 'Roof',
    icon: '🏠'
  },
  [ElementType.WALL]: {
    type: ElementType.WALL,
    allowedProperties: ['width', 'height', 'thickness', 'material'],
    requiredProperties: ['width', 'height'],
    defaultValues: { thickness: 20 },
    validationRules: [],
    displayName: 'Wall',
    icon: '🧱'
  },
  [ElementType.FURNITURE]: {
    type: ElementType.FURNITURE,
    allowedProperties: ['width', 'depth', 'height', 'type', 'position'],
    requiredProperties: ['width', 'depth', 'height'],
    defaultValues: {},
    validationRules: [],
    displayName: 'Furniture',
    icon: '🪑'
  }
}