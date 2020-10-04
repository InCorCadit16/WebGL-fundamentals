// Vertex shader program
var VSHADER_SOURCE =
    `
    attribute vec4 a_Position;
    attribute vec4 a_Color;

    uniform mat4 u_Mvp;
    uniform mat4 u_Transform;
    uniform mat4 u_Rotate;

    varying vec4 v_Color;

    void main() {
        gl_Position = u_Mvp * u_Transform * u_Rotate * a_Position;
        v_Color = a_Color;
    }`;

// Fragment shader program
var FSHADER_SOURCE =
    `
  precision mediump float;
  varying vec4 v_Color;

  void main() {
    gl_FragColor = v_Color;
  }`;


figures = []
cameraValues = {
    perspectiveFov: 45,
    perspectiveAspect: 1,
    perspectiveNear: 1,
    perspectiveFar: 15,
    cameraX: 0,
    cameraY: 3,
    cameraZ: 6.5
}

function main() {
    var canvas = document.getElementById('webgl');

    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    addFigure('conus')
    addFigure('cylinder')
    addFigure('cube')

    setInterval(() => { render(gl) }, 30);
}

function render(gl) {
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    // View
    var viewMatrix = new Matrix4();
    viewMatrix
        .setPerspective(cameraValues.perspectiveFov, cameraValues.perspectiveAspect, cameraValues.perspectiveNear, cameraValues.perspectiveFar)
        .lookAt(cameraValues.cameraX, cameraValues.cameraY, cameraValues.cameraZ, 0, 0, 0, 0, 1, 0);

    var u_Mvp = gl.getUniformLocation(gl.program, 'u_Mvp');
    gl.uniformMatrix4fv(u_Mvp, false, viewMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    for (let figure of figures) {
        var n = initVertexBuffers(gl, figure);

        var transformMatrix = new Matrix4();
        transformMatrix 
            .setTranslate(figure.moveX, figure.moveY, figure.moveZ)
            .scale(figure.scale, figure.scale, figure.scale);

        var u_Transform = gl.getUniformLocation(gl.program, 'u_Transform');
        gl.uniformMatrix4fv(u_Transform, false, transformMatrix.elements);

        var rotateMatrix = new Matrix4();
        rotateMatrix.setRotate(figure.rotate ? figure.angle += 3 : figure.angle, figure.rotateX, figure.rotateY, figure.rotateZ);

        var u_Rotate= gl.getUniformLocation(gl.program, 'u_Rotate');
        gl.uniformMatrix4fv(u_Rotate, false, rotateMatrix.elements);

        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    }

}

function initVertexBuffers(gl, figure) {
    var verticesColors = figure.verticesColors
    var indices = figure.indices;

    var vertexColorBuffer = gl.createBuffer();
    var indicesBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return indices.length;
}

function addFigure(figureName) {
    if (figures.length === 3) {
        alert('You can\'t add more than 3 objects');
        return;
    }

    switch (figureName) {
        case 'cube': figures.push(createCube()); break;
        case 'pyramid': figures.push(createPyramid()); break;
        case 'cylinder': figures.push(createCylinder()); break;
        case 'conus': figures.push(createConus()); break;
    }

    let moveBy = 0;
    if (figures.length === 1) 
        moveBy = -2

    if (figures.length === 3)
        moveBy = 2

    if (moveBy === 0) return;

    let lastFigure = figures[figures.length - 1]
    for (let i = 0; i < lastFigure.verticesColors.length; i += 6) {
        lastFigure.verticesColors[i] += moveBy;
    }
}

function removeFigure() {
    figures.pop();
}

function rotate(axis) {
    var index = document.getElementById('objectIndex').value;
    if (index >= figures.length) {
        alert('Object on this position is not created yet')
        return;
    }

    switch (axis) {
        case 'x': figures[index].enableRotation(0, 1, 0); break;
        case 'y': figures[index].enableRotation(0, 0, 1); break;
        case 'z': figures[index].enableRotation(1, 0, 0); break;
    }
    
}

function stopRotation() {
    var index = document.getElementById('objectIndex').value;
    if (index >= figures.length) {
        alert('Object on this position is not created yet')
        return;
    }

    figures[index].disableRotation();
}


function moveX() {
    var index = document.getElementById('objectIndex').value;
    if (index >= figures.length) {
        alert('Object on this position is not created yet')
        return;
    }

    var moveX = document.getElementById('moveX').value;
    figures[index].moveX = moveX;
}

function moveY() {
    var index = document.getElementById('objectIndex').value;
    if (index >= figures.length) {
        alert('Object on this position is not created yet')
        return;
    }

    var moveY = document.getElementById('moveY').value;
    figures[index].moveY = moveY;
}

function moveZ() {
    var index = document.getElementById('objectIndex').value;
    if (index >= figures.length) {
        alert('Object on this position is not created yet')
        return;
    }

    var moveZ = document.getElementById('moveZ').value;
    figures[index].moveZ = moveZ;
}

function scale() {
    var index = document.getElementById('objectIndex').value;
    if (index >= figures.length) {
        alert('Object on this position is not created yet')
        return;
    }

    figures[index].scale = document.getElementById('size').value;
}


function updateCamera(property) {
    var newValue = parseFloat(document.getElementById(property).value)
    cameraValues[property] = newValue;
}