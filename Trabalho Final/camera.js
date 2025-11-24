// 1. SHADERS (Padrão)
const vertexShaderSource = `
    attribute vec4 a_position;
    uniform mat4 u_matrix;
    void main() {
        gl_Position = u_matrix * a_position;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
        gl_FragColor = u_color;
    }
`;

function createProgram(gl, vsSource, fsSource) {
    const createShader = (gl, type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    return program;
}

// 2. ESTADO DO JOGO

const player = {
    x: 0,
    z: 0,
    angle: 0,       // Rotação do corpo do boneco
    walkTime: 0,
    speed: 4.0,
    turnSpeed: 3.0
};

// Estado da Câmera
const camera = {
    angleX: 0,      // Rotação horizontal (orbit)
    angleY: 0.5,    // Rotação vertical (altura)
    radius: 10,     // Distância do personagem
};

const keys = {};

// 3. INPUTS (TECLADO E MOUSE)
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Controle do Mouse para a Câmera
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
const canvas = document.getElementById('glCanvas');

canvas.addEventListener('mousedown', e => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

window.addEventListener('mouseup', () => isDragging = false);

window.addEventListener('mousemove', e => {
    if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        // Sensibilidade
        camera.angleX -= deltaX * 0.01;
        camera.angleY += deltaY * 0.01;

        // Limita a altura da câmera para não virar de ponta cabeça
        camera.angleY = Math.max(-0.5, Math.min(1.5, camera.angleY));
    }
});

// 4. MAIN & RENDER

function main() {
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Garante que m4 foi carregado
    if (typeof m4 === 'undefined') {
        console.error("A biblioteca m4.js não foi carregada corretamente!");
        return;
    }

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    const positionLoc = gl.getAttribLocation(program, 'a_position');
    const matrixLoc = gl.getUniformLocation(program, 'u_matrix');
    const colorLoc = gl.getUniformLocation(program, 'u_color');

    // Cubo Unitário
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -0.5,-0.5,0.5, 0.5,-0.5,0.5, -0.5,0.5,0.5, -0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5, // Frente
        -0.5,-0.5,-0.5, -0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,0.5,-0.5, 0.5,0.5,-0.5, 0.5,-0.5,-0.5, // Trás
        -0.5,0.5,-0.5, -0.5,0.5,0.5, 0.5,0.5,-0.5, -0.5,0.5,0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5, // Topo
        -0.5,-0.5,-0.5, 0.5,-0.5,-0.5, -0.5,-0.5,0.5, -0.5,-0.5,0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5, // Fundo
        -0.5,-0.5,-0.5, -0.5,-0.5,0.5, -0.5,0.5,-0.5, -0.5,-0.5,0.5, -0.5,0.5,0.5, -0.5,0.5,-0.5, // Esq
        0.5,-0.5,-0.5, 0.5,0.5,-0.5, 0.5,-0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,-0.5, 0.5,0.5,0.5, // Dir
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    function drawCube(matrix, color, scale) {
        let m = m4.scale(matrix, scale[0], scale[1], scale[2]);
        gl.uniformMatrix4fv(matrixLoc, false, m);
        gl.uniform4fv(colorLoc, color);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    let lastTime = 0;

    function render(now) {
        now *= 0.001;
        const deltaTime = now - lastTime;
        lastTime = now;

        // --- LÓGICA DO JOGADOR ---
        let isMoving = false;

        if (keys['a']) player.angle += player.turnSpeed * deltaTime;
        if (keys['d']) player.angle -= player.turnSpeed * deltaTime;

        if (keys['w']) {
            player.x -= Math.sin(player.angle) * player.speed * deltaTime;
            player.z -= Math.cos(player.angle) * player.speed * deltaTime;
            isMoving = true;
        }
        if (keys['s']) {
            player.x += Math.sin(player.angle) * player.speed * deltaTime;
            player.z += Math.cos(player.angle) * player.speed * deltaTime;
            isMoving = true;
        }

        if (isMoving) player.walkTime += deltaTime * 5;
        else player.walkTime = 0; 

        // --- RENDERIZAÇÃO ---
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        gl.clearColor(0.85, 0.85, 0.9, 1.0); 
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);
        gl.enableVertexAttribArray(positionLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

        // --- CÂMERA ---
        const fov = 60 * Math.PI / 180;
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const projection = m4.perspective(fov, aspect, 0.1, 100);

        const camX = player.x + Math.sin(camera.angleX) * camera.radius * Math.cos(camera.angleY);
        const camY = 1 + Math.sin(camera.angleY) * camera.radius;
        const camZ = player.z + Math.cos(camera.angleX) * camera.radius * Math.cos(camera.angleY);

        const cameraPos = [camX, camY, camZ];
        const target = [player.x, 1, player.z]; 
        const up = [0, 1, 0];

        const viewMatrix = m4.inverse(m4.lookAt(cameraPos, target, up));
        const viewProjection = m4.multiply(projection, viewMatrix);

        // --- CHÃO ---
        let floorM = m4.translate(viewProjection, 0, -2.5, 0);
        drawCube(floorM, [0.5, 0.5, 0.5, 1.0], [20, 0.1, 20]);

        // --- PERSONAGEM ---
        const legAngle = Math.sin(player.walkTime) * 0.6;
        const bob = Math.abs(Math.sin(player.walkTime)) * 0.1;

        // Tronco
        let m = m4.translate(viewProjection, player.x, bob, player.z);
        m = m4.yRotate(m, player.angle);
        drawCube(m, [0.2, 0.2, 0.8, 1], [1, 1.5, 0.5]); 

        // Cabeça
        let head = m4.translate(m, 0, 1.25, 0);
        drawCube(head, [1, 0.8, 0.6, 1], [0.5, 0.5, 0.5]);

        // Pernas
        let rl = m4.translate(m, 0.3, -0.75, 0);
        rl = m4.xRotate(rl, -legAngle);
        rl = m4.translate(rl, 0, -0.75, 0);
        drawCube(rl, [0.1, 0.1, 0.1, 1], [0.4, 1.5, 0.4]);

        let ll = m4.translate(m, -0.3, -0.75, 0);
        ll = m4.xRotate(ll, legAngle);
        ll = m4.translate(ll, 0, -0.75, 0);
        drawCube(ll, [0.1, 0.1, 0.1, 1], [0.4, 1.5, 0.4]);

        // Braços
        let ra = m4.translate(m, 0.75, 0.5, 0);
        ra = m4.xRotate(ra, legAngle);
        ra = m4.translate(ra, 0, -0.6, 0);
        drawCube(ra, [0.8, 0.2, 0.2, 1], [0.3, 1.2, 0.3]);

        let la = m4.translate(m, -0.75, 0.5, 0);
        la = m4.xRotate(la, -legAngle);
        la = m4.translate(la, 0, -0.6, 0);
        drawCube(la, [0.8, 0.2, 0.2, 1], [0.3, 1.2, 0.3]);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

// Inicia o jogo quando a janela carregar

window.onload = main;
