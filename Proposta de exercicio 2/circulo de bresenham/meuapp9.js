
// Vertex shader source code
const vertexShaderSource = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0, 1);
    gl_PointSize = 5.0;
  }
`;

// Fragment shader source code
const fragmentShaderSource = `
  precision mediump float;
  uniform vec3 u_color;

  void main() {
    gl_FragColor = vec4(u_color,1.0);
  }
`;

function createShader1(gl, type, source) {
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

function createProgram1(gl, vertexShader, fragmentShader) {
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


function main() {
    const canvas = document.getElementById('mcanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const vertexShader = createShader1(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader1(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = createProgram1(gl, vertexShader, fragmentShader);

    gl.useProgram(program);

    // MODIFICADO: Vamos manter um array de vértices para o círculo atual
    let circleVertices = new Float32Array([]);

    const VertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    // Não precisa carregar dados iniciais, faremos isso no clique

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);


    const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
    let colorVector = [Math.random(), Math.random(), Math.random()];
    gl.uniform3fv(colorUniformLocation, colorVector);


    canvas.addEventListener("mousedown", mouseClick, false);

function bresenham(centerX, centerY, radius, numSegments = 100) {
        const vertices = [];
        const aspect = canvas.width / canvas.height;
        
        for (let i = 0; i <= numSegments; i++) {
            const angle = (i / numSegments) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + (radius * aspect) * Math.sin(angle);
            vertices.push(x, y);
        }
        return new Float32Array(vertices);
    }

 function mouseClick(event) {
    let x = (event.offsetX / canvas.width) * 2 - 1;
    let y = (event.offsetY / canvas.height) * -2 + 1;

    const radius = 0.3;
    circleVertices = bresenham(x, y, radius);

    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, circleVertices, gl.STATIC_DRAW);

    drawScene();
    }



    const bodyElement = document.querySelector("body");
    bodyElement.addEventListener("keydown", keyDown, false);

    function keyDown(event) {
        if (event.key === 'c') {
            colorVector = [Math.random(), Math.random(), Math.random()];
            gl.uniform3fv(colorUniformLocation, colorVector);
            drawScene(); // Redesenha o círculo existente com a nova cor
        }
    }


    function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (circleVertices.length > 0) {
            gl.drawArrays(gl.LINE_LOOP, 0, circleVertices.length / 2);
        }
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

main()