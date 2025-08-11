import { Mesh, MeshBasicMaterial, Shape, Vector2, ExtrudeGeometry } from 'three'
import type { Roof } from '~/types/project'

export const customThreeCreateRoof = (roof: Roof): Mesh => {
    const roofShape = new Shape([
        new Vector2(0, roof.height), 
        new Vector2(-(roof.depth/2), 0), 
        new Vector2((roof.depth/2), 0)
    ])
    
    const extrudeSettings = {
        depth: roof.width,
    }
    
    const geometry = new ExtrudeGeometry(roofShape, extrudeSettings)
    const material = new MeshBasicMaterial({ color: 0x963411 })
    const roofLayout = new Mesh(geometry, material)

    return roofLayout
}