// main.js
import { loadText } from "./utils/io.js";
import { createProgramFromSources } from "./utils/shaderUtils.js";
import {
  buildRobotArm,
  computeRobotDrawList,
} from "./Geometry/robotArmGeometry.js";
import { createRenderer } from "./renderer.js";
import { theta } from "./Geometry/robotArmGeometry.js";
import {
  buildCubeObject,
  computeCubeDrawList,
} from "./Geometry/cubeGeometry.js";

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
  const pointsRobotArm = [];
  const colorsRobotArm = [];
  const pointsCubeObject = [];
  const colorsCubeObject = [];

  // robot arm geometry
  buildRobotArm(pointsRobotArm, colorsRobotArm);
  // cube object geometry
  buildCubeObject(pointsCubeObject, colorsCubeObject);

  const points = [];
  const colors = [];

  // Append robot arm
  points.push(...pointsRobotArm);
  colors.push(...colorsRobotArm);

  // Append cube object
  points.push(...pointsCubeObject);
  colors.push(...colorsCubeObject);

  const mesh = {
    position: renderer.createBuffer(points, 4),
    color: renderer.createBuffer(colors, 4),
    vertexCount: points.length,
  };

  // ------------------ CAMERA ------------------
  const projection = ortho(-20, 20, -16, 16, -20, 20);

  // ------------------ VIEW MATRIX ------------------
  let viewMatrix = lookAt(vec3(8, 6, 10), vec3(0, 0, 0), vec3(0, 1, 0));

  // ------------------ CAMERA STATE ------------------
  let camera = {
    radius: 15, // distance from target
    yaw: Math.PI / 4, // left-right
    pitch: Math.PI / 6, // up-down
  };

  const target = vec3(0, 0, 0); // look-at point

  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  const sensitivity = 0.005;

  canvas.addEventListener("mousedown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  canvas.addEventListener("mouseup", () => (dragging = false));
  canvas.addEventListener("mouseleave", () => (dragging = false));

  canvas.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    lastX = e.clientX;
    lastY = e.clientY;

    camera.yaw += dx * sensitivity;
    camera.pitch -= dy * sensitivity; // inverted Y (mouse down = look up)

    // clamp pitch to avoid flipping
    const limit = Math.PI / 2 - 0.01;
    camera.pitch = Math.max(-limit, Math.min(limit, camera.pitch));
  });

  function updateViewMatrix() {
    const x = camera.radius * Math.cos(camera.pitch) * Math.sin(camera.yaw);
    const y = camera.radius * Math.sin(camera.pitch);
    const z = camera.radius * Math.cos(camera.pitch) * Math.cos(camera.yaw);

    return lookAt(
      vec3(x, y, z), // eye
      target, // at
      vec3(0, 1, 0) // up
    );
  }

  // ------------------ FRAME LOOP ------------------
  function frame() {
    viewMatrix = updateViewMatrix();

    // Start frame
    renderer.beginFrame(projection, viewMatrix);

    // Ask geometry what to draw
    const drawList = [...computeRobotDrawList(), ...computeCubeDrawList()];

    // Submit draw commands
    for (const cmd of drawList) {
      renderer.drawBox(mesh, cmd.modelMatrix, cmd.scale, cmd.offset, cmd.count);
    }

    requestAnimationFrame(frame);
  }

  frame();
};
