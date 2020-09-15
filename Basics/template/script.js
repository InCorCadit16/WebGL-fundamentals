"use strict"; 

var canvas;
var gl;

var vertices = [];
var colors = [];
window.onload = init;

function init() {    
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );

    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Here should be filling in of data arrays
    

    // the size of the viewport
    gl.viewport( 0, 0, canvas.width, canvas.height );
    // the color of background!
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" ); // initializing shaders
    gl.useProgram( program );

    // Here should be sending of values from JS to GLSL

    render();
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT ); 
    gl.drawArrays( gl.TRIANGLES, 0, vertices.length );  
    requestAnimFrame(render); // updating the image, will be used for dynamic display
}
