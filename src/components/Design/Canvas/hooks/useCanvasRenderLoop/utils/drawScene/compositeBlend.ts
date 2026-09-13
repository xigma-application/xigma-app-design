// types
import { BlendMode } from 'types/design/enums';
import { TDrawSceneContext } from './types';

// utils
import { getBlendModeShaderIndex } from 'utils/canvas/blendMode/getBlendModeShaderIndex';

const FULLSCREEN_QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

export const compositeBlend = (context: TDrawSceneContext, content: WebGLTexture, backdrop: WebGLTexture, blendMode: BlendMode): void => {
  const { gl, imageContext } = context;
  const program = imageContext.blendCompositeProgram;
  const positionLocation = gl.getAttribLocation(program, 'a_position');

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, imageContext.blendCompositeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_QUAD, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, content);
  gl.uniform1i(gl.getUniformLocation(program, 'u_content'), 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, backdrop);
  gl.uniform1i(gl.getUniformLocation(program, 'u_backdrop'), 1);

  gl.uniform1i(gl.getUniformLocation(program, 'u_blendMode'), getBlendModeShaderIndex(blendMode));

  gl.disable(gl.BLEND);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.enable(gl.BLEND);

  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);
};
