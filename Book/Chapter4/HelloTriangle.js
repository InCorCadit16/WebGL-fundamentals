var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_xrotateMatrix;\n' +
  'void main() {\n' +
  ' gl_Position = (u_xrotateMatrix * a_Position); \n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';

  
var ANGLE = 1;
var Tx = 0.0, Ty = 0.0, Tz = 0.0;
var scale = 0;



function main() {
      // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  setInterval(() => { render(gl) }, 20);
}


function initVertexBuffer(gl) {
  var vertices = new Float32Array([
    0, 0.6,
    -0.5, -0.4,
    0.5, -0.4
  ]);
  var n = 3;

  let vertexBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0 , 0);
  gl.enableVertexAttribArray(a_Position);

  return n;
}


function render(gl) {
  var n = initVertexBuffer(gl);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);

  ANGLE += 1;
  var radian = Math.PI * ANGLE / 180.0;
  var cosB = Math.cos(radian);
  var sinB = Math.sin(radian);

  var xrotateMatrix = new Float32Array([
    cosB, sinB, 0.0, 0.0,
  -sinB, cosB, 0.0, 0.0, 
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0      
  ]);

  // var xtranslateMatrix = new Float32Array([
  //   1.0, 0.0, 0.0, 0.0,
  //   0.0, 1.0, 0.0, 0.0, 
  //   0.0, 0.0, 1.0, 0.0,
  //   Tx, Ty, Tz, 1.0      
  // ])

  // var xscaleMatrix = new Float32Array([
  //   scale, 0.0, 0.0, 0.0,
  //   0.0, scale, 0.0, 0.0, 
  //   0.0, 0.0, 1.0, 0.0,
  //   0.0, 0.0, 0.0, 1.0      
  // ])

  var u_xrotateMatrix = gl.getUniformLocation(gl.program, 'u_xrotateMatrix');
  // var u_xscaleMatrix = gl.getUniformLocation(gl.program, 'u_xscaleMatrix');
  // var u_xtranslateMatrix = gl.getUniformLocation(gl.program, 'u_xtranslateMatrix');

  gl.uniformMatrix4fv(u_xrotateMatrix, false, xrotateMatrix);
  // gl.uniformMatrix4fv(u_xscaleMatrix, false, xscaleMatrix);
  // gl.uniformMatrix4fv(u_xtranslateMatrix, false, xtranslateMatrix);


  gl.drawArrays(gl.TRIANGLES, 0, n);
}