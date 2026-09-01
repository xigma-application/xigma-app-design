// types
import { TDrawSceneContext } from './types';

const FULLSCREEN_QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

export const compositeMask = (context: TDrawSceneContext, content: WebGLTexture, mask: WebGLTexture): void => {
  const { gl, imageContext } = context;
  const program = imageContext.maskCompositeProgram;
  const positionLocation = gl.getAttribLocation(program, 'a_position');

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, imageContext.maskCompositeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_QUAD, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, content);
  gl.uniform1i(gl.getUniformLocation(program, 'u_content'), 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, mask);
  gl.uniform1i(gl.getUniformLocation(program, 'u_mask'), 1);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);
};
