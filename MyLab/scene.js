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


figures = []

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

    figures.push(createConus());

    figures[0].enableRotation(1, 0, 0);

    setInterval(() => { render(gl) }, 30);

}

function render(gl) {
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    // View
    var viewMatrix = new Matrix4();
    viewMatrix
        .setPerspective(50, 1, 1, 100)
        .lookAt(0, 3, 5, 0, 0, 0, 0, 1, 0);

    var u_Mvp = gl.getUniformLocation(gl.program, 'u_Mvp');
    gl.uniformMatrix4fv(u_Mvp, false, viewMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    for (let figure of figures) {
        var n = initVertexBuffers(gl, figure);

        // Rotate
        var rotateMatrix = new Matrix4();
        rotateMatrix.setRotate(figure.rotate ? figure.angle += 4 : 0, figure.rotateX, figure.rotateY, figure.rotateZ);

        var u_Rotate = gl.getUniformLocation(gl.program, 'u_Rotate');
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