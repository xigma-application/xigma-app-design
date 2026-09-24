// types
import { TTrackedGlState } from './types';

export const createTrackedGlState = (gl: WebGL2RenderingContext, getParameter: WebGL2RenderingContext['getParameter']): TTrackedGlState => {
  const viewport = getParameter(gl.VIEWPORT) as Int32Array;

  return {
    blend: [
      getParameter(gl.BLEND_SRC_RGB) as number,
      getParameter(gl.BLEND_DST_RGB) as number,
      getParameter(gl.BLEND_SRC_ALPHA) as number,
      getParameter(gl.BLEND_DST_ALPHA) as number,
    ],
    framebuffer: getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null,
    viewport: [viewport[0], viewport[1], viewport[2], viewport[3]],
  };
};
