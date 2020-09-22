"use strict";

var VSHADER_SOURCE= 
    `
    attribute vec4 a_Position;
    attribute float a_PointSize;
    
    void main() {
        gl_Position = a_Position;
        gl_PointSize = a_PointSize;
    }`;

var FSHADER_SOURCE =
    `
    precision mediump float;
    uniform vec4 u_FragColor;
    
    void main() {
        gl_FragColor = u_FragColor;
    }`;

function main() {
    var canvas = document.getElementById("webgl")

    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get webgl context');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

    gl.clearColor(0.0, 0.0, 0.0, 1);

    canvas.onmousedown = function(ev) { click(ev, gl, canvas, a_Position, u_FragColor) }

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, 1);
}

const g_points = []
const g_colors = []

function click(event, gl, canvas, a_Position, u_FragColor) {
    let x = event.clientX;
    let y = event.clientY;
    let rect = event.target.getBoundingClientRect();

    x = ((x - rect.left) -  canvas.height / 2) / (canvas.height / 2);
    y = (canvas.width/2 - (y - rect.top)) / (canvas.width/2);

    g_points.push([x,y]);

    if (y > 0.33) 
        g_colors.push([0.0, 0.0, 1.0, 1.0]);
    else if (y > -0.33) 
        g_colors.push([1.0, 1.0, 1.0, 1.0]);
    else
        g_colors.push([1.0, 0.0, 0.0, 1.0]);

    gl.clear(gl.COLOR_BUFFER_BIT);

    var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    for(let i = 0; i < g_points.length; i++) {
        gl.vertexAttrib3f(a_Position, g_points[i][0], g_points[i][1], 0.0);
        
        gl.uniform4f(u_FragColor, g_colors[i][0], g_colors[i][1], g_colors[i][2], g_colors[i][3]);
       
        gl.vertexAttrib1f(a_PointSize, 100.0);

        gl.drawArrays(gl.POINTS, 0, 1);
    }
}