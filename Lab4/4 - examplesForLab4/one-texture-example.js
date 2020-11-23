"use strict"; 

var canvas;
var gl;

var vertices = [];
var textureCoords = [];
window.onload = init; // CALL INIT AFTER THE PAGE (all html body) HAS BEEN LOADED!!!!

var vBuffer;

var textureDataLocation;

function init() {	
		canvas = document.getElementById( "gl-canvas" ); // getting the canvas element

		gl = WebGLUtils.setupWebGL( canvas ); // setting up webgl with the canvas
		if ( !gl ) { alert( "WebGL isn't available" ); }

		// initialization of the data arrays!!!!
		vertices = [
				vec3( -0.5, -0.5,  0.0 ), // every vec3 stores 3 coordinates for one point
				vec3(  0.5, -0.5,  0.0 ),
				vec3(  0.0,  0.5,  0.0 ),
		];
		// THE UV COORDINATES!!! for each vertex
		// 0.0 is the start of texture, 1.0 is the end of texture
		textureCoords = [
				vec2(  0.0,  1.0 ),
				vec2(  1.0,  1.0 ),
				vec2(  0.5,  0.0 ),
		];
		

		// the size of the viewport
		gl.viewport( 0, 0, canvas.width, canvas.height );
		// the color of background!
		gl.clearColor( 0.2, 0.2, 0.2, 1.0 );

		var program = initShaders( gl, "vertex-shader", "fragment-shader" ); // initializing shaders
		gl.useProgram( program );

		/// SENDING THE DATA TO OUR SHADER!!!!!!!!
		vBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW ); 
		var vAttributeLocation = gl.getAttribLocation( program, 'vPosition' );
		gl.vertexAttribPointer( vAttributeLocation, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vAttributeLocation);

		var tcBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, tcBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(textureCoords), gl.STATIC_DRAW );
		var tcAttributeLocation = gl.getAttribLocation( program, 'vTextureCoord' );
		gl.vertexAttribPointer( tcAttributeLocation, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( tcAttributeLocation);

		textureDataLocation = gl.getUniformLocation(program, 'textureData');
	
		// texture id, shows what texture to use, in this case we have only one texture
		gl.uniform1i(textureDataLocation, 0);

		setLoadTextureListener();

		render();
};

function setLoadTextureListener(){	
	document.querySelector('#file-loader').addEventListener('change', function() {						
		var selectedFiles = this.files;		
		if(selectedFiles.length == 0) {
			alert('Error : No file selected');
			return;
		}
		var firstFile = selectedFiles[0];
		readImageFromFile(firstFile);
	});	
}

function readImageFromFile(file) {
	var reader = new FileReader();
	reader.addEventListener('load', function(e) {
		var imgRawData = e.target.result;
		var texture = loadTexture(gl, imgRawData);
	});

	reader.addEventListener('error', function() {
		alert('File error happened!');
	});

	reader.readAsDataURL(file);	// read image as raw data
}

function loadTexture(gl, dataRaw) {
	// setting the active texture, gl.TEXTURE0 is the segment location where the textures start
	// use gl.TEXTURE1, gl.TEXTURE1... or gl.TEXTURE0+1, gl.TEXTURE0+2... for offseting to other textures
	gl.activeTexture(gl.TEXTURE0);
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	// various texture parameters
	const internalFormat = gl.RGBA;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;

	const image = new Image();
	image.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, srcFormat, srcType, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	};
	image.src = dataRaw;

	return texture;
}

function render() {

		// using some trigonometry to move the points, just to show how we can update the buffers and animate the image	
		var speed = 0.005;
		var time = (new Date).getTime();
		var amplitude = 0.1;
		vertices[0][0] = -0.5 + amplitude * Math.sin( time * speed );
		vertices[0][1] = -0.5 + amplitude * Math.cos( time * speed );
	
		vertices[1][0] =  0.5 + amplitude * Math.cos( time * speed/2 );
		vertices[1][1] = -0.5 + amplitude * Math.sin( time * speed/2 );
	
		vertices[2][0] = 0.0 + amplitude * Math.sin( time * speed );
		vertices[2][1] = 0.5 + amplitude * Math.cos( time * speed/2 );

		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

		gl.clear( gl.COLOR_BUFFER_BIT ); 

		gl.drawArrays( gl.TRIANGLES, 0, vertices.length );  // THE ACTUAL DRAW!!!!!!!

		requestAnimFrame(render); // updating the image, will be used for dynamic display
}