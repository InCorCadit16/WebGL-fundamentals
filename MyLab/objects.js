
class Figure {
    constructor(vertices, indices, colors) {
        this.vertices = vertices;
        this.colors = colors
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
            0.5, 0.5, 0.5,   // v0 
            -0.5, 0.5, 0.5,  // v1 
            -0.5, -0.5, 0.5, // v2
            0.5, -0.5, 0.5,    // v3
            0.5, -0.5, -0.5,   // v4
            0.5, 0.5, -0.5,   // v5
            -0.5, 0.5, -0.5,    // v6
            -0.5, -0.5, -0.5,    // v7
        ]),
        new Uint8Array([
            0, 1, 2, 0, 2, 3,    // front
            0, 3, 4, 0, 4, 5,    // right
            0, 5, 6, 0, 6, 1,    // up
            1, 6, 7, 1, 7, 2,    // left
            7, 4, 3, 7, 3, 2,    // down
            4, 7, 6, 4, 6, 5     // back
        ]),
        new Float32Array([
            1, 0, 0,
            1, 0, 0,
            1, 0, 0, 
            1, 0, 0,
            1, 1.0, 1,
            1, 1.0, 1,
            1, 1.0, 1,
            1, 1.0, 1,
        ])
    );
}

function createPyramid() {
    return new Figure(
        new Float32Array([
            0.0, 0.5, 0.0,  // v0
            -0.5, -0.5, 0.5, // v1
            0.5, -0.5, 0.5,  // v2
            0.5, -0.5, -0.5,  // v3
            -0.5, -0.5, -0.5  // v4
        ]),
        new Uint8Array([
            0, 1, 2,  // front
            0, 2, 3,  // right
            0, 1, 4,  // left
            0, 3, 4,  // back
            1, 2, 4, 2, 3, 4  // down
        ]),
        new Float32Array([
            1, 1, 1,  // v0 White
            1, 0.0, 1,  // v1 Magenta
            1, 0.0, 0.0,  // v2 Red
            1, 1, 0.0,  // v3 Yellow
            0.0, 1, 0.0,  // v4 Green
        ]),
    );
}

function createCylinder() {
    points = 36 ;
    var vertices = [];
    var colors = [];
    var indices = [];
    const sectors = 2 * Math.PI / points;
    var angle;

    for (let i = 0; i < points; i += 2) {
        angle = i * sectors;
        vertices.push(Math.cos(angle) / 2);
        vertices.push(0.5);
        vertices.push(Math.sin(angle) / 2);
        colors.push(1, 0, 1);
        
            
        vertices.push(Math.cos(angle) / 2);
        vertices.push(-0.5);
        vertices.push(Math.sin(angle) / 2);
        colors.push(1, 1, 0);
        

        if (i % 2 === 0 && i <= points - 4)
            indices.push(i , i + 1, i + 2, i + 1, i + 3, i + 2);
            indices.push(points, i, i + 2);
            indices.push(points + 1, i + 1 , i + 3);
    }

    vertices.push(0, 0.5, 0);
    colors.push(1, 0, 1);
    vertices.push(0, -0.5, 0);
    colors.push(1, 1, 0)

    indices.push(points - 2, points - 1, 0)
    indices.push(points - 1, 1, 0)
    indices.push(points, points - 2, 0)
    indices.push(points + 1, points - 1, 1);

    return new Figure(
        new Float32Array(vertices),
        new Uint8Array(indices),
        new Float32Array(colors)
    );
}

function createConus() {
    points = 22;
    var vertices = [];
    var colors = [];
    var indices = [];
    const sectors = 2 * Math.PI / points;
    var angle;

    vertices.push(0, 0.5, 0);
    colors.push(1, 0, 1)
    for (let i = 0; i < points; i++) {
        angle = i * sectors;
            
        vertices.push(Math.cos(angle) / 2);
        vertices.push(-0.5);
        vertices.push(Math.sin(angle) / 2);
        colors.push(1, 1, 0);
        

        if (i <= points - 2)
            indices.push(0, i, i + 1);
            indices.push(points, i, i + 1);
    }

    vertices.push(0, -0.5, 0);
    colors.push(1, 1, 0);
    indices.push(0, points - 1, 1);

    return new Figure(
        new Float32Array(vertices),
        new Uint8Array(indices),
        new Float32Array(colors)
    );
}

function createSphere() {
    var positions = []
    var indices = []

      // Generate coordinates
    for (j = 0; j <= SPHERE_DIV; j++) {
        aj = j * Math.PI / SPHERE_DIV;
        sj = Math.sin(aj);
        cj = Math.cos(aj);
        for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV;
            si = Math.sin(ai);
            ci = Math.cos(ai);

            positions.push(si * sj);  // X
            positions.push(cj);       // Y
            positions.push(ci * sj);  // Z
            // positions.push(1.0, 1.0, 1.0);
        }
    }

    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++) {
        for (i = 0; i < SPHERE_DIV; i++) {
            p1 = j * (SPHERE_DIV+1) + i;
            p2 = p1 + (SPHERE_DIV+1);

            indices.push(p1);
            indices.push(p2);
            indices.push(p1 + 1);

            indices.push(p1 + 1);
            indices.push(p2);
            indices.push(p2 + 1);
        }
    }

    return new Figure(
        new Float32Array(positions),
        new Uint8Array(indices)
    )
}