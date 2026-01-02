// main.js
import { loadText } from "./utils/io.js";
import { createProgramFromSources } from "./utils/shaderUtils.js";
import {
  buildColoredCube,
  computeRobotDrawList,
} from "./Geometry/robotArmGeometry.js";
import { createRenderer } from "./renderer.js";
import { theta } from "./Geometry/robotArmGeometry.js";

function wireSliders() {
  document.getElementById("base").oninput = (e) =>
    (theta[0] = Number(e.target.value));

  document.getElementById("upper").oninput = (e) =>
    (theta[1] = Number(e.target.value));

  document.getElementById("lower").oninput = (e) =>
    (theta[2] = Number(e.target.value));

  document.getElementById("gripper").oninput = (e) =>
    (theta[3] = Number(e.target.value));
}

window.onload = async function () {
  wireSliders();
  // ------------------ CANVAS + GL ------------------
  const canvas = document.getElementById("gl-canvas");
  const gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert("WebGL not available");
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.95, 0.95, 0.95, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // ------------------ SHADERS ------------------
  const vsSource = await loadText("src/Shader/vertexShader.glsl");
  const fsSource = await loadText("src/Shader/fragmentShader.glsl");

  const program = createProgramFromSources(gl, vsSource, fsSource);
  gl.useProgram(program);

  // ------------------ RENDERER ------------------
  const renderer = createRenderer(gl, program);

  // ------------------ GEOMETRY ------------------
  const points = [];
  const colors = [];
  buildColoredCube(points, colors);

  const mesh = {
    position: renderer.createBuffer(points, 4),
    color: renderer.createBuffer(colors, 4),
    vertexCount: points.length,
  };

  // ------------------ CAMERA ------------------
  const projection = ortho(-10, 10, -8, 8, -10, 10);

  // ------------------ FRAME LOOP ------------------
  function frame() {
    // Start frame
    renderer.beginFrame(projection);

    // Ask geometry what to draw
    const drawList = computeRobotDrawList();

    // Submit draw commands
    for (const cmd of drawList) {
      renderer.drawBox(mesh, cmd.modelMatrix, cmd.scale);
    }

    requestAnimationFrame(frame);
  }

  frame();
};
