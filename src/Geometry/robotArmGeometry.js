// ==================================================
// JOINT INDICES (KINEMATICS)
// ==================================================
export const BASE_JOINT = 0;
export const UPPER_JOINT = 1;
export const LOWER_JOINT = 2;
export const GRIPPER_JOINT = 3;

// Mutable joint angles (driven externally)
export const theta = [0, 0, 0, 0];

// ==================================================
// GEOMETRY BUILD (SHARED CUBE MESH)
// ==================================================
export function buildColoredCube(points, colors) {
  const v = [
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
    for (let i = 0; i < 6; i++) colors.push(col);
  }

  quad(1, 0, 3, 2, vec4(0.8, 0.8, 0.8, 1.0));
  quad(2, 3, 7, 6, vec4(0.68, 0.68, 0.68, 1.0));
  quad(3, 0, 4, 7, vec4(0.58, 0.58, 0.58, 1.0));
  quad(6, 5, 1, 2, vec4(0.88, 0.88, 0.88, 1.0));
  quad(4, 5, 6, 7, vec4(0.62, 0.62, 0.62, 1.0));
  quad(5, 4, 0, 1, vec4(0.74, 0.74, 0.74, 1.0));
}

// ==================================================
// ROBOT DIMENSIONS (PHYSICAL SHAPE)
// ==================================================
const BaseDims = { w: 5.5, h: 2.8, d: 3.5 };
const ArmDims = { w: 0.7, h: 4.2, d: 0.7 };
const GripDims = { w: 0.35, h: 2.0, d: 0.35 };

const GRIPPER_SPREAD = 0.55;
const GRIPPER_V_ANGLE = 25;

// ==================================================
// SCENE DESCRIPTION (PURE DATA, NO WEBGL)
// ==================================================
export function computeRobotDrawList() {
  const draws = [];

  let M = mat4();
  M = mult(M, translate(0, -6.5, 0));

  // ---------- BASE ----------
  M = mult(M, rotateY(theta[BASE_JOINT]));
  draws.push(box(M, BaseDims));

  // ---------- UPPER ARM ----------
  M = mult(M, translate(0, BaseDims.h, 0));
  M = mult(M, rotateZ(theta[UPPER_JOINT]));
  draws.push(box(M, ArmDims));

  // ---------- LOWER ARM ----------
  M = mult(M, translate(0, ArmDims.h, 0));
  M = mult(M, rotateZ(theta[LOWER_JOINT]));
  draws.push(box(M, ArmDims));

  // ---------- GRIPPER JOINT ----------
  M = mult(M, translate(0, ArmDims.h, 0));
  const joint = M;

  // LEFT FINGER
  let L = mult(joint, translate(GRIPPER_SPREAD, 0, 0));
  L = mult(L, rotateZ(GRIPPER_V_ANGLE + theta[GRIPPER_JOINT]));
  L = mult(L, translate(0, GripDims.h / 2, 0));
  draws.push(box(L, GripDims));

  // RIGHT FINGER
  let R = mult(joint, translate(-GRIPPER_SPREAD, 0, 0));
  R = mult(R, rotateZ(-GRIPPER_V_ANGLE - theta[GRIPPER_JOINT]));
  R = mult(R, translate(0, GripDims.h / 2, 0));
  draws.push(box(R, GripDims));

  return draws;
}

// ==================================================
// HELPERS
// ==================================================
function box(modelMatrix, dims) {
  return {
    modelMatrix,
    scale: dims,
  };
}
