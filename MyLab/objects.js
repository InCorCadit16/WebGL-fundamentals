
class Figure {
    constructor(verticesColors, indices) {
        this.verticesColors = verticesColors;
        this.indices = indices;
        this.angle = 0;
        this.rotateX = 0;
        this.rotateY = 0;
        this.rotateZ = 0;
        this.rotate = false;
    }

    enableRotation(rotateX, rotateY, rotateZ) {
        this.rotate = true;
        this.rotateX = rotateX;
        this.rotateY = rotateY;
        this.rotateZ = rotateZ;
    }

    disableRotation() {
        this.rotate = false;
    }
}

function createCube() {
    return new Figure(
        new Float32Array([
            0.5, 0.5, 0.5, 0.5, 0.5, 0.5,  // v0 White
            -0.5, 0.5, 0.5, 0.5, 0.0, 0.5,  // v1 Magenta
            -0.5, -0.5, 0.5, 0.5, 0.0, 0.0,  // v2 Red
            0.5, -0.5, 0.5, 0.5, 0.5, 0.0,  // v3 Yellow
            0.5, -0.5, -0.5, 0.0, 0.5, 0.0,  // v4 Green
            0.5, 0.5, -0.5, 0.0, 0.5, 0.5,  // v5 Cyan
            -0.5, 0.5, -0.5, 0.0, 0.0, 0.5,  // v6 Blue
            -0.5, -0.5, -0.5, 0.0, 0.0, 0.0   // v7 Black
        ]),
        new Uint8Array([
            0, 1, 2, 0, 2, 3,    // front
            0, 3, 4, 0, 4, 5,    // right
            0, 5, 6, 0, 6, 1,    // up
            1, 6, 7, 1, 7, 2,    // left
            7, 4, 3, 7, 3, 2,    // down
            4, 7, 6, 4, 6, 5     // back
        ])
    );
}

function createPyramide() {
    return new Figure(
        new Float32Array([
            0.5, 0.5, 0.5, 0.5, 0.5, 0.5,  // v0 White
            -0.5, 0.5, 0.5, 0.5, 0.0, 0.5,  // v1 Magenta
            -0.5, -0.5, 0.5, 0.5, 0.0, 0.0,  // v2 Red
            0.5, -0.5, 0.5, 0.5, 0.5, 0.0,  // v3 Yellow
            0.5, -0.5, -0.5, 0.0, 0.5, 0.0,  // v4 Green
            0.5, 0.5, -0.5, 0.0, 0.5, 0.5,  // v5 Cyan
            -0.5, 0.5, -0.5, 0.0, 0.0, 0.5,  // v6 Blue
            -0.5, -0.5, -0.5, 0.0, 0.0, 0.0   // v7 Black
        ]),
        new Uint8Array([
            0, 1, 2, 0, 2, 3,    // front
            0, 3, 4, 0, 4, 5,    // right
            0, 5, 6, 0, 6, 1,    // up
            1, 6, 7, 1, 7, 2,    // left
            7, 4, 3, 7, 3, 2,    // down
            4, 7, 6, 4, 6, 5     // back
        ])
    );
}

function createCylinder() {
    return new Figure(
        new Float32Array([
            0.5, 0.5, 0.5, 0.5, 0.5, 0.5,  // v0 White
            -0.5, 0.5, 0.5, 0.5, 0.0, 0.5,  // v1 Magenta
            -0.5, -0.5, 0.5, 0.5, 0.0, 0.0,  // v2 Red
            0.5, -0.5, 0.5, 0.5, 0.5, 0.0,  // v3 Yellow
            0.5, -0.5, -0.5, 0.0, 0.5, 0.0,  // v4 Green
            0.5, 0.5, -0.5, 0.0, 0.5, 0.5,  // v5 Cyan
            -0.5, 0.5, -0.5, 0.0, 0.0, 0.5,  // v6 Blue
            -0.5, -0.5, -0.5, 0.0, 0.0, 0.0   // v7 Black
        ]),
        new Uint8Array([
            0, 1, 2, 0, 2, 3,    // front
            0, 3, 4, 0, 4, 5,    // right
            0, 5, 6, 0, 6, 1,    // up
            1, 6, 7, 1, 7, 2,    // left
            7, 4, 3, 7, 3, 2,    // down
            4, 7, 6, 4, 6, 5     // back
        ])
    );
}