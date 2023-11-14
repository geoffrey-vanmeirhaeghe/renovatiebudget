export const calcOffsetPosition = (shape, floorWidth, floorDepth, floorHeight, Storey) => {
    let x
    let y
    let z

    switch (shape.position.orientation) {
    case "front":
        x = - (shape.position.x - (floorWidth / 2))
        y = shape.position.y + (shape.height / 2) + (floorHeight * Storey)
        z = floorDepth / 2

        return [z, y, x]

    case "back":
        x = (shape.position.x - (floorWidth / 2))
        y = shape.position.y + (shape.height / 2) + (floorHeight * Storey)
        z = - floorDepth / 2

        return [z, y, x]

    case "left":
        x = (floorWidth / 2)
        y = shape.position.y + (shape.height / 2) + (floorHeight * Storey)
        z = (shape.position.x - (floorWidth / 2))

        return [z, y, x]

    case "right":
        x = - (floorWidth / 2)
        y = shape.position.y + (shape.height / 2) + (floorHeight * Storey)
        z = - (shape.position.x - (floorWidth / 2))

        return [z, y, x]
    }
};

export const calcOffsetSize = (shape) => {
    let depth
    let width
    let height

    switch (shape.position.orientation) {
    case "front":
        depth = 0.5
        height = shape.height
        width = shape.width

        return [depth, height, width]

    case "back":
        depth = 0.5
        height = shape.height
        width = shape.width

        return [depth, height, width]

    case "left":
        depth = shape.width
        height = shape.height
        width = 0.5

        return [depth, height, width]

    case "right":
        depth = shape.width
        height = shape.height
        width = 0.5

        return [depth, height, width]
    }
};