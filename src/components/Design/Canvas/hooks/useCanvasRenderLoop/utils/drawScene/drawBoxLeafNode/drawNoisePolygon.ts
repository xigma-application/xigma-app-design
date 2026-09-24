// types
import { EffectNoiseType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TEffect } from 'types/design/types';
import { TPoint } from 'types/canvas';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// others
import { NOISE_MAX_COVERAGE } from './constants';

// utils
import { getDevicePixelHeight } from '../getDevicePixelHeight';
import { getDevicePixelWidth } from '../getDevicePixelWidth';
import { getEffectNoise } from 'utils/design/effects/getEffectNoise';
import { hexToRgbFloat } from 'utils/canvas/hexToRgbFloat';
import { resetEffectVertexAttributes } from './resetEffectVertexAttributes';
import { toFanVertices } from 'utils/canvas/toFanVertices';

const bindNoiseMask = (gl: WebGL2RenderingContext, program: WebGLProgram, mask: TRenderTarget | null): void => {
  if (mask) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, mask.texture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_mask'), 0);
    gl.uniform2f(gl.getUniformLocation(program, 'u_maskSize'), mask.width, mask.height);
  }
};

const releaseNoiseMask = (context: TDrawSceneContext, mask: TRenderTarget | null): void => {
  if (mask) {
    context.gl.bindTexture(context.gl.TEXTURE_2D, null);
    context.imageContext.renderTargetPool.release(mask);
  }
};

export const drawNoisePolygon = (
  context: TDrawSceneContext,
  effect: TEffect,
  opacity: number,
  points: TPoint[],
  center: TPoint,
  rotation: number,
  mask: TRenderTarget | null,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, viewport } = context;
  const program = imageContext.noiseProgram;
  const { density, noiseSize, noiseType, secondaryColor, secondaryOpacity } = getEffectNoise(effect);
  const color = hexToRgbFloat(effect.color);
  const secondary = hexToRgbFloat(secondaryColor);
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const setFloat = (name: string, value: number): void => gl.uniform1f(gl.getUniformLocation(program, name), value);
  const location = gl.getUniformLocation(program, 'u_secondaryColor');

  gl.useProgram(program);
  gl.uniform1i(gl.getUniformLocation(program, 'u_useMask'), mask ? 1 : 0);
  bindNoiseMask(gl, program, mask);

  gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvasWidth, canvasHeight);
  gl.uniform2f(gl.getUniformLocation(program, 'u_viewportOffset'), viewport.x, viewport.y);
  gl.uniform4f(gl.getUniformLocation(program, 'u_color'), color[0], color[1], color[2], (effect.opacity / 100) * opacity);
  gl.uniform4f(location, secondary[0], secondary[1], secondary[2], (secondaryOpacity / 100) * opacity);
  gl.uniform1i(gl.getUniformLocation(program, 'u_duo'), noiseType === EffectNoiseType.duo ? 1 : 0);
  gl.uniform1i(gl.getUniformLocation(program, 'u_multi'), noiseType === EffectNoiseType.multi ? 1 : 0);
  gl.uniform2f(gl.getUniformLocation(program, 'u_center'), center.x, center.y);

  setFloat('u_zoom', viewport.zoom);
  setFloat('u_pixelRatio', canvasWidth > 0 ? getDevicePixelWidth(context, gl) / canvasWidth : 1);
  setFloat('u_drawingBufferHeight', getDevicePixelHeight(context, gl));
  setFloat('u_rotation', (rotation * Math.PI) / 180);
  setFloat('u_cellSize', noiseSize);
  setFloat('u_density', (density / 100) * NOISE_MAX_COVERAGE);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(toFanVertices(center, points)), gl.STATIC_DRAW);

  resetEffectVertexAttributes(gl, positionLocation);

  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length + 2);
  releaseNoiseMask(context, mask);
};
