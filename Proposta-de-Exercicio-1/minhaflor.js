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



function createTeardropVertices(centerX, centerY, radius, tipHeight, segments) {
    const vertices = [];

    // --- 1. A Parte de Cima (O Triângulo) ---
    const tipY = centerY + tipHeight;
    const leftX = centerX - radius;
    const rightX = centerX + radius;

    // O triângulo superior é formado por 3 pontos
    vertices.push(
        centerX, tipY,    // Ponto de cima (a ponta da gota)
        leftX, centerY,   // Ponto da base esquerda
        rightX, centerY   // Ponto da base direita
    );

    // --- 2. A Parte de Baixo (O Semi-círculo) ---
    // Vamos criar o semi-círculo como uma série de pequenos triângulos
    // que partem do centro.
    for (let i = 0; i <= segments; i++) {
        const angle1 = Math.PI + (i / segments) * Math.PI;
        const angle2 = Math.PI + ((i + 1) / segments) * Math.PI;

        // Ponto no centro da base
        const cx = centerX;
        const cy = centerY;

        // Ponto 1 na circunferência
        const x1 = centerX + radius * Math.cos(angle1);
        const y1 = centerY + radius * Math.sin(angle1);

        // Ponto 2 na circunferência
        const x2 = centerX + radius * Math.cos(angle2);
        const y2 = centerY + radius * Math.sin(angle2);
        
        // Adiciona o triângulo que forma este segmento do arco
        vertices.push(cx, cy, x1, y1, x2, y2);
    }

    return new Float32Array(vertices);
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


    var circleVertices = createCircleVertices(0.0, 0.4, 0.1, 100);

    gl.bufferData(gl.ARRAY_BUFFER, circleVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 1.0, 1.0, 0.4, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 2);


    var triangulo = new Float32Array([
         0.1, 0.4,   // bottom-left
         0.3, 0.5,   // top-left
         0.25, 0.6,   // bottom-right
    ]);

   
    // 3. Desenhar a gota
    const teardropVertices = createTeardropVertices(0.0, 0.0080, 0.1, 0.3, 50);
    const vertexCount = teardropVertices.length / 2; // Dividimos por 2 pois cada vértice tem X e Y
    gl.bufferData(gl.ARRAY_BUFFER, teardropVertices, gl.STATIC_DRAW);
    gl.uniform4f(colorUniformLocation, 1.0, 0.0, 0.0, 1.0); // Cor roxa
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexCount);



}