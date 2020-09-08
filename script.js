let gl;

function initWebGL(canvas) {
    gl = null;

    try {
        // Попытаться получить стандартный контекст. Если не получится, попробовать получить экспериментальный.
        gl = canvas.getContext("webgl");
    }
    catch(e) {}

    // Если мы не получили контекст GL, завершить работу
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }

    return gl;
}

function start() {
    var canvas = document.getElementById('glcanvas');

    gl = initWebGL(canvas);

    if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);
        let shaderV = loadVShader();
        let shaderF = loadFShader();

        const program = gl.createProgram();
        gl.attachShader(program, shaderV);
        gl.attachShader(program, shaderF);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            throw new Error('Failed to link program');
        }
          
        gl.useProgram(program);

        const positionsData = new Float32Array([
            -0.5 , -0.4 , -0.75,
             0.5 , -0.4 , -0.75,
             0   ,  0.4 , -0.75 ,
        ]);
        
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positionsData, gl.STATIC_DRAW);

        const attribute = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(attribute);
        gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        
    }
}

function loadVShader() {
    const sourceV = `
        attribute vec3 position;
        varying vec4 color;
      
        void main() {
          gl_Position = vec4(position, 1);
          color = gl_Position * 0.5 + 0.5;
        }
    `;

    const shaderV = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shaderV, sourceV);
    gl.compileShader(shaderV);

    if (!gl.getShaderParameter(shaderV, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shaderV));
        throw new Error('Failed to compile vertex shader');
    }

    return shaderV;
}


function loadFShader() {
    const sourceF = `
        precision mediump float;
        varying vec4 color;
    
        void main() {
        gl_FragColor = color;
        }
    `;

    const shaderF = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shaderF, sourceF);
    gl.compileShader(shaderF);

    if (!gl.getShaderParameter(shaderF, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shaderF));
        throw new Error('Failed to compile fragment shader');
    }

    return shaderF;
}


