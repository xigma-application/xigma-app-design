// types
import { TTrackedGlState } from './types';

export const trackFramebuffer = (gl: WebGL2RenderingContext, state: TTrackedGlState): void => {
  const bindFramebuffer = gl.bindFramebuffer.bind(gl);
  const deleteFramebuffer = gl.deleteFramebuffer.bind(gl);

  gl.bindFramebuffer = (target: number, framebuffer: WebGLFramebuffer | null): void => {
    bindFramebuffer(target, framebuffer);

    if (target === gl.FRAMEBUFFER || target === gl.DRAW_FRAMEBUFFER) {
      state.framebuffer = framebuffer;
    }
  };

  gl.deleteFramebuffer = (framebuffer: WebGLFramebuffer | null): void => {
    deleteFramebuffer(framebuffer);

    if (framebuffer === state.framebuffer) {
      state.framebuffer = null;
    }
  };
};
