import { Mesh, MeshBasicMaterial, Shape, Vector2, ExtrudeGeometry } from 'three'
import type { Roof } from '~/types/project'

export const customThreeCreateRoof = (roof: Roof, color: string = '#8B4513'): Mesh => {
    // Convert dimensions from cm to meters
    const heightM = roof.height / 100
    const depthM = roof.depth / 100
    const widthM = roof.width / 100
    
    const roofShape = new Shape([
        new Vector2(0, heightM), 
        new Vector2(-(depthM/2), 0), 
        new Vector2((depthM/2), 0)
    ])
    
    const extrudeSettings = {
        depth: widthM,
        bevelEnabled: false
    }
    
    const geometry = new ExtrudeGeometry(roofShape, extrudeSettings)
    const material = new MeshBasicMaterial({ color: color })
    const roofLayout = new Mesh(geometry, material)

    return roofLayout
}