const canvas = document.querySelector('canvas');
const button = document.querySelector('button');
const status = document.querySelector('#status');
const gl = canvas.getContext('webgl2', { alpha: false, antialias: false });
const pointer = [0.24, 0.60];
let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
let elapsed = 0;
let previous = null;
let frame = 0;
let uniforms;

async function loadShader(type, path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(path + ' HTTP ' + response.status);
  const shader = gl.createShader(type);
  gl.shaderSource(shader, await response.text());
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function redraw() {
  if (!frame && uniforms && !document.hidden) frame = requestAnimationFrame(draw);
}

function draw(now) {
  frame = 0;
  const scale = Math.min(devicePixelRatio, 2);
  const width = Math.max(1, Math.round(canvas.clientWidth * scale));
  const height = Math.max(1, Math.round(canvas.clientHeight * scale));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  if (playing && previous !== null) elapsed += (now - previous) / 1000;
  previous = playing ? now : null;
  gl.viewport(0, 0, width, height);
  gl.uniform2f(uniforms.resolution, width, height);
  gl.uniform2fv(uniforms.pointer, pointer);
  gl.uniform1f(uniforms.time, elapsed);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  if (playing) redraw();
}

function updateButton() {
  button.textContent = playing ? '暂停动画' : '继续动画';
}

function moveSource(event) {
  const bounds = canvas.getBoundingClientRect();
  pointer[0] = (event.clientX - bounds.left) / bounds.width;
  pointer[1] = 1 - (event.clientY - bounds.top) / bounds.height;
  redraw();
}

button.addEventListener('click', () => {
  playing = !playing;
  previous = null;
  updateButton();
  redraw();
});
canvas.addEventListener('pointermove', moveSource);
canvas.addEventListener('pointerdown', moveSource);
window.addEventListener('resize', redraw);
document.addEventListener('visibilitychange', () => {
  cancelAnimationFrame(frame);
  frame = 0;
  previous = null;
  redraw();
});

async function start() {
  try {
    if (!gl) throw new Error('请使用支持 WebGL2 的浏览器，并启用图形加速。');
    const shaders = await Promise.all([
      loadShader(gl.VERTEX_SHADER, './shaders/fullscreen.vert'),
      loadShader(gl.FRAGMENT_SHADER, './shaders/tides.frag'),
    ]);
    const program = gl.createProgram();
    for (const shader of shaders) gl.attachShader(program, shader);
    gl.linkProgram(program);
    for (const shader of shaders) gl.deleteShader(shader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);
    uniforms = {
      resolution: gl.getUniformLocation(program, 'uResolution'),
      pointer: gl.getUniformLocation(program, 'uPointer'),
      time: gl.getUniformLocation(program, 'uTime'),
    };
    status.hidden = true;
    button.disabled = false;
    updateButton();
    redraw();
  } catch (error) {
    status.textContent = '渲染未能启动。' + error.message;
    status.hidden = false;
  }
}

canvas.addEventListener('webglcontextlost', event => {
  event.preventDefault();
  uniforms = null;
  cancelAnimationFrame(frame);
  frame = 0;
  previous = null;
  button.disabled = true;
  status.textContent = '图形上下文丢失，等待浏览器恢复。';
  status.hidden = false;
});
canvas.addEventListener('webglcontextrestored', start);
start();
