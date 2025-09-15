
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


window.onload = function InitDemo(){
   const canvas = document.getElementById("meucanvas");
   const gl = canvas.getContext("webgl");


   if (!gl){
    alert("Browser doest support webgl");
   }

   function createShader(gl, type, source){
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

    // cria vértices de um círculo
    function createSemiCircleVertices(centerX, centerY, radius, segments) {
        let vertices = [centerX, centerY]; // centro
        for (let i = 0; i <= segments; i++) {
            let angle = (i / segments) * Math.PI; // 0 → 2π
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

    var rectangle = new Float32Array([
        -0.4, 0.07,   // bottom-left
        -0.4, 0.2,   // top-left
        0.4, 0.07,   // bottom-right

        0.4, 0.07,   // bottom-right
        0.4, 0.2,   // top-right
        -0.4, 0.2    // top-left
    ]);

    var rectangle2 = new Float32Array([
        0.0, 0.2,   // bottom-left
        0.0, 0.3,   // top-left
        0.15, 0.2,   // bottom-right

        0.15, 0.2,   // bottom-right
        0.15, 0.3,   // top-right
        0.0, 0.3    // top-left
    ]);


    var rectangle3 = new Float32Array([
        -0.05, 0.2,   // bottom-left
        -0.05, 0.3,   // top-left
        -0.20, 0.2,   // bottom-right

        -0.20, 0.2,   // bottom-right
        -0.20, 0.3,   // top-right
        -0.05, 0.3    // top-left
    ]);

    var circleVertices = createSemiCircleVertices(0.0, 0.1, 0.3, 100);

    gl.bufferData(gl.ARRAY_BUFFER, circleVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 1.0, 0.0, 0.0, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 2);

    gl.bufferData(gl.ARRAY_BUFFER, rectangle, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 1.0, 0.25, 0.25, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bufferData(gl.ARRAY_BUFFER, rectangle2, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 0.827, 0.827, 0.827, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLES, 0, 6);

        
    gl.bufferData(gl.ARRAY_BUFFER, rectangle3, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 0.827, 0.827, 0.827, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLES, 0, 6);

   circleVertices = createCircleVertices(-0.2, 0.07, 0.07, 100);

    gl.bufferData(gl.ARRAY_BUFFER, circleVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 0.0, 0.0, 0.0, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 2);

   circleVertices = createCircleVertices(0.2, 0.07, 0.07, 100);

    gl.bufferData(gl.ARRAY_BUFFER, circleVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 0.0, 0.0, 0.0, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 2);

    circleVertices = createCircleVertices(0.37, 0.15, 0.02, 100);

    gl.bufferData(gl.ARRAY_BUFFER, circleVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 1.0, 0.843, 0.0, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 2);

    circleVertices = createCircleVertices(-0.37, 0.15, 0.02, 100);

    gl.bufferData(gl.ARRAY_BUFFER, circleVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 1.0, 0.843, 0.0, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 2);




}