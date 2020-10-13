
class Figure {
    constructor(verticesColors, indices) {
        this.verticesColors = verticesColors;
        this.indices = indices;

        this.angle = 0;
        this.rotateX = 1;
        this.rotateY = 0;
        this.rotateZ = 0;
        this.rotate = false;
        this.defaultTranslate = new Matrix4().setTranslate(0, 0, 0).elements;

        this.scale = 1.0;

        this.moveX = 0;
        this.moveY = 0;
        this.moveZ = 0;
    }

    enableRotation(rotateX, rotateY, rotateZ) {
        this.rotate = true;
        this.rotateX = rotateX;
        this.rotateY = rotateY;
        this.rotateZ = rotateZ;
    }

    disableRotation() {
        this.rotate = false;
        this.angle = 0;
    }
}

function createCube() {
    return new Figure(
        new Float32Array([
            0.5, 0.5, 0.5, 1, 0, 0,  // v0 White
            -0.5, 0.5, 0.5, 1, 0, 0,  // v1 Magenta
            -0.5, -0.5, 0.5, 1, 0, 0,  // v2 Red
            0.5, -0.5, 0.5,  1, 0, 0,  // v3 Yellow
            0.5, -0.5, -0.5,  1, 1.0, 1, // v4 Green
            0.5, 0.5, -0.5, 1, 1.0, 1,  // v5 Cyan
            -0.5, 0.5, -0.5,  1, 1.0, 1,  // v6 Blue
            -0.5, -0.5, -0.5,  1, 1.0, 1,  // v7 Black
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

function createPyramid() {
    return new Figure(
        new Float32Array([
            0.0, 0.5, 0.0, 1, 1, 1,  // v0 White
            -0.5, -0.5, 0.5, 1, 0.0, 1,  // v1 Magenta
            0.5, -0.5, 0.5, 1, 0.0, 0.0,  // v2 Red
            0.5, -0.5, -0.5, 1, 1, 0.0,  // v3 Yellow
            -0.5, -0.5, -0.5, 0.0, 1, 0.0,  // v4 Green
        ]),
        new Uint8Array([
            0, 1, 2,  // front
            0, 2, 3,  // right
            0, 1, 4,  // left
            0, 3, 4,  // back
            1, 2, 4, 2, 3, 4  // down
        ])
    );
}

function createCylinder() {
    var verticesColors = [];
    var indices = []
    const sectors = 2 * Math.PI / 100;
    var angle;

    for (let i = 0; i < 100; i += 2) {
        angle = i * sectors;
        verticesColors.push(Math.cos(angle) / 2);
        verticesColors.push(0.5);
        verticesColors.push(Math.sin(angle) / 2);
        verticesColors.push(1, 0, 1);
        
            
        verticesColors.push(Math.cos(angle) / 2);
        verticesColors.push(-0.5);
        verticesColors.push(Math.sin(angle) / 2);
        verticesColors.push(1, 1, 0);
        

        if (i % 2 === 0 && i <= 96)
            indices.push(i , i + 1, i + 2, i + 1, i + 3, i + 2);
            indices.push(100, i, i + 2);
            indices.push(101, i + 1 , i + 3);
    }

    verticesColors.push(0, 0.5, 0, 1, 0, 1);
    verticesColors.push(0, -0.5, 0, 1, 1, 0);

    indices.push(98, 99, 0, 99, 1, 0)
    indices.push(100, 98, 0)
    indices.push(101, 99, 1);

    return new Figure(
        new Float32Array(verticesColors),
        new Uint8Array(indices)
    );
}

function createConus() {
    var verticesColors = [];
    var indices = []
    const sectors = 2 * Math.PI / 100;
    var angle;


    verticesColors.push(0, 0.5, 0, 1, 0, 1);

    for (let i = 0; i < 100; i++) {
        angle = i * sectors;
            
        verticesColors.push(Math.cos(angle) / 2);
        verticesColors.push(-0.5);
        verticesColors.push(Math.sin(angle) / 2);
        verticesColors.push(1, 1, 0);
        

        if (i <= 98)
            indices.push(0, i, i + 1);
            indices.push(4, i, i + 1);
    }

    verticesColors.push(0, -0.5, 0, 1, 1, 0);
    indices.push(98, 99, 0, 99, 1, 0)

    return new Figure(
        new Float32Array(verticesColors),
        new Uint8Array(indices)
    );
}