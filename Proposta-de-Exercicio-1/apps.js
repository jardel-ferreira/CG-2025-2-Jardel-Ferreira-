// Vertex shader source code
const vertexShaderSource3 = `
    precision mediump float;
    attribute vec2 vertPosition;
    void main(){
        gl_Position = vec4(vertPosition, 0.0, 1.0);
    }
`;

// Fragment shader source code
const fragmentShaderSource3 = `
    precision mediump float;
    void main(){
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // vermelho
    }
`;

function createShader3(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram3(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

var InitDemo = function () {
    console.log("this is workin'");
    var canvas = document.getElementById("meucanvas");
    var gl = canvas.getContext("webgl");

    if (!gl) {
        alert("Your browser does not support WebGL");
        return;
    }

    gl.clearColor(0.50, 0.75, 0.80, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const vertexShader = createShader3(gl, gl.VERTEX_SHADER, vertexShaderSource3);
    const fragmentShader = createShader3(gl, gl.FRAGMENT_SHADER, fragmentShaderSource3);
    const program = createProgram3(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // Vértices do triângulo
    var triangleVertices = new Float32Array([
        0.0,  0.5,   // topo
       -0.5, -0.5,   // canto esquerdo
        0.5, -0.5    // canto direito
    ]);

    // Buffer
    const triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);

    // Local do atributo
    const PositionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(
        PositionAttribLocation, 
        2, gl.FLOAT, false, 
        2 * Float32Array.BYTES_PER_ELEMENT, 0
    );
    gl.enableVertexAttribArray(PositionAttribLocation);

    // Desenhar
    gl.drawArrays(gl.TRIANGLES, 0, 3);
};
