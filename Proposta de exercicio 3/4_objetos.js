        const vertexShaderSource = `
            attribute vec2 a_position;
            uniform mat3 u_matrix;

            void main() {
                gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform vec4 u_color;
            void main() {
                gl_FragColor = u_color;
            }
        `;

        // Biblioteca de matrizes que você forneceu
        var m3 = {
            identity: function() { return [1,0,0, 0,1,0, 0,0,1]; },
            multiply: function(a,b) { var a00=a[0],a01=a[3],a02=a[6],a10=a[1],a11=a[4],a12=a[7],a20=a[2],a21=a[5],a22=a[8],b00=b[0],b01=b[3],b02=b[6],b10=b[1],b11=b[4],b12=b[7],b20=b[2],b21=b[5],b22=b[8]; return [a00*b00+a01*b10+a02*b20, a10*b00+a11*b10+a12*b20, a20*b00+a21*b10+a22*b20, a00*b01+a01*b11+a02*b21, a10*b01+a11*b11+a12*b21, a20*b01+a21*b11+a22*b21, a00*b02+a01*b12+a02*b22, a10*b02+a11*b12+a12*b22, a20*b02+a21*b12+a22*b22]; },
            translation: function(tx,ty) { return [1,0,0, 0,1,0, tx,ty,1]; },
            scaling: function(sx,sy) { return [sx,0,0, 0,sy,0, 0,0,1]; },
            rotation: function(r) { var c=Math.cos(r),s=Math.sin(r); return [c,s,0, -s,c,0, 0,0,1]; },
            translate: function(m,tx,ty) { return m3.multiply(m3.translation(tx,ty),m);},
            scale: function(m,sx,sy) { return m3.multiply(m3.scaling(sx,sy),m); },
            rotate: function(m,r) { return m3.multiply(m3.rotation(r),m); }
        };

        window.onload = function InitDemo() {
            const canvas = document.getElementById("meucanvas");
            const gl = canvas.getContext("webgl");

            if (!gl) {
                alert("Seu navegador não suporta WebGL. Tente o Chrome ou Firefox.");
                return;
            }

            // --- Compilação e Linkagem dos Shaders (sem alteração) ---
            function createShader(gl, type, source) { const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader); if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { console.error('Erro ao compilar shader:', gl.getShaderInfoLog(shader)); gl.deleteShader(shader); return null; } return shader; }
            function createProgram(gl, vertexShader, fragmentShader) { const program = gl.createProgram(); gl.attachShader(program, vertexShader); gl.attachShader(program, fragmentShader); gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { console.error('Erro ao linkar programa:', gl.getProgramInfoLog(program)); gl.deleteProgram(program); return null; } return program; }
            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
            const program = createProgram(gl, vertexShader, fragmentShader);

            const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
            const colorUniformLocation = gl.getUniformLocation(program, "u_color");
            const matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");


            // --- Definição da Geometria ---
            const cabecaVertices = new Float32Array([-0.2,0.2, -0.2,0.5, 0.2,0.2, 0.2,0.2, 0.2,0.5, -0.2,0.5]);
            const corpoVertices = new Float32Array([-0.3,0.2, -0.3,-0.2, 0.3,-0.2, -0.3,0.2, 0.3,0.2, 0.3,-0.2]);
            const pernaEsquerdaVertices = new Float32Array([-0.2,-0.2, -0.2,-0.4, -0.1,-0.2, -0.1,-0.2, -0.1,-0.4, -0.2,-0.4]);
            const pernaDireitaVertices = new Float32Array([0.1,-0.2, 0.2,-0.2, 0.1,-0.4, 0.2,-0.2, 0.2,-0.4, 0.1,-0.4]);
            const antenaVertices = new Float32Array([0.02,0.5, -0.02,0.5, 0.02,0.7, -0.02,0.5, 0.02,0.7, -0.02,0.7]);
            const bracoDireitoVertices = new Float32Array([0.3,0.1, 0.5,0.1, 0.3,0.0, 0.5,0.1, 0.5,0.0, 0.3,0.0]);
            const bracoEsquerdoVertices = new Float32Array([-0.3,0.1, -0.5,0.1, -0.3,0.0, -0.5,0.1, -0.5,0.0, -0.3,0.0]);

            function createCircleVertices(centerX, centerY, radius, segments) { let vertices = [centerX, centerY]; for (let i = 0; i <= segments; i++) { let angle = (i / segments) * 2 * Math.PI; let x = centerX + radius * Math.cos(angle); let y = centerY + radius * Math.sin(angle); vertices.push(x, y); } return new Float32Array(vertices); }
            const luzAntenaVertices = createCircleVertices(0.0, 0.75, 0.055, 100);
            const olhoDireitoVertices = createCircleVertices(0.1, 0.4, 0.044, 100);
            const olhoEsquerdoVertices = createCircleVertices(-0.1, 0.4, 0.044, 100);
            
            // --- NOVO: Função para criar os vértices do coração ---
            function createHeartVertices() {
                const scale = 0.9; // Ajusta o tamanho do coração
                // Ponto central para o TRIANGLE_FAN
                let vertices = [0.0, 0.0];
                // Pontos do perímetro do coração
                const points = [
                    0.0, -0.15, -0.1, 0.0, -0.1, 0.1, -0.05, 0.15, 0.0, 0.1,
                    0.05, 0.15, 0.1, 0.1, 0.1, 0.0, 0.0, -0.15
                ];
                for (let i = 0; i < points.length; i++) {
                    vertices.push(points[i] * scale);
                }
                return new Float32Array(vertices);
            }
            const coracaoVertices = createHeartVertices();


            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            
            function drawScene() {
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.clearColor(0.1, 0.1, 0.15, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.useProgram(program);

                const matrizIdentidade = m3.identity();

                function desenhaParte(vertices, cor, matriz, modoDesenho = gl.TRIANGLES) {
                    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
                    gl.uniform4f(colorUniformLocation, cor[0], cor[1], cor[2], cor[3]);
                    gl.uniformMatrix3fv(matrixUniformLocation, false, matriz);
                    gl.drawArrays(modoDesenho, 0, vertices.length / 2);
                }

                const cinzaClaro = [0.827, 0.827, 0.827, 1.0];
                const cinzaMedio = [0.657, 0.657, 0.657, 1.0];
                const vermelho = [1.0, 0.2, 0.2, 1.0];
                
                // --- MUDANÇA: COR ANIMADA PARA AS LUZES ---
                const time = Date.now() / 600;
                const r = Math.sin(time * 2.0) * 0.5 + 0.5;
                const g = Math.sin(time * 1.5) * 0.5 + 0.5;
                const b = Math.sin(time * 2.5) * 0.5 + 0.5;
                const corAnimadaLuz = [r, g, b, 1.0];


                // Desenha as partes estáticas e as luzes com cor animada
                desenhaParte(corpoVertices, cinzaMedio, matrizIdentidade);
                desenhaParte(cabecaVertices, cinzaClaro, matrizIdentidade);
                desenhaParte(pernaEsquerdaVertices, cinzaClaro, matrizIdentidade);
                desenhaParte(pernaDireitaVertices, cinzaClaro, matrizIdentidade);
                desenhaParte(antenaVertices, cinzaClaro, matrizIdentidade);
                desenhaParte(luzAntenaVertices, corAnimadaLuz, matrizIdentidade, gl.TRIANGLE_FAN);
                desenhaParte(olhoDireitoVertices, corAnimadaLuz, matrizIdentidade, gl.TRIANGLE_FAN);
                desenhaParte(olhoEsquerdoVertices, corAnimadaLuz, matrizIdentidade, gl.TRIANGLE_FAN);
                desenhaParte(bracoEsquerdoVertices, cinzaClaro, matrizIdentidade);

                // --- NOVO: ANIMAÇÃO DO CORAÇÃO PULSANTE ---
                {
                    // Usa o seno para criar um valor que oscila entre 0.8 e 1.0
                    const pulso = Math.sin(Date.now() / 200) * 0.1 + 0.9;
                    // A matriz de transformação será uma escala a partir da origem (0,0)
                    const matrizDoCoracao = m3.scaling(pulso, pulso);
                    desenhaParte(coracaoVertices, vermelho, matrizDoCoracao, gl.TRIANGLE_FAN);
                }

                // --- Animação do braço direito (sem alteração) ---
                {
                    const ombroX = 0.3;
                    const ombroY = 0.1;
                    const anguloDoAceno = Math.sin(Date.now() / 300) * 0.9;
                    const matrizTranslacaoParaOrigem = m3.translation(-ombroX, -ombroY);
                    const matrizRotacao = m3.rotation(anguloDoAceno);
                    const matrizTranslacaoDeVolta = m3.translation(ombroX, ombroY);
                    let matrizDoBraco = m3.multiply(matrizTranslacaoDeVolta, matrizRotacao);
                    matrizDoBraco = m3.multiply(matrizDoBraco, matrizTranslacaoParaOrigem);
                    desenhaParte(bracoDireitoVertices, cinzaClaro, matrizDoBraco);
                }
            }

            function animate() {
                drawScene();
                requestAnimationFrame(animate);
            }

            animate();
        };