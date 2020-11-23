
// Vertex shader program
var VSHADER_SOURCE =
    `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute vec4 a_Normal;
    attribute vec2 vTextureCoord;

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
    varying vec2 fTextureCoord;

    void main() {
        gl_Position = u_Mvp * u_Rotate  * a_Position;

        vec4 normal = normalize(u_NormalMatrix * a_Normal);

        // pointed calculations
        vec4 vertexPosition = u_Transform * u_Rotate * a_Position;
        
        vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));
        float nDotL = max(dot(normal.xyz, lightDirection), 0.0);
        vec3 pointed = u_LightColorPointed * a_Color.xyz * nDotL;

        // diffuse calculations
        nDotL = max(dot(u_LightDirection, normal.xyz), 0.0);
        vec3 diffuse = u_LightColorDiffuse * a_Color.xyz * nDotL;

        // ambient calculations
        vec3 ambient = u_LightColorAmbient * a_Color.xyz;
        
        v_Color = vec4(diffuse + pointed + ambient, a_Color.a);
        fTextureCoord = vTextureCoord;
        
    }`;

// Fragment shader program
var FSHADER_SOURCE =
    `
    #ifdef GL_ES
    precision mediump int;
    precision mediump float;
    #endif
    varying vec4 v_Color;

    uniform sampler2D textureData; 
    varying vec2 fTextureCoord;

    void main() {
        vec4 colorFromTexture = texture2D(textureData, fTextureCoord);
        gl_FragColor = colorFromTexture * 0.5 + v_Color * 0.5;
       
    }`;

var gl;
var figures = [];
var texturedFigure;
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

    gl = getWebGLContext(canvas);
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

    setLoadTextureListener();

    setLoadObjListener();

    setInterval(() => { render(gl) }, 30);
}

function render(gl) {
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    var u_LightColorPointed =  gl.getUniformLocation(gl.program, 'u_LightColorPointed');
    var u_LightColorDiffuse = gl.getUniformLocation(gl.program, 'u_LightColorDiffuse');
    var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    var u_LightColorAmbient = gl.getUniformLocation(gl.program, 'u_LightColorAmbient');

    // Pointed Light
    gl.uniform3fv(u_LightPosition, new Float32Array(pointedPosition));
    
    if (document.getElementById('pointed').checked) {
        gl.uniform3fv(u_LightColorPointed, new Float32Array(pointedColor));
    } else {
        gl.uniform3fv(u_LightColorPointed, new Float32Array(no_light));
    }

    // Diffuse Light
    if (document.getElementById('diffuse').checked) {
        gl.uniform3fv(u_LightColorDiffuse, new Float32Array(diffuseColor));
    } else {
        gl.uniform3fv(u_LightColorDiffuse, new Float32Array(no_light));
    }

    gl.uniform3fv(u_LightDirection, new Float32Array(diffuseDirection));

    // Ambient Light
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

        var u_Transform = gl.getUniformLocation(gl.program, 'u_Transform');
        var u_Mvp = gl.getUniformLocation(gl.program, 'u_Mvp');
        var u_Rotate = gl.getUniformLocation(gl.program, 'u_Rotate');
        var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');

        // Transform
        var transformMatrix = new Matrix4();
        transformMatrix 
            .setTranslate(figure.moveX,
                            figure.moveY,
                            figure.moveZ)
            .scale(figure.scale, figure.scale, figure.scale)
            
        var defaultTranslate = new Matrix4();
        defaultTranslate 
            .setTranslate(figure.defaultTranslate[0],
                            figure.defaultTranslate[1],
                            figure.defaultTranslate[2]);

        transformMatrix.multiply(defaultTranslate);
            
        gl.uniformMatrix4fv(u_Transform, false, transformMatrix.elements);
        
        // mvp 
        var mvpMatrix = new Matrix4();
        mvpMatrix.set(vpMatrix).multiply(transformMatrix);
        gl.uniformMatrix4fv(u_Mvp, false, mvpMatrix.elements);

        // Rotate
        var rotateMatrix = new Matrix4();
        rotateMatrix.setRotate(figure.rotate ? figure.angle += 2 : figure.angle, figure.rotateX, figure.rotateY, figure.rotateZ)
        gl.uniformMatrix4fv(u_Rotate, false, rotateMatrix.elements);

        // Normal
        var normalMatrix = new Matrix4();
        transformMatrix.multiply(rotateMatrix);
        normalMatrix.setInverseOf(transformMatrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        
        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    }

    if (texturedFigure != null) {
        n = initVertexBuffers(gl, texturedFigure);

        u_Mvp = gl.getUniformLocation(gl.program, 'u_Mvp');
        u_Rotate = gl.getUniformLocation(gl.program, 'u_Rotate');
        u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    
        mvpMatrix = new Matrix4();
        mvpMatrix.set(vpMatrix);
        gl.uniformMatrix4fv(u_Mvp, false, mvpMatrix.elements);
    
        rotateMatrix = new Matrix4();
        rotateMatrix.setRotate(texturedFigure.angle += 2, 1, 0, 0);
        gl.uniformMatrix4fv(u_Rotate, false, rotateMatrix.elements);
    
        normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(rotateMatrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    
        //debugger;
        gl.drawArrays(gl.TRIANGLES, 0, n);
    }
}

function initVertexBuffers(gl, figure) {
    if (!initArrayBuffer(gl, 'a_Position', figure.vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Color', figure.colors, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', figure.normals, 3, gl.FLOAT)) return -1;
    
    if (figure.indices != null) {
        var indicesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, figure.indices, gl.STATIC_DRAW);
        return figure.indices.length;
    } else {
        var tcBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, tcBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(figure.textures), gl.STATIC_DRAW );
        var tcAttributeLocation = gl.getAttribLocation( gl.program, 'vTextureCoord');
		gl.vertexAttribPointer( tcAttributeLocation, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( tcAttributeLocation);
        
        var textureDataLocation = gl.getUniformLocation(gl.program, 'textureData');
	
		// texture id, shows what texture to use, in this case we have only one texture
        gl.uniform1i(textureDataLocation, 0);
        return figure.vertices.length;
    }

    
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

function readTextFromFile(file) {
    var reader = new FileReader(); 
    reader.addEventListener('load', function(e) {
        var data = e.target.result;
        parseOBJ(data);
    });

    reader.addEventListener('error', function() {
        alert('File error happened!');
    });

    reader.readAsText(file); 
}

function parseOBJ(text) {
    // because indices are base 1 let's just fill in the 0th data
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];
  
    // same order as `f` indices
    const objVertexData = [
      objPositions,
      objTexcoords,
      objNormals,
    ];
  
    // same order as `f` indices
    let webglVertexData = [
      [],   // positions
      [],   // texcoords
      [],   // normals
    ];
  
    function newGeometry() {
      // If there is an existing geometry and it's
      // not empty then start a new one.
      if (geometry && geometry.data.position.length) {
        geometry = undefined;
      }
      setGeometry();
    }
  
    function addVertex(vert) {
      const ptn = vert.split('/');
      ptn.forEach((objIndexStr, i) => {
        if (!objIndexStr) {
          return;
        }
        const objIndex = parseInt(objIndexStr);
        const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
        webglVertexData[i].push(...objVertexData[i][index]);
      });
    }
  
    const keywords = {
      v(parts) {
        objPositions.push(parts.map(parseFloat));
      },
      vn(parts) {
        objNormals.push(parts.map(parseFloat));
      },
      vt(parts) {
        // should check for missing v and extra w?
        objTexcoords.push(parts.map(parseFloat));
      },
      f(parts) {
        const numTriangles = parts.length - 2;
        for (let tri = 0; tri < numTriangles; ++tri) {
          addVertex(parts[0]);
          addVertex(parts[tri + 1]);
          addVertex(parts[tri + 2]);
        }
      },
    };
  
    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
      const line = lines[lineNo].trim();
      if (line === '' || line.startsWith('#')) {
        continue;
      }
      const m = keywordRE.exec(line);
      if (!m) {
        continue;
      }
      const [, keyword, unparsedArgs] = m;
      const parts = line.split(/\s+/).slice(1);
      const handler = keywords[keyword];
      if (!handler) {
        console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
        continue;
      }
      handler(parts, unparsedArgs);
    }

    var vertices = webglVertexData[0];
    var textcoord = webglVertexData[1];
    var normals = webglVertexData[2];

    var textures = [];
    for (let i = 0; i < textcoord.length; i += 2) {
        textures.push(vec2(textcoord[i], textcoord[i+1]));
        i++;
    }
  
    texturedFigure = new FigureWithTexture(
        new Float32Array(vertices),
        null,
        new Float32Array(normals),
        textures);
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

function setLoadObjListener() {
    document.querySelector("#file-input").addEventListener('change', function() {
        var selectedFiles = this.files;
        if(selectedFiles.length == 0) {
            alert('Error : No file selected');
            return;
        }
        var firstFile = selectedFiles[0];
        readTextFromFile(firstFile);
    });
}


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


