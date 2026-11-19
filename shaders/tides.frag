#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uTime;
out vec4 fragColor;

void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
    vec2 source = (uPointer - 0.5) * uResolution / uResolution.y;
    float t = uTime * 0.30;
    p.y += 0.14 * sin(3.3 * p.x + t);
    float a = length(p - source);
    float b = length(p - vec2(-0.36, 0.19));
    float field = 0.76 * sin(3.6 * a - t) + 0.49 * cos(4.7 * b + t);
    float bands = field * 24.0 + p.x * 3.0;
    float edge = abs(fract(bands + 0.5) - 0.5);
    float width = max(fwidth(bands), 0.004);
    float contour = 1.0 - smoothstep(0.025, 0.025 + width, edge);
    vec3 ink = mix(vec3(0.013, 0.060, 0.087), vec3(0.025, 0.20, 0.22),
                   smoothstep(-1.15, 1.1, field));
    float mineral = smoothstep(-0.65, 0.7, sin(2.5 * p.x - 2.2 * p.y + field));
    vec3 line = mix(vec3(0.30, 0.84, 0.80), vec3(0.98, 0.72, 0.39), mineral);
    float glow = 0.14 * exp(-7.0 * edge);
    fragColor = vec4(mix(ink, line, 0.84 * contour + glow), 1.0);
}
