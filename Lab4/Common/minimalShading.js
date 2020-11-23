"use strict";
var canvas;
var gl;

var numTimesToSubdivide = 3;
// global arrays with vertex data
var pointsArray = [];
var normalsArray = [];

// position of light, just a simple coordinate!!!
var lightPosition = vec4(5.0, 0.0, -2.0, 1.0 );
var lightPositionLoc;

window.onload = function init() {
	// usual webgl setup routines
	canvas = document.getElementById( "gl-canvas" );
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	gl.enable(gl.DEPTH_TEST);

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	// this function fills pointsArray with the coordinate points for this particular shape 
	// and fills normalsArray with calculated vertex normals using calculateNormal() function
	// you will need it as well!! to calculate your own normals for your shapes	
	tetrahedron(numTimesToSubdivide);

	sendArrayToShader(program, pointsArray, "vPosition");
	sendArrayToShader(program, normalsArray, "vNormal");	

	// store the location of the lightPosition variable in the shader!! To be able to dynamically update it later in render()
	lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
	render();
}

function render() {
	// just simply moving the light!
	// lightPosition[0] -= 0.02;

	// or changing position of light like this (polar coordinates)
	var speed = 0.001;
	lightPosition[0] = 2* Math.sin( (new Date).getTime() * speed ); 
	lightPosition[1] = Math.cos( (new Date).getTime() * speed ); 

	// send the updated light position to the shader (every frame!!!)
	gl.uniform4fv( lightPositionLoc, flatten(lightPosition) );

	gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length );

	window.requestAnimFrame(render);
}

function calculateNormal(a, b, c){
	// 3 main lines of NORMALS CALCULATION FOR 1 TRIANGLE WITH VERTICES a, b, c!
	var t1 = subtract(b, a);
	var t2 = subtract(c, a);
	var normal = normalize(cross(t2, t1));

	// converting vec3 to vec4, not needed if you send only vec3 to shaders, needed otherwise
	normal = vec4(normal);
	return normal;
}

function triangle(a, b, c) {
	var normal = calculateNormal(a, b, c); 
	
	// the same normal for all 3 vertices of the tirangle!!!!!
	// this is FLAT LIGHTING! Using triangles normals, not vertex normals
	normalsArray.push(normal);
	normalsArray.push(normal);
	normalsArray.push(normal);

	pointsArray.push(a);
	pointsArray.push(b);
	pointsArray.push(c);
}


// ===========================================
// ===========================================
// ROUTINE HELPERS FUNCTION
// NOT RELATED TO LIGHTING AT ALL!
// THE USUAL BUFFERS / SHAPE GENERATION STUFF!

function sendArrayToShader(program, inputArray, shaderAttributeName){
	var buffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, buffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(inputArray), gl.STATIC_DRAW );

	var attributeLocation = gl.getAttribLocation( program, shaderAttributeName );
	gl.vertexAttribPointer( attributeLocation, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( attributeLocation);
}


function divideTriangle(a, b, c, count) {
	if ( count > 0 ) {

		var ab = mix( a, b, 0.5);
		var ac = mix( a, c, 0.5);
		var bc = mix( b, c, 0.5);

		ab = normalize(ab, true);
		ac = normalize(ac, true);
		bc = normalize(bc, true);

		divideTriangle( a, ab, ac, count - 1 );
		divideTriangle( ab, b, bc, count - 1 );
		divideTriangle( bc, c, ac, count - 1 );
		divideTriangle( ab, bc, ac, count - 1 );
	}
	else {
		triangle( a, b, c );
	}
}


function tetrahedron(n) {	
	var a = vec4(0.0, 0.0, -1.0,1);
	var b = vec4(0.0, 0.94, 0.33, 1);
	var c = vec4(-0.81, -0.47, 0.33, 1);
	var d = vec4(0.87, -0.4, 0.33,1);
	divideTriangle(a, b, c, n);
	divideTriangle(d, c, b, n);
	divideTriangle(a, d, b, n);
	divideTriangle(a, c, d, n);
}
