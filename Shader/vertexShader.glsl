precision mediump float;

// Attributes
attribute vec3 aPos;
attribute vec3 aColor;

// Varying to fragment shader
varying vec3 vColor;

// Uniform matrices
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    vColor = aColor;
}
