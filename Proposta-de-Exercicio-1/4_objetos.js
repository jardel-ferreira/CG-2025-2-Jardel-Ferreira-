
const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
        gl_FragColor = u_color;
    }
`;

window.onload = function InitDemo() {
    const canvas = document.getElementById("meucanvas");
    const gl = canvas.getContext("webgl");

    if (!gl) {
        alert("Seu navegador não suporta WebGL. Tente o Chrome ou Firefox.");
        return;
    }

    // --- Compilação dos Shaders e Criação do Programa ---
    
    // Função auxiliar para criar e compilar um shader
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Erro ao compilar shader:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }


    // cria vértices de um círculo
    function createCircleVertices(centerX, centerY, radius, segments) {
        let vertices = [centerX, centerY]; // centro
        for (let i = 0; i <= segments; i++) {
            let angle = (i / segments) * 2 * Math.PI; // 0 → 2π
            let x = centerX + radius * Math.cos(angle);
            let y = centerY + radius * Math.sin(angle);
            vertices.push(x, y);
        }
        return new Float32Array(vertices);
    }



    // Função auxiliar para linkar os shaders em um programa
    function createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Erro ao linkar programa:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    // Obter a localização do atributo de posição e do uniform de cor
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const colorUniformLocation = gl.getUniformLocation(program, "u_color");

    // --- Definição da Geometria dos 4 Objetos ---

    // Objeto 1: Quadrado (desenhado com 2 triângulos = 6 vértices)
    const squareVertices = new Float32Array([
        // --- Triângulo 1 ---
        -0.2,  0.2,  // Ponto A
        -0.2,  0.5,  // Ponto B
         0.2,  0.2,  // Ponto C

        // --- Triângulo 2 ---
         0.2,  0.2,  // Ponto B
         0.2,  0.5,  // Ponto C
        -0.2,  0.5   // Ponto D
    ]);
    // Objeto 2: Triângulo (3 vértices)
    const triangleVertices = new Float32Array([
         0.1,  -0.2,  // Ponto A
         0.2,  -0.2,  // Ponto B
         0.1,  -0.4,  // Ponto C

        // --- Triângulo 2 ---
         0.2,  -0.2,  // Ponto B
         0.2,  -0.4,  // Ponto C
         0.1,  -0.4   // Ponto D
    ]);

    // Objeto 3: Retângulo / Linha (desenhado com 2 triângulos = 6 vértices)
    const lineVertices = new Float32Array([
        // --- Triângulo 1 ---
        -0.3,  0.2,  // Ponto A
        -0.3,  -0.2,  // Ponto B
         0.3,  -0.2,  // Ponto C

        // --- Triângulo 2 ---
         -0.3,  0.2,  // Ponto B
         0.3,  0.2,  // Ponto C
         0.3,  -0.2   // Ponto D
    ]);
    
    // Objeto 4: Losango (desenhado com 2 triângulos = 6 vértices)
    const diamondVertices = new Float32Array([
        -0.1,  -0.2,  // Ponto A
        -0.2,  -0.2,  // Ponto B
        -0.1,  -0.4,  // Ponto C

        // --- Triângulo 2 ---
        -0.2,  -0.2,  // Ponto B
        -0.2,  -0.4,  // Ponto C
        -0.1,  -0.4   // Ponto D
    ]);

    const varticesantena = new Float32Array([
        0.02,  0.5,  // Ponto A
        -0.02,  0.5,  // Ponto B
         0.02,  0.7,  // Ponto C

        // --- Triângulo 2 ---
        -0.02,  0.5,  // Ponto B
         0.02,  0.7,  // Ponto C
        -0.02,  0.7   // Ponto D
    ]);

    const braco1 = new Float32Array([
         0.3,  0.0,  // Ponto A
         0.5,  0.0,  // Ponto B
         0.5,  -0.1,  // Ponto C

        // --- Triângulo 2 ---
        0.3,   0.1,  // Ponto B
         0.3,  0.0,  // Ponto C
         0.5,  0.0   // Ponto D
    ]);

    const braco2 = new Float32Array([
         -0.3,  0.0,  // Ponto A
        - 0.5,  0.0,  // Ponto B
         -0.5,  -0.1,  // Ponto C

        // --- Triângulo 2 ---
       -0.3,   0.1,  // Ponto B
       -0.3,  0.0,  // Ponto C
       -0.5,  0.0   // Ponto D
    ]);


    // --- Configuração e Desenho ---
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.1, 0.1, 0.15, 1.0); // Fundo cinza escuro
    gl.clear(gl.COLOR_BUFFER_BIT);''
    gl.useProgram(program); // Ativa o programa de shader

    // Cria UM buffer que será reutilizado para todos os objetos
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    // Configura como o atributo de posição irá ler os dados do buffer
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);


    // 1. Desenha a cabeça
    gl.bufferData(gl.ARRAY_BUFFER, squareVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 0.827, 0.827, 0.827, 1.0); // Cor verde
    gl.drawArrays(gl.TRIANGLES, 0, 6); // 6 vértices

    // 2. Desenha o corpo
    gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 0.827, 0.827, 0.827, 1.0); // Cor laranja
    gl.drawArrays(gl.TRIANGLES, 0, 6); // 3 vértices

    // 3. Desenha pernas
    gl.bufferData(gl.ARRAY_BUFFER, lineVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 0.657, 0.657, 0.657, 1.0); // Cor azul
    gl.drawArrays(gl.TRIANGLES, 0, 6); // 6 vértices
    
    gl.bufferData(gl.ARRAY_BUFFER, diamondVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 0.827, 0.827, 0.827, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLES, 0, 6); // 6 vértices
    
      // 4. Desenha antena
    gl.bufferData(gl.ARRAY_BUFFER, varticesantena, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 0.827, 0.827, 0.827, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLES, 0, 6); // 6 vértices


    
    // luz da antena e olhos
    var circleVertices = createCircleVertices(0.0, 0.75, 0.055, 100);

    gl.bufferData(gl.ARRAY_BUFFER, circleVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 1.0, 1.0, 0.7, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 2);


    circleVertices = createCircleVertices(0.1, 0.4, 0.044, 100);

    gl.bufferData(gl.ARRAY_BUFFER, circleVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 1.0, 1.0, 0.7, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 2);

    circleVertices = createCircleVertices(-0.1, 0.4, 0.044, 100);

    gl.bufferData(gl.ARRAY_BUFFER, circleVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 1.0, 1.0, 0.7, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 2);


    // 4. Desenha o Braços
    gl.bufferData(gl.ARRAY_BUFFER, braco1, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 0.827, 0.827, 0.827, 1.0); //cor cinza 
    gl.drawArrays(gl.TRIANGLES, 0, 6); // 6 vértices

    gl.bufferData(gl.ARRAY_BUFFER, braco2, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 0.827, 0.827, 0.827, 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 6); // 6 vértices



};
