// Vertex shader program
var VSHADER_SOURCE =
    `
    attribute vec4 a_Position;
    attribute vec4 a_Color;

    uniform mat4 u_Mvp;
    uniform mat4 u_Transform;
    uniform mat4 u_Rotate;
    uniform mat4 u_DefaultTranslate;

    // attribute vec4 a_Normal;
    // attribute vec3 u_LightColor;
    // attribute vec3 u_LightDirection;

    varying vec4 v_Color;

    void main() {
        gl_Position = u_Mvp * u_DefaultTranslate * u_Transform * u_Rotate * a_Position;

        // vec3 normal = normalize(vec3(a_Normal));
        // float nDotL = max(dot(u_LightDirection, normal), 0.0);
        // vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;
        // v_Color = vec4(diffuse, a_Color.a);
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

    setInterval(() => { render(gl) }, 30);
}

var dir = [0.5, 2.0, 2.0]

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

    // var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    // gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    

    // var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    // var lightDirection = new Vector3(dir)
    // lightDirection.normalize();
    // gl.uniform3fv(u_LightDirection, lightDirection.elements);

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


        var u_DefaultTranslate = gl.getUniformLocation(gl.program, 'u_DefaultTranslate');
        gl.uniformMatrix4fv(u_DefaultTranslate, false, figure.defaultTranslate);

        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    }

}

function initVertexBuffers(gl, figure) {
    // var normals = new Float32Array([
    //     0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    //     1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    //     0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
    //    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    //     0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    //     0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    // ]);

    //if(!initArrayBuffer(gl,'a_Normal', normals, 3, gl.FLOAT)) return -1;
    if(!initArrayBuffer(gl,'a_Position', figure.vertices, 3, gl.FLOAT)) return -1;
    if(!initArrayBuffer(gl,'a_Color', figure.colors, 3, gl.FLOAT)) return -1;

    var indicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, figure.indices, gl.STATIC_DRAW);

    return figure.indices.length;
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
        case 'spehere': figures.push(createSphere()); break;
    }

    if (figures.length === 1) 
        figures[figures.length - 1].defaultTranslate = new Matrix4().setTranslate(-2, 0, 0).elements;

    if (figures.length === 3)
        figures[figures.length - 1].defaultTranslate = new Matrix4().setTranslate(2, 0, 0).elements;
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


function initArrayBuffer (gl, attribute, data, num, type) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
    return true;
  }