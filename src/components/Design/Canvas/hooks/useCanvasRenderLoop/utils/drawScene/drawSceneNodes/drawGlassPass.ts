// others
import { EFFECT_FULLSCREEN_QUAD } from '../drawBoxLeafNode/constants';

// types
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TEffect, TSceneNode } from 'types/design/types';

// utils
import { getEffectGlass } from 'utils/design/effects/getEffectGlass';
import { getGlassProgram } from './getGlassProgram';
import { getNodeBounds } from 'components/Design/Canvas/utils/getNodeBounds';
import { getNodeCornerRadius } from './getNodeCornerRadius';
import { resetEffectVertexAttributes } from '../drawBoxLeafNode/resetEffectVertexAttributes';

export const drawGlassPass = (
  renderer: TMaskRenderer,
  node: TSceneNode,
  effect: TEffect,
  content: TRenderTarget,
  output: TRenderTarget,
): void => {
  const { context, gl } = renderer;
  const glassProgram = getGlassProgram(gl);

  if (glassProgram) {
    const { program, buffer } = glassProgram;
    const { viewport } = context;
    const glass = getEffectGlass(effect);
    const bounds = getNodeBounds(node);
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const setFloat = (name: string, value: number): void => gl.uniform1f(gl.getUniformLocation(program, name), value);

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, EFFECT_FULLSCREEN_QUAD, gl.STATIC_DRAW);
    resetEffectVertexAttributes(gl, positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, content.texture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_content'), 0);

    gl.uniform2f(gl.getUniformLocation(program, 'u_size'), output.width, output.height);
    gl.uniform2f(gl.getUniformLocation(program, 'u_viewportOffset'), viewport.x, viewport.y);
    gl.uniform2f(gl.getUniformLocation(program, 'u_center'), bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    gl.uniform2f(gl.getUniformLocation(program, 'u_halfSize'), bounds.width / 2, bounds.height / 2);
    setFloat('u_cornerRadius', getNodeCornerRadius(node));
    setFloat('u_zoom', viewport.zoom);
    setFloat('u_pixelRatio', context.canvasWidth > 0 ? gl.drawingBufferWidth / context.canvasWidth : 1);
    setFloat('u_drawingBufferHeight', gl.drawingBufferHeight);
    setFloat('u_rotation', ('rotation' in node ? node.rotation * Math.PI : 0) / 180);
    setFloat('u_refraction', glass.refraction / 100);
    setFloat('u_depth', glass.depth / 100);
    setFloat('u_dispersion', glass.dispersion / 100);
    setFloat('u_lightAngle', (glass.lightAngle * Math.PI) / 180);
    setFloat('u_lightIntensity', glass.lightIntensity / 100);
    setFloat('u_splay', glass.splay / 100);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindTexture(gl.TEXTURE_2D, null);
  }
};
