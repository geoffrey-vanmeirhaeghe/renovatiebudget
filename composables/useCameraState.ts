import type { Vector3 } from 'three'
import { Vector3 as ThreeVector3 } from 'three'

export interface CameraState {
  position: { x: number; y: number; z: number }
  target: { x: number; y: number; z: number }
  zoom: number
  isInitialized: boolean
}

// Global state for camera - persists across component re-renders
const cameraState = ref<CameraState>({
  position: { x: 0, y: 1, z: 0 },
  target: { x: 0, y: 0, z: 0 },
  zoom: 1,
  isInitialized: false
})

export const useCameraState = () => {
  const setCameraState = (position: Vector3, target: Vector3, zoom: number = 1) => {
    cameraState.value = {
      position: { x: position.x, y: position.y, z: position.z },
      target: { x: target.x, y: target.y, z: target.z },
      zoom,
      isInitialized: true
    }
  }

  const updateCameraPosition = (position: Vector3) => {
    if (cameraState.value.isInitialized && position && position.x !== undefined) {
      // Only update if position has actually changed to prevent unnecessary updates
      const currentPos = cameraState.value.position
      const threshold = 0.001
      if (Math.abs(currentPos.x - position.x) > threshold || 
          Math.abs(currentPos.y - position.y) > threshold || 
          Math.abs(currentPos.z - position.z) > threshold) {
        cameraState.value.position = { x: position.x, y: position.y, z: position.z }
        console.log('Camera position updated:', cameraState.value.position)
      }
    }
  }

  const updateCameraTarget = (target: Vector3) => {
    if (cameraState.value.isInitialized && target && target.x !== undefined) {
      // Only update if target has actually changed to prevent unnecessary updates
      const currentTarget = cameraState.value.target
      const threshold = 0.001
      if (Math.abs(currentTarget.x - target.x) > threshold || 
          Math.abs(currentTarget.y - target.y) > threshold || 
          Math.abs(currentTarget.z - target.z) > threshold) {
        cameraState.value.target = { x: target.x, y: target.y, z: target.z }
        console.log('Camera target updated:', cameraState.value.target)
      }
    }
  }

  const updateCameraZoom = (zoom: number) => {
    if (cameraState.value.isInitialized) {
      cameraState.value.zoom = zoom
    }
  }

  const getCameraPosition = (): ThreeVector3 => {
    return new ThreeVector3(
      cameraState.value.position.x,
      cameraState.value.position.y,
      cameraState.value.position.z
    )
  }

  const getCameraTarget = (): ThreeVector3 => {
    return new ThreeVector3(
      cameraState.value.target.x,
      cameraState.value.target.y,
      cameraState.value.target.z
    )
  }

  const initializeCameraState = (defaultPosition?: Vector3, defaultTarget?: Vector3, defaultZoom: number = 1) => {
    if (!cameraState.value.isInitialized) {
      const pos = defaultPosition || new ThreeVector3(0, 1, 0)
      const target = defaultTarget || new ThreeVector3(0, 0, 0)
      setCameraState(pos, target, defaultZoom)
    }
  }

  const resetCameraState = () => {
    cameraState.value.isInitialized = false
  }

  return {
    cameraState: readonly(cameraState),
    setCameraState,
    updateCameraPosition,
    updateCameraTarget,
    updateCameraZoom,
    getCameraPosition,
    getCameraTarget,
    initializeCameraState,
    resetCameraState
  }
}