const vertexShaderSource = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    gl_PointSize = 10.0;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec3 u_color;

  void main() {
    gl_FragColor = vec4(u_color, 1.0);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Erro compilando shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Erro linkando programa:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}


function main() {
  const canvas = document.getElementById("meucanvas");
  const gl = canvas.getContext("webgl");

  if (!gl) {
    console.log("WebGL não suportado");
    return;
  }
  
  alert("Digite 'e' para desenhar linhas, 'c' para desenhar triângulos e 'k' para trocar a cor");
  // === State Variables: Declared ONCE here ===
  let count = 0;
  let vert = []; // Stores the two clicks for a new line
  let verticesDaUltimaLinha = []; // Stores all points of the last drawn line
  let key = null; // Stores the last key pressed

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  // Buffer setup
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  // Attribute location
  const positionAttribLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionAttribLocation);
  gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);

  // Uniform location
  const colorUniformLocation = gl.getUniformLocation(program, "u_color");

  // === Event Listeners ===
  canvas.addEventListener("mousedown", mouseClick, false);
  window.addEventListener("keydown", keyDown, false);

  function keyDown(event) {
     if(event.key == 'k'){
          // Change color to a new random color
          gl.uniform3f(colorUniformLocation, Math.random(), Math.random(), Math.random());
          drawScene(verticesDaUltimaLinha.length / 2);
       }
       else if(event.key == 'e'){
        key = 'e';
       }
       else if(event.key == 'c'){
        key = 'c';
       }
  }

  function mouseClick(event) {
    let xPixel = event.offsetX;
    let yPixel = event.offsetY;

    if (key === 'e') {
      vert.push(xPixel, yPixel);
      count++;

      if (count === 2) {
        let x0 = vert[0], y0 = vert[1];
        let x1 = vert[2], y1 = vert[3];

        let pontosLinha = bresenham(x0, y0, x1, y1);

        // Convert pixel coordinates to Normalized Device Coordinates (NDC)
        let pontosNDC = [];
        for (let i = 0; i < pontosLinha.length; i++) {
          let [px, py] = pontosLinha[i];
          let x = (2 * px / canvas.width) - 1;
          let y = (-2 * py / canvas.height) + 1;
          pontosNDC.push(x, y);
        }

        // 1. SAVE the points of the line we just calculated
        verticesDaUltimaLinha = pontosNDC;

        // Set a new random color for the new line
        gl.uniform3f(colorUniformLocation, Math.random(), Math.random(), Math.random());
        
        // Send data to GPU and draw
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesDaUltimaLinha), gl.STATIC_DRAW);
        drawScene(verticesDaUltimaLinha.length / 2);

        // Reset for the next line
        vert = [];
        count = 0;
      }
    } else if (key == 'c'){
      vert.push(xPixel, yPixel);
      count++;

      if (count === 3) {
        let x0 = vert[0], y0 = vert[1];
        let x1 = vert[2], y1 = vert[3];
        let x2 = vert[4], y2 = vert[5];
        let pontosLinha = [];
        pontosLinha = pontosLinha.concat(bresenham(x0, y0, x1, y1));
        pontosLinha = pontosLinha.concat(bresenham(x1, y1, x2, y2));
        pontosLinha = pontosLinha.concat(bresenham(x2, y2, x0, y0));
        // Convert pixel coordinates to Normalized Device Coordinates (NDC)
        let pontosNDC = [];
        for (let i = 0; i < pontosLinha.length; i++) {
          let [px, py] = pontosLinha[i];
          let x = (2 * px / canvas.width) - 1;
          let y = (-2 * py / canvas.height) + 1;
          pontosNDC.push(x, y);
        }

        // 1. SAVE the points of the line we just calculated
        verticesDaUltimaLinha = pontosNDC;

        // Set a new random color for the new line
        gl.uniform3f(colorUniformLocation, Math.random(), Math.random(), Math.random());
        
        // Send data to GPU and draw
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesDaUltimaLinha), gl.STATIC_DRAW);
        drawScene(verticesDaUltimaLinha.length / 2);

        // Reset for the next line
        vert = [];
        count = 0;

      }
    }
  }

  function bresenham(x0, y0, x1, y1) {
    let pontos = [];
    let dx = Math.abs(x1 - x0);
    let sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0);
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    
    while (true) {
      pontos.push([x0, y0]);
      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
    return pontos;
  }

  function drawScene(numeroDePontos) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, numeroDePontos);
  }

  // Initial clear of the canvas
  drawScene(0); 
}

main();