export const VISUALIZATION_DEFAULTS = {
  CAMERA_POSITION_MULTIPLIER: 2.5,
  WALL_THICKNESS: 0.5,
  GRID_SIZE: 250,
  GRID_DIVISIONS: 20,
  AMBIENT_LIGHT_INTENSITY: 0.75,
} as const

export const COLORS = {
  SURFACE: '#ffff99',
  DOOR: '#5c6063',
  WINDOW: '#bdd7ff',
  ROOF: '#963411',
} as const

export const MATERIAL_TYPES = {
  FLOOR: 'TresMeshToonMaterial',
  SURFACE: 'TresMeshToonMaterial',
  ARCHITECTURAL: 'TresMeshToonMaterial',
} as const