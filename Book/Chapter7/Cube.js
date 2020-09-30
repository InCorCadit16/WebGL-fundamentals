// LookAtTriangles.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `
  attribute vec4 a_Position;
  attribute vec4 a_Color;

  uniform mat4 u_Mvp;
  uniform mat4 u_Rotate;

  varying vec4 v_Color;

  void main() {
    gl_Position = u_Mvp * u_Rotate * a_Position;
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

  setInterval(() => { render(gl) }, 20);
  
}

var ANGLE = 1;

function initVertexBuffers(gl) {
  var verticesColors = new Float32Array([
    // Vertex coordinates and color
    0.5,  0.5,  0.5,     0.5,  0.5,  0.5,  // v0 White
    -0.5,  0.5,  0.5,     0.5,  0.0,  0.5,  // v1 Magenta
    -0.5, -0.5,  0.5,     0.5,  0.0,  0.0,  // v2 Red
     0.5, -0.5,  0.5,     0.5,  0.5,  0.0,  // v3 Yellow
     0.5, -0.5, -0.5,     0.0,  0.5,  0.0,  // v4 Green
     0.5,  0.5, -0.5,     0.0,  0.5,  0.5,  // v5 Cyan
    -0.5,  0.5, -0.5,     0.0,  0.0,  0.5,  // v6 Blue
    -0.5, -0.5, -0.5,     0.0,  0.0,  0.0   // v7 Black
  ]);

  indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    0, 3, 4,   0, 4, 5,    // right
    0, 5, 6,   0, 6, 1,    // up
    1, 6, 7,   1, 7, 2,    // left
    7, 4, 3,   7, 3, 2,    // down
    4, 7, 6,   4, 6, 5     // back
  ]);



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


function render(gl) {
  var n = initVertexBuffers(gl);

  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  var u_Mvp = gl.getUniformLocation(gl.program, 'u_Mvp');

  var viewMatrix = new Matrix4();
  viewMatrix
    .setPerspective(20, 1, 1, 100)
    .lookAt(5, 1, 3, 0, 0, 0, 0, 1, 0);
            
            

  gl.uniformMatrix4fv(u_Mvp, false, viewMatrix.elements);

  var rotateMatrix = new Matrix4();
  rotateMatrix.setRotate(ANGLE++, 0, 0, 1);

  var u_Rotate = gl.getUniformLocation(gl.program, 'u_Rotate');

  gl.uniformMatrix4fv(u_Rotate, false, rotateMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}