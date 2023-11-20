import { Mesh, MeshBasicMaterial, Shape, Vector2, ExtrudeGeometry } from 'three';

export const customThreeCreateRoof = (roof, roofWidth, roofDepth) => {
    const roofShape = new Shape([new Vector2(0, roof.height), new Vector2(-(roofDepth/2), 0), new Vector2((roofDepth/2), 0)]);
    const extrudeSettings = {
        depth: roofWidth,
    };
    
    const geometry = new ExtrudeGeometry(roofShape, extrudeSettings);
    const material = new MeshBasicMaterial( { color: 0x00ff00 } );
    const roofLayout = new Mesh( geometry, material ) ;

    return roofLayout
}