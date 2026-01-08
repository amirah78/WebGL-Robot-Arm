// ==================================================
// CUBE VERTEX COUNT & BUFFER START
// ==================================================
export const CUBE_VERTEX_COUNT = 36; // 6 faces × 2 triangles × 3 vertices
export const CUBE_OFFSET = 0;        // cube starts at beginning of buffer

// ==================================================
// GEOMETRY BUILD (SHARED CUBE MESH)
// ==================================================
export function buildCubeObject(points, colors) {
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

  quad(1, 0, 3, 2, vec4(0.8, 0.8, 0.8, 1.0)); // RGBA
  quad(2, 3, 7, 6, vec4(0.68, 0.68, 0.68, 1.0));
  quad(3, 0, 4, 7, vec4(0.58, 0.58, 0.58, 1.0));
  quad(6, 5, 1, 2, vec4(0.88, 0.88, 0.88, 1.0));
  quad(4, 5, 6, 7, vec4(0.62, 0.62, 0.62, 1.0));
  quad(5, 4, 0, 1, vec4(0.74, 0.74, 0.74, 1.0));
}

// ==================================================
// ROBOT DIMENSIONS
// ==================================================
const CubeDims = { w: 2.5, h: 2.5, d: 2.5 };
// ==================================================
// SCENE DESCRIPTION (PURE DATA)
// ==================================================
export function computeCubeDrawList() {
  const draws = [];

  // World → base
  let M = mat4();
  M = mult(M, translate(10, -6.5, 0));

  // ---------------- BASE ----------------
  draws.push(box(M, CubeDims));

  return draws;
}

// ==================================================
// HELPERS
// ==================================================
function box(modelMatrix, dims) {
  return {
    modelMatrix,
    scale: dims,
    offset: CUBE_OFFSET,
    count: CUBE_VERTEX_COUNT,
  };
}

