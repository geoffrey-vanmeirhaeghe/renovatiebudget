/**
 * Test file to validate 3D positioning calculations
 * Run with: npx ts-node utils/positioning-test.ts
 */

import { calcOffsetPosition, validateElementPosition } from './3d-calculations'
import type { WindowOrDoor } from '~/types/project'

// Test floor dimensions (1000cm x 800cm = 10m x 8m)
const TEST_FLOOR_WIDTH = 1000 // cm
const TEST_FLOOR_DEPTH = 800  // cm
const TEST_FLOOR_HEIGHT = 280 // cm

console.log('🏠 3D Positioning Test Suite')
console.log('='.repeat(50))
console.log(`Floor: ${TEST_FLOOR_WIDTH}cm x ${TEST_FLOOR_DEPTH}cm x ${TEST_FLOOR_HEIGHT}cm`)
console.log('')

// Test cases for front wall positioning
console.log('🔍 Testing Front Wall Positioning:')
const frontTests = [
  { name: 'Left edge (position 0)', x: 0, width: 120 },
  { name: 'Center-ish', x: 440, width: 120 }, // 440 + 120 = 560, centered in 1000cm
  { name: 'Right edge (max position)', x: 880, width: 120 }, // 880 + 120 = 1000
  { name: 'Outside bounds (should be invalid)', x: 950, width: 120 },
]

frontTests.forEach(test => {
  const element: WindowOrDoor = {
    width: test.width,
    height: 210,
    position: { orientation: 'front', x: test.x, y: 20 }
  }
  
  const validation = validateElementPosition(element, TEST_FLOOR_WIDTH, TEST_FLOOR_DEPTH)
  const position3D = calcOffsetPosition(element, TEST_FLOOR_WIDTH, TEST_FLOOR_DEPTH, TEST_FLOOR_HEIGHT, 0)
  
  console.log(`  ${test.name}:`)
  console.log(`    Input: x=${test.x}cm, width=${test.width}cm`)
  console.log(`    Valid: ${validation.isValid ? '✅' : '❌'} (corrected x=${validation.correctedX}cm, max=${validation.maxX}cm)`)
  console.log(`    3D Position: [${position3D[0].toFixed(2)}, ${position3D[1].toFixed(2)}, ${position3D[2].toFixed(2)}]`)
  console.log('')
})

// Test cases for left wall positioning  
console.log('🔍 Testing Left Wall Positioning:')
const leftTests = [
  { name: 'Front edge (position 0)', x: 0, width: 100 },
  { name: 'Center-ish', x: 350, width: 100 }, // 350 + 100 = 450, centered in 800cm
  { name: 'Back edge (max position)', x: 700, width: 100 }, // 700 + 100 = 800
]

leftTests.forEach(test => {
  const element: WindowOrDoor = {
    width: test.width,
    height: 150,
    position: { orientation: 'left', x: test.x, y: 40 }
  }
  
  const validation = validateElementPosition(element, TEST_FLOOR_WIDTH, TEST_FLOOR_DEPTH)
  const position3D = calcOffsetPosition(element, TEST_FLOOR_WIDTH, TEST_FLOOR_DEPTH, TEST_FLOOR_HEIGHT, 0)
  
  console.log(`  ${test.name}:`)
  console.log(`    Input: x=${test.x}cm, width=${test.width}cm`)
  console.log(`    Valid: ${validation.isValid ? '✅' : '❌'} (max=${validation.maxX}cm)`)
  console.log(`    3D Position: [${position3D[0].toFixed(2)}, ${position3D[1].toFixed(2)}, ${position3D[2].toFixed(2)}]`)
  console.log('')
})

console.log('📝 Expected Behavior:')
console.log('  - Position x=0 should place element at leftmost/frontmost edge')
console.log('  - Elements should never extend outside floor bounds')
console.log('  - Three.js coordinates should be consistent across orientations')
console.log('  - Center positioning for Three.js: floor center at (0,0,0)')