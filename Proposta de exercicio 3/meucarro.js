        window.onload = function InitDemo() {
            const canvas = document.getElementById("meucanvas");
            const gl = canvas.getContext("webgl");

            if (!gl) {
                console.error("Browser não suporta WebGL");
                document.body.innerHTML = "Seu browser não suporta WebGL.";
                return;
            }

            const vertexShaderSource = `
                attribute vec2 a_position;
                uniform mat3 u_matrix;
                void main() {
                    gl_Position = vec4((u_matrix * vec3(a_position, 1.0)).xy, 0.0, 1.0);
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
                    console.error('Erro ao compilar shader:', gl.getShaderInfoLog(shader));
                    gl.deleteShader(shader); return null;
                }
                return shader;
            }
            
            function createProgram(gl, vertexShader, fragmentShader) {
                const program = gl.createProgram();
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    console.error('Erro ao linkar programa:', gl.getProgramInfoLog(program));
                    gl.deleteProgram(program); return null;
                }
                return program;
            }

            function createCircleVertices(centerX, centerY, radius, segments) {
                let vertices = [centerX, centerY];
                for (let i = 0; i <= segments; i++) {
                    let angle = (i / segments) * 2 * Math.PI;
                    vertices.push(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
                }
                return new Float32Array(vertices);
            }

            function createSemiCircleVertices(centerX, centerY, radius, segments) {
                let vertices = [centerX, centerY];
                for (let i = 0; i <= segments; i++) {
                    let angle = (i / segments) * Math.PI;
                    vertices.push(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
                }
                return new Float32Array(vertices);
            }

            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
            const program = createProgram(gl, vertexShader, fragmentShader);

            const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
            const colorUniformLocation = gl.getUniformLocation(program, "u_color");
            const matrixLocation = gl.getUniformLocation(program, "u_matrix");

            gl.useProgram(program);

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);


            const carBody = new Float32Array([-0.4, 0.07, -0.4, 0.2, 0.4, 0.07, 0.4, 0.07, 0.4, 0.2, -0.4, 0.2]);
            const rearWindow = new Float32Array([0.0, 0.2, 0.0, 0.3, 0.15, 0.2, 0.15, 0.2, 0.15, 0.3, 0.0, 0.3]);
            const frontWindow = new Float32Array([-0.05, 0.2, -0.05, 0.3, -0.20, 0.2, -0.20, 0.2, -0.20, 0.3, -0.05, 0.3]);
            const carTop = createSemiCircleVertices(0.0, 0.1, 0.3, 100);
            const rearWheel = createCircleVertices(-0.2, 0.07, 0.07, 100);
            const frontWheel = createCircleVertices(0.2, 0.07, 0.07, 100);
            const frontLight = createCircleVertices(0.37, 0.15, 0.02, 100);
            const rearLight = createCircleVertices(-0.37, 0.15, 0.02, 100);
            
            //Função para desenhar todas as partes do carro
            function drawCar() {
                // Draw Car Body
                gl.bufferData(gl.ARRAY_BUFFER, carBody, gl.STATIC_DRAW);
                gl.uniform3f(colorUniformLocation, 1.0, 0.25, 0.25);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                
                // Draw Car Top
                gl.bufferData(gl.ARRAY_BUFFER, carTop, gl.STATIC_DRAW);
                gl.uniform3f(colorUniformLocation, 1.0, 0.0, 0.0);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, carTop.length / 2);

                // Draw Rear Window
                gl.bufferData(gl.ARRAY_BUFFER, rearWindow, gl.STATIC_DRAW);
                gl.uniform3f(colorUniformLocation, 0.827, 0.827, 0.827);
                gl.drawArrays(gl.TRIANGLES, 0, 6);

                // Draw Front Window
                gl.bufferData(gl.ARRAY_BUFFER, frontWindow, gl.STATIC_DRAW);
                gl.uniform3f(colorUniformLocation, 0.827, 0.827, 0.827);
                gl.drawArrays(gl.TRIANGLES, 0, 6);

                // Draw Rear Wheel
                gl.bufferData(gl.ARRAY_BUFFER, rearWheel, gl.STATIC_DRAW);
                gl.uniform3f(colorUniformLocation, 0.0, 0.0, 0.0);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, rearWheel.length / 2);

                // Draw Front Wheel
                gl.bufferData(gl.ARRAY_BUFFER, frontWheel, gl.STATIC_DRAW);
                gl.uniform3f(colorUniformLocation, 0.0, 0.0, 0.0);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, frontWheel.length / 2);

                // Draw Front Light
                gl.bufferData(gl.ARRAY_BUFFER, frontLight, gl.STATIC_DRAW);
                gl.uniform3f(colorUniformLocation, 1.0, 0.843, 0.0);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, frontLight.length / 2);
                
                // Draw Rear Light
                gl.bufferData(gl.ARRAY_BUFFER, rearLight, gl.STATIC_DRAW);
                gl.uniform3f(colorUniformLocation, 1.0, 0.843, 0.0);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, rearLight.length / 2);
            }
            
            let carPositionX = -1.5; // Posição inicial do carro (fora da tela, à esquerda)
            let speed = 0.005; // Velocidade do movimento

            // --- Loop de Animação ---
            function animate() {
                // Atualiza a posição X do carro
                carPositionX += speed;
                if (carPositionX > 1.5) {
                    carPositionX = -1.5; // Reinicia quando sai da tela pela direita
                }
                
                // Limpa a tela
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.clearColor(0.1, 0.1, 0.15, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);

                // Cria a matriz de translação para a posição atual do carro
                let matrix = m3.translation(carPositionX, 0);

                // Envia a matriz para o shader
                gl.uniformMatrix3fv(matrixLocation, false, matrix);

                // Desenha o carro na nova posição
                drawCar();
                
                // Pede ao browser para chamar 'animate'
                requestAnimationFrame(animate);
            }

            // Inicia a animação!
            animate();
        }