export function createRenderer(gl, program) {
  // ------------------ ATTRIBUTES ------------------
  const attribs = {
    position: gl.getAttribLocation(program, "vPosition"),
    color: gl.getAttribLocation(program, "vColor"),
  };

  // ------------------ UNIFORMS ------------------
  const uniforms = {
    modelViewMatrix: gl.getUniformLocation(program, "modelViewMatrix"),
    projectionMatrix: gl.getUniformLocation(program, "projectionMatrix"),
  };

  // ------------------ INTERNAL STATE ------------------
  let viewMatrix = mat4(); // camera

  // ------------------ BUFFER HELPERS ------------------
  function createBuffer(data, size) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);

    return { buffer, size };
  }

  function bindAttribute(bufferObj, attribLoc) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferObj.buffer);
    gl.vertexAttribPointer(attribLoc, bufferObj.size, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribLoc);
  }

  // ------------------ FRAME SETUP ------------------
  function beginFrame(projectionMatrix, newViewMatrix) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // store view matrix once per frame
    viewMatrix = newViewMatrix;

    gl.uniformMatrix4fv(
      uniforms.projectionMatrix,
      false,
      flatten(projectionMatrix)
    );
  }

  // ------------------ DRAW CALL ------------------
  function drawBox(mesh, modelMatrix, scale, offset, count) {
    // modelMatrix * scale * translate-to-base
    let M = mult(
      modelMatrix,
      mult(translate(0, scale.h / 2, 0), scaleMatrix(scale))
    );

    const MV = mult(viewMatrix, M);

    gl.uniformMatrix4fv(uniforms.modelViewMatrix, false, flatten(MV));

    bindAttribute(mesh.position, attribs.position);
    bindAttribute(mesh.color, attribs.color);

    gl.drawArrays(gl.TRIANGLES, offset, count);
  }

  // ------------------ PUBLIC API ------------------
  return {
    createBuffer,
    beginFrame,
    drawBox,
  };
}

// ------------------ HELPERS ------------------
function scaleMatrix({ w, h, d }) {
  return scale(w, h, d);
}
