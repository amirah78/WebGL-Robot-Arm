attribute vec4 vPosition;
attribute vec4 vColor;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec4 fColor;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vPosition;
    fColor = vColor;
}