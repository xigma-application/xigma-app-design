// types
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TScissorRect } from './types';

export const copyTargetRectToTexture = (
  gl: WebGL2RenderingContext,
  source: TRenderTarget,
  rect: TScissorRect,
): { framebuffer: WebGLFramebuffer; texture: WebGLTexture } => {
  const texture = gl.createTexture() as WebGLTexture;
  const framebuffer = gl.createFramebuffer() as WebGLFramebuffer;

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rect.width, rect.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source.framebuffer);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer);
  gl.blitFramebuffer(
    rect.x,
    rect.y,
    rect.x + rect.width,
    rect.y + rect.height,
    0,
    0,
    rect.width,
    rect.height,
    gl.COLOR_BUFFER_BIT,
    gl.NEAREST,
  );

  return { framebuffer, texture };
};
