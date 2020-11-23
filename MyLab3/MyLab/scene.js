// Vertex shader program
var VSHADER_SOURCE =
    `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute vec4 a_Normal;

    uniform mat4 u_Mvp;
    uniform mat4 u_Transform;
    uniform mat4 u_Rotate;
    uniform mat4 u_NormalMatrix;

    // Diffuse light
    uniform vec3 u_LightDirection;
    uniform vec3 u_LightColorDiffuse;
    
    // ambient light
    uniform vec3 u_LightColorAmbient;

    // pointed light
    uniform vec3 u_LightPosition;
    uniform vec3 u_LightColorPointed;

    varying vec4 v_Color;

    void main() {
        gl_Position = u_Mvp * u_Rotate  * a_Position;

        vec4 normal = u_NormalMatrix * a_Normal;

        // pointed calculations
        vec4 vertexPosition = u_Transform * u_Rotate * a_Position;
        vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));
        float nDotL = max(dot(normalize(normal.xyz), lightDirection), 0.0);
        vec3 pointed = u_LightColorPointed * a_Color.xyz * nDotL;

        // diffuse calculations
        nDotL = max(dot(u_LightDirection, normalize(normal.xyz)), 0.0);
        vec3 diffuse = u_LightColorDiffuse * a_Color.xyz * nDotL;

        // ambient calculations
        vec3 ambient = u_LightColorAmbient * a_Color.xyz;
        
        v_Color = vec4(diffuse + pointed + ambient, a_Color.a);
    }`;

// Fragment shader program
var FSHADER_SOURCE =
    `
    #ifdef GL_ES
    precision mediump float;
    #endif
    varying vec4 v_Color;

    void main() {
        gl_FragColor = v_Color;
    }`;


var figures = [];
var cameraValues;
var canvas;

var ambientColor = [0.2, 0.2, 0.2];

var diffuseDirection = [-1.0, 2.0, 4.0];
var diffuseColor = [0.3, 0.3, 0.3];

var pointedPosition = [3, 3.0, 4];
var pointedColor = [1.0, 1.0, 1.0];

var no_light = [0, 0, 0]

function main() {
    canvas = document.getElementById('webgl');

    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    cameraValues = {
        perspectiveFov: 30,
        perspectiveAspect: canvas.width/canvas.height,
        perspectiveNear: 1,
        perspectiveFar: 100,
        cameraX: 5,
        cameraY: 3,
        cameraZ: 9
    };

    setInterval(() => { render(gl) }, 30);
}

function render(gl) {
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Pointed Light
    u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    gl.uniform3fv(u_LightPosition, new Float32Array(pointedPosition));

    u_LightColorPointed =  gl.getUniformLocation(gl.program, 'u_LightColorPointed');
    if (document.getElementById('pointed').checked) {
        gl.uniform3fv(u_LightColorPointed, new Float32Array(pointedColor));
    } else {
        gl.uniform3fv(u_LightColorPointed, new Float32Array(no_light));
    }

    // Diffuse Light
    var u_LightColorDiffuse = gl.getUniformLocation(gl.program, 'u_LightColorDiffuse');
    if (document.getElementById('diffuse').checked) {
        gl.uniform3fv(u_LightColorDiffuse, new Float32Array(diffuseColor));
    } else {
        gl.uniform3fv(u_LightColorDiffuse, new Float32Array(no_light));
    }

    var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    gl.uniform3fv(u_LightDirection, new Float32Array(diffuseDirection));

    // Ambient Light
    var u_LightColorAmbient = gl.getUniformLocation(gl.program, 'u_LightColorAmbient');
    if (document.getElementById('ambient').checked) {
        gl.uniform3fv(u_LightColorAmbient, new Float32Array(ambientColor));
    } else {
        gl.uniform3fv(u_LightColorAmbient, new Float32Array(no_light));
    }

    // View
    var vpMatrix = new Matrix4();
    vpMatrix.setPerspective(cameraValues.perspectiveFov, cameraValues.perspectiveAspect, cameraValues.perspectiveNear, cameraValues.perspectiveFar)
    vpMatrix.lookAt(cameraValues.cameraX, cameraValues.cameraY, cameraValues.cameraZ, 0, 0, 0, 0, 1, 0);

    for (let figure of figures) {
        var n = initVertexBuffers(gl, figure);

        // Transform
        var transformMatrix = new Matrix4();
        transformMatrix 
            .setTranslate(figure.moveX + figure.defaultTranslate[0],
                            figure.moveY  + figure.defaultTranslate[1],
                            figure.moveZ + figure.defaultTranslate[2])
            .scale(figure.scale, figure.scale, figure.scale)
            
            
        var u_Transform = gl.getUniformLocation(gl.program, 'u_Transform');
        gl.uniformMatrix4fv(u_Transform, false, transformMatrix.elements);
        
        // mvp 
        var u_Mvp = gl.getUniformLocation(gl.program, 'u_Mvp');
        var mvpMatrix = new Matrix4();
        mvpMatrix.set(vpMatrix).multiply(transformMatrix);
        gl.uniformMatrix4fv(u_Mvp, false, mvpMatrix.elements);

        // Rotate
        var u_Rotate = gl.getUniformLocation(gl.program, 'u_Rotate');
        var rotateMatrix = new Matrix4();
        rotateMatrix.setRotate(figure.rotate ? figure.angle += 2 : figure.angle, figure.rotateX, figure.rotateY, figure.rotateZ)
        gl.uniformMatrix4fv(u_Rotate, false, rotateMatrix.elements);

        // Normal
        var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
        var normalMatrix = new Matrix4();
        transformMatrix.multiply(rotateMatrix);
        normalMatrix.setInverseOf(transformMatrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        
        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    }

}

function initVertexBuffers(gl, figure) {
    var normals = new Float32Array([
        0.0, 0.0, 0.5,   0.0, 0.0, 0.5,   0.0, 0.0, 0.5,   0.0, 0.0, 0.5,  // v0-v1-v2-v3 front
        0.5, 0.0, 0.0,   0.5, 0.0, 0.0,   0.5, 0.0, 0.0,   0.5, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 0.5, 0.0,   0.0, 0.5, 0.0,   0.0, 0.5, 0.0,   0.0, 0.5, 0.0,  // v0-v5-v6-v1 up
       -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0,-0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0,-0.5,   0.0, 0.0,-0.5,   0.0, 0.0,-0.5,   0.0, 0.0,-0.5   // v4-v7-v6-v5 back
    ]);

    if (!initArrayBuffer(gl, 'a_Position', figure.vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Color', figure.colors, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;
    
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
        case 'sphere': figures.push(createSphere()); break;
    }

    if (figures.length === 1) 
        figures[figures.length - 1].defaultTranslate = [-2, 0, 0];

    if (figures.length === 3)
        figures[figures.length - 1].defaultTranslate = [2, 0, 0];
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
    // if (a_attribute < 0) {
    //   console.log('Failed to get the storage location of ' + attribute);
    //   return false;
    // }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
    return true;
  }