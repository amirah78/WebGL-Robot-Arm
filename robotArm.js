// Global variables
var canvas, gl, program;
var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrix, projectionMatrix;

var points = [];
var colors = [];

// Joint indices
const BASE = 0;
const UPPER = 1;
const LOWER = 2;
const GRIPPER = 3;

// Angles (driven by sliders)
var theta = [0, 0, 0, 15]; // start slightly open

// Proportions (tuned)
const BASE_H = 2.8,
  BASE_W = 5.5,
  BASE_D = 3.5;
const ARM_H = 4.2,
  ARM_W = 0.7,
  ARM_D = 0.7;

const GRIP_H = 2.0,
  GRIP_W = 0.35,
  GRIP_D = 0.35; // finger size
const GRIPPER_SPREAD = 0.55; // how far left/right fingers sit
const GRIPPER_V_ANGLE = 25; // base V angle

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL not available");
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.95, 0.95, 0.95, 1.0);
  gl.enable(gl.DEPTH_TEST);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  buildColoredCube();

  // Position buffer
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Color buffer
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

  render();
};

// ---------- Geometry: cube with per-face colors ----------
function buildColoredCube() {
  var v = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
  ];

  function quad(a, b, c, d, col) {
    points.push(v[a], v[b], v[c], v[a], v[c], v[d]);
    colors.push(col, col, col, col, col, col);
  }

  // Slightly different shades per face -> “3D-ish” look
  quad(1, 0, 3, 2, vec4(0.8, 0.8, 0.8, 1.0));
  quad(2, 3, 7, 6, vec4(0.68, 0.68, 0.68, 1.0));
  quad(3, 0, 4, 7, vec4(0.58, 0.58, 0.58, 1.0));
  quad(6, 5, 1, 2, vec4(0.88, 0.88, 0.88, 1.0));
  quad(4, 5, 6, 7, vec4(0.62, 0.62, 0.62, 1.0));
  quad(5, 4, 0, 1, vec4(0.74, 0.74, 0.74, 1.0));
}

// Draw a box centered on its base (like a “pillar”)
// width in X, height in Y, depth in Z
function drawBox(w, h, d) {
  var m = mult(
    modelViewMatrix,
    mult(
      translate(0, h / 2, 0), // lift so bottom sits on joint
      scale(w, h, d)
    )
  );

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(m));
  gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  projectionMatrix = ortho(-10, 10, -8, 8, -10, 10);
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  modelViewMatrix = mat4();

  // Move robot down so it’s not out of frame
  modelViewMatrix = mult(modelViewMatrix, translate(0, -6.5, 0));

  // ---------- BASE ----------
  modelViewMatrix = mult(modelViewMatrix, rotateY(theta[BASE]));
  drawBox(BASE_W, BASE_H, BASE_D);

  // ---------- UPPER ARM ----------
  modelViewMatrix = mult(modelViewMatrix, translate(0, BASE_H, 0));
  modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[UPPER]));
  drawBox(ARM_W, ARM_H, ARM_D);

  // ---------- LOWER ARM ----------
  modelViewMatrix = mult(modelViewMatrix, translate(0, ARM_H, 0));
  modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[LOWER]));
  drawBox(ARM_W, ARM_H, ARM_D);

  // ---------- GRIPPER JOINT ----------
  modelViewMatrix = mult(modelViewMatrix, translate(0, ARM_H, 0));
  var joint = modelViewMatrix;

  // LEFT FINGER
  modelViewMatrix = joint;
  modelViewMatrix = mult(modelViewMatrix, translate(GRIPPER_SPREAD, 0, 0)); // hinge
  modelViewMatrix = mult(
    modelViewMatrix,
    rotateZ(GRIPPER_V_ANGLE + theta[GRIPPER])
  );
  modelViewMatrix = mult(modelViewMatrix, translate(0, GRIP_H / 2, 0));
  drawBox(GRIP_W, GRIP_H, GRIP_D);

  // RIGHT FINGER
  modelViewMatrix = joint;
  modelViewMatrix = mult(modelViewMatrix, translate(-GRIPPER_SPREAD, 0, 0)); // hinge
  modelViewMatrix = mult(
    modelViewMatrix,
    rotateZ(-GRIPPER_V_ANGLE - theta[GRIPPER])
  );
  modelViewMatrix = mult(modelViewMatrix, translate(0, GRIP_H / 2, 0));
  drawBox(GRIP_W, GRIP_H, GRIP_D);

  requestAnimFrame(render);
}
