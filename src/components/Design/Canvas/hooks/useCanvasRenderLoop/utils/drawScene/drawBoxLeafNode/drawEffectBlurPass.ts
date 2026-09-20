// others
import { EFFECT_FULLSCREEN_QUAD } from './constants';

// types
import { TProgressiveBlurUniforms } from './types';

// utils
import { resetEffectVertexAttributes } from './resetEffectVertexAttributes';

export const drawEffectBlurPass = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  texture: WebGLTexture,
  direction: [number, number],
  radius: number,
  sourceWidth: number,
  sourceHeight: number,
  progressive?: TProgressiveBlurUniforms,
  unpremultiply = false,
): void => {
  const positionLocation = gl.getAttribLocation(program, 'a_position');

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, EFFECT_FULLSCREEN_QUAD, gl.STATIC_DRAW);
  resetEffectVertexAttributes(gl, positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
  gl.uniform2f(gl.getUniformLocation(program, 'u_direction'), direction[0], direction[1]);
  gl.uniform1f(gl.getUniformLocation(program, 'u_radius'), radius);
  gl.uniform2f(gl.getUniformLocation(program, 'u_texelSize'), 1 / sourceWidth, 1 / sourceHeight);

  gl.uniform1i(gl.getUniformLocation(program, 'u_progressive'), progressive ? 1 : 0);
  gl.uniform1i(gl.getUniformLocation(program, 'u_unpremultiply'), unpremultiply ? 1 : 0);
  gl.uniform4f(gl.getUniformLocation(program, 'u_line'), ...(progressive?.line ?? [0, 0, 0, 0]));
  gl.uniform2f(gl.getUniformLocation(program, 'u_radii'), ...(progressive?.radii ?? [0, 0]));
  gl.uniform2f(gl.getUniformLocation(program, 'u_size'), sourceWidth, sourceHeight);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  gl.bindTexture(gl.TEXTURE_2D, null);
};
