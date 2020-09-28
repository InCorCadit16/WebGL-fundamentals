// LookAtTriangles.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  `
  attribute vec4 a_Position;
  attribute vec4 a_Color;

  uniform mat4 u_View;
  uniform mat4 u_Rotate;

  varying vec4 v_Color;

  void main() {
    gl_Position = u_View * u_Rotate * a_Position;
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
    -0.6, 0.6, -0.6,   0.5, 0.5, 0.5,
		-0.6, 0.6, 0.6,    0.5, 0.5, 0.5,
		0.6, 0.6, 0.6,     0.5, 0.5, 0.5,
		0.6, 0.6, -0.6,    0.5, 0.5, 0.5,

		// Left
		-0.6, 0.6, 0.6,    0.75, 0.25, 0.5,
		-0.6, -0.6, 0.6,   0.75, 0.25, 0.5,
		-0.6, -0.6, -0.6,  0.75, 0.25, 0.5,
		-0.6, 0.6, -0.6,   0.75, 0.25, 0.5,

		// Right
		0.6, 0.6, 0.6,    0.25, 0.25, 0.75,
		0.6, -0.6, 0.6,   0.25, 0.25, 0.75,
		0.6, -0.6, -0.6,  0.25, 0.25, 0.75,
		0.6, 0.6, -0.6,   0.25, 0.25, 0.75,

		// Front
		0.6, 0.6, 0.6,    0.6, 0.0, 0.15,
		0.6, -0.6, 0.6,    0.6, 0.0, 0.15,
		-0.6, -0.6, 0.6,    0.6, 0.0, 0.15,
		-0.6, 0.6, 0.6,    0.6, 0.0, 0.15,

		// Back
		0.6, 0.6, -0.6,    0.0, 0.6, 0.15,
		0.6, -0.6, -0.6,    0.0, 0.6, 0.15,
		-0.6, -0.6, -0.6,    0.0, 0.6, 0.15,
		-0.6, 0.6, -0.6,    0.0, 0.6, 0.15,

		// Bottom
		-0.6, -0.6, -0.6,   0.5, 0.5, 0.6,
		-0.6, -0.6, 0.6,    0.5, 0.5, 0.6,
		0.6, -0.6, 0.6,     0.5, 0.5, 0.6,
		0.6, -0.6, -0.6,    0.5, 0.5, 0.6,
  ]);
  var n = 36;

  var vertexColorbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}


function render(gl) {
  var n = initVertexBuffers(gl);

  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  var u_View = gl.getUniformLocation(gl.program, 'u_View');

  var viewMatrix = new Matrix4();
  viewMatrix.setPerspective(30, 1, 1, 100);
  viewMatrix.setLookAt(0.1, 0, 0, 0, 0, 0, 0, 1, 0);

  gl.uniformMatrix4fv(u_View, false, viewMatrix.elements);

  var rotateMatrix = new Matrix4();
  rotateMatrix.setRotate(ANGLE++, 0, 1, 0);

  var u_Rotate = gl.getUniformLocation(gl.program, 'u_Rotate');

  gl.uniformMatrix4fv(u_Rotate, false, rotateMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}