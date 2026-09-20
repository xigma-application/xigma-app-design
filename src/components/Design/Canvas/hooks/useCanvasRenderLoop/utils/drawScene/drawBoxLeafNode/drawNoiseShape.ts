// types
import { EffectNoiseType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TEffect, TFrameNode, TRectangleNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// others
import { NOISE_MAX_COVERAGE } from './constants';

// utils
import { getEffectNoise } from 'utils/design/effects/getEffectNoise';
import { getNoiseShapePoints } from './getNoiseShapePoints';
import { hexToRgbFloat } from 'utils/canvas/hexToRgbFloat';
import { resetEffectVertexAttributes } from './resetEffectVertexAttributes';
import { toFanVertices } from 'utils/canvas/toFanVertices';

export const drawNoiseShape = (context: TDrawSceneContext, node: TFrameNode | TRectangleNode, effect: TEffect, opacity: number): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, viewport } = context;
  const program = imageContext.noiseProgram;
  const { density, noiseSize, noiseType, secondaryColor, secondaryOpacity } = getEffectNoise(effect);
  const color = hexToRgbFloat(effect.color);
  const secondary = hexToRgbFloat(secondaryColor);
  const points = getNoiseShapePoints(node);
  const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const setFloat = (name: string, value: number): void => gl.uniform1f(gl.getUniformLocation(program, name), value);

  gl.useProgram(program);
  gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvasWidth, canvasHeight);
  gl.uniform2f(gl.getUniformLocation(program, 'u_viewportOffset'), viewport.x, viewport.y);
  gl.uniform4f(gl.getUniformLocation(program, 'u_color'), color[0], color[1], color[2], (effect.opacity / 100) * opacity);
  gl.uniform4f(
    gl.getUniformLocation(program, 'u_secondaryColor'),
    secondary[0],
    secondary[1],
    secondary[2],
    (secondaryOpacity / 100) * opacity,
  );
  gl.uniform1i(gl.getUniformLocation(program, 'u_duo'), noiseType === EffectNoiseType.duo ? 1 : 0);
  gl.uniform2f(gl.getUniformLocation(program, 'u_center'), center.x, center.y);
  setFloat('u_zoom', viewport.zoom);
  setFloat('u_pixelRatio', canvasWidth > 0 ? gl.drawingBufferWidth / canvasWidth : 1);
  setFloat('u_drawingBufferHeight', gl.drawingBufferHeight);
  setFloat('u_rotation', (node.rotation * Math.PI) / 180);
  setFloat('u_cellSize', noiseSize);
  setFloat('u_density', (density / 100) * NOISE_MAX_COVERAGE);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(toFanVertices(center, points)), gl.STATIC_DRAW);
  resetEffectVertexAttributes(gl, positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length + 2);
};
