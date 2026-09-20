// others
import { EFFECT_FULLSCREEN_QUAD } from '../drawBoxLeafNode/constants';

// types
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TEffect, TSceneNode } from 'types/design/types';

// utils
import { getEffectTexture } from 'utils/design/effects/getEffectTexture';
import { getTextureProgram } from './getTextureProgram';
import { getNodeBounds } from 'components/Design/Canvas/utils/getNodeBounds';
import { resetEffectVertexAttributes } from '../drawBoxLeafNode/resetEffectVertexAttributes';

type TTexturePassOptions = { hasUnderlay: boolean; isInputStraight: boolean; shape: TRenderTarget | null };

export const drawTexturePass = (
  renderer: TMaskRenderer,
  node: TSceneNode,
  effect: TEffect,
  content: TRenderTarget,
  output: TRenderTarget,
  { hasUnderlay, isInputStraight, shape }: TTexturePassOptions,
): void => {
  const { context, gl } = renderer;
  const textureProgram = getTextureProgram(gl);

  if (textureProgram) {
    const { program, buffer } = textureProgram;
    const { viewport } = context;
    const texture = getEffectTexture(effect);
    const bounds = getNodeBounds(node);
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const setFloat = (name: string, value: number): void => gl.uniform1f(gl.getUniformLocation(program, name), value);
    const setInt = (name: string, value: number): void => gl.uniform1i(gl.getUniformLocation(program, name), value);

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, EFFECT_FULLSCREEN_QUAD, gl.STATIC_DRAW);
    resetEffectVertexAttributes(gl, positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, content.texture);
    setInt('u_content', 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, (shape ?? content).texture);
    setInt('u_shape', 1);

    gl.uniform2f(gl.getUniformLocation(program, 'u_size'), output.width, output.height);
    gl.uniform2f(gl.getUniformLocation(program, 'u_viewportOffset'), viewport.x, viewport.y);
    gl.uniform2f(gl.getUniformLocation(program, 'u_center'), bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    setFloat('u_zoom', viewport.zoom);
    setFloat('u_pixelRatio', context.canvasWidth > 0 ? gl.drawingBufferWidth / context.canvasWidth : 1);
    setFloat('u_drawingBufferHeight', gl.drawingBufferHeight);
    setFloat('u_rotation', ('rotation' in node ? node.rotation * Math.PI : 0) / 180);
    setFloat('u_cellSize', texture.size);
    setFloat('u_radius', texture.radius);
    setInt('u_clip', shape ? 1 : 0);
    setInt('u_underlay', hasUnderlay ? 1 : 0);
    setInt('u_inputStraight', isInputStraight ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
};
