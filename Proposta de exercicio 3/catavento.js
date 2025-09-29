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

        var m3 = {
            identity: function(){ return [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]; },
            multiply: function(a,b){ var a00=a[0*3+0],a01=a[0*3+1],a02=a[0*3+2],a10=a[1*3+0],a11=a[1*3+1],a12=a[1*3+2],a20=a[2*3+0],a21=a[2*3+1],a22=a[2*3+2],b00=b[0*3+0],b01=b[0*3+1],b02=b[0*3+2],b10=b[1*3+0],b11=b[1*3+1],b12=b[1*3+2],b20=b[2*3+0],b21=b[2*3+1],b22=b[2*3+2]; return [a00*b00+a10*b01+a20*b02,a01*b00+a11*b01+a21*b02,a02*b00+a12*b01+a22*b02,a00*b10+a10*b11+a20*b12,a01*b10+a11*b11+a21*b12,a02*b10+a12*b11+a22*b12,a00*b20+a10*b21+a20*b22,a01*b20+a11*b21+a21*b22,a02*b20+a12*b21+a22*b22];},
            translation: function(tx,ty){ return [ 1, 0, 0, 0, 1, 0, tx, ty, 1 ]; },
            scaling: function(sx,sy){ return [ sx, 0, 0, 0, sy, 0, 0, 0, 1 ]; },
            rotation: function(angleInRadians){ var c=Math.cos(angleInRadians),s=Math.sin(angleInRadians); return [ c, -s, 0, s, c, 0, 0, 0, 1 ]; },
        };


        window.onload = function InitDemo() {
            const canvas = document.getElementById("meucanvas");
            const gl = canvas.getContext("webgl");

            if (!gl) {
                alert("Seu navegador não suporta WebGL.");
                return;
            }

            function createShader(gl, type, source) { const shader=gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader); if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { console.error('Erro ao compilar shader:', gl.getShaderInfoLog(shader)); gl.deleteShader(shader); return null; } return shader; }
            function createProgram(gl, vertexShader, fragmentShader) { const program=gl.createProgram(); gl.attachShader(program, vertexShader); gl.attachShader(program, fragmentShader); gl.linkProgram(program); if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { console.error('Erro ao linkar programa:', gl.getProgramInfoLog(program)); gl.deleteProgram(program); return null; } return program; }
            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
            const program = createProgram(gl, vertexShader, fragmentShader);

            const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
            const colorUniformLocation = gl.getUniformLocation(program, "u_color");
            const matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");

            const paVermelhaVertices = new Float32Array([
                0.0,  0.0,    0.4,  0.1,    0.1,  0.2,
            ]);

            const paVermelhaVerticesbase = new Float32Array([
                0.0,  0.0,    0.4,  0.1,    0.45, -0.45,
            ]);
            const paVerdeVertices = new Float32Array([
                0.0,  0.0,    0.3, -0.1,    0.05, -0.3,
            ]);

            const paVerdeVerticesbase = new Float32Array([
                0.0,  0.0,    0.05, -0.3,   -0.45, -0.4,
            ]);



            const paAzulVertices = new Float32Array([
                0.0,  0.0,   -0.170, -0.15, -0.33, -0.0,

            ]);

            const paAzulVerticesbase = new Float32Array([
                0.0,  0.0,   -0.33, -0.0,   -0.33, 0.4,
            ]);

            const paAmarelaVertices = new Float32Array([
                0.0,  0.0,   -0.0,  0.4,    0.4,  0.5,

            ]);

            const paAmarelaVerticesbase = new Float32Array([
                0.0,  0.0,   -0.0,  0.4,   -0.2,  0.2,
            ]);

            function createCircleVertices(centerX, centerY, radius, segments) { let vertices = [centerX, centerY]; for (let i = 0; i <= segments; i++) { let angle = (i / segments) * 2 * Math.PI; let x = centerX + radius * Math.cos(angle); let y = centerY + radius * Math.sin(angle); vertices.push(x, y); } return new Float32Array(vertices); }
            const circleVertices = createCircleVertices(0.0, 0.0, 0.03, 100);

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            function drawScene() {
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.clearColor(0.9, 0.9, 0.95, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.useProgram(program);

                const angulo = Date.now() / 1000;
                const matrizDeRotacao = m3.rotation(angulo);
                const matrizIdentidade = m3.identity();
                
                gl.uniformMatrix3fv(matrixUniformLocation, false, matrizDeRotacao);

                var colors = [Math.random(), Math.random(), Math.random(), Math.random()]

                gl.bufferData(gl.ARRAY_BUFFER, paVermelhaVertices, gl.STATIC_DRAW);
                gl.uniform4f(colorUniformLocation, 1.0, 0.4, 0.4, 1.0);
                gl.drawArrays(gl.TRIANGLES, 0, 3);

                gl.bufferData(gl.ARRAY_BUFFER, paVermelhaVerticesbase, gl.STATIC_DRAW);
                gl.uniform4f(colorUniformLocation, 1.0, 0.3, 0.3, 1.0);
                gl.drawArrays(gl.TRIANGLES, 0, 3);

                gl.bufferData(gl.ARRAY_BUFFER, paVerdeVertices, gl.STATIC_DRAW);
                gl.uniform4f(colorUniformLocation, 0.4, 1.0, 0.4, 1.0);
                gl.drawArrays(gl.TRIANGLES, 0, paVerdeVertices.length / 2);

                gl.bufferData(gl.ARRAY_BUFFER, paVerdeVerticesbase, gl.STATIC_DRAW);
                gl.uniform4f(colorUniformLocation, 0.5, 1.0, 0.5, 1.0);
                gl.drawArrays(gl.TRIANGLES, 0, paVerdeVertices.length / 2);
                
                gl.bufferData(gl.ARRAY_BUFFER, paAzulVertices, gl.STATIC_DRAW);
                gl.uniform4f(colorUniformLocation, 0.4, 0.4, 1.0, 1.0);
                gl.drawArrays(gl.TRIANGLES, 0, 3);

                gl.bufferData(gl.ARRAY_BUFFER, paAzulVerticesbase, gl.STATIC_DRAW);
                gl.uniform4f(colorUniformLocation, 0.3, 0.3, 1.0, 1.0);
                gl.drawArrays(gl.TRIANGLES, 0, 3);

                gl.bufferData(gl.ARRAY_BUFFER, paAmarelaVertices, gl.STATIC_DRAW);
                gl.uniform4f(colorUniformLocation, 1.0, 0.9, 0.4, 1.0);
                gl.drawArrays(gl.TRIANGLES, 0, 3);

                gl.bufferData(gl.ARRAY_BUFFER, paAmarelaVerticesbase, gl.STATIC_DRAW);
                gl.uniform4f(colorUniformLocation, 1.0, 0.7, 0.3, 1.0);
                gl.drawArrays(gl.TRIANGLES, 0, 3);

                gl.bufferData(gl.ARRAY_BUFFER, circleVertices, gl.STATIC_DRAW);
                gl.uniform4f(colorUniformLocation, 0.2, 0.2, 0.2, 1.0);
                gl.uniformMatrix3fv(matrixUniformLocation, false, matrizIdentidade);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 2);
            }

            function animate() {
                drawScene();
                requestAnimationFrame(animate);
            }
            animate();
        };