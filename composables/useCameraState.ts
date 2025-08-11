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
    if (cameraState.value.isInitialized) {
      cameraState.value.position = { x: position.x, y: position.y, z: position.z }
    }
  }

  const updateCameraTarget = (target: Vector3) => {
    if (cameraState.value.isInitialized && target && target.x !== undefined) {
      cameraState.value.target = { x: target.x, y: target.y, z: target.z }
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

  const initializeCameraState = (defaultPosition: Vector3, defaultTarget: Vector3, defaultZoom: number = 1) => {
    if (!cameraState.value.isInitialized) {
      setCameraState(defaultPosition, defaultTarget, defaultZoom)
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