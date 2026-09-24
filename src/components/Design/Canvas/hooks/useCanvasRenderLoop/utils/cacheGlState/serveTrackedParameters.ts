// types
import { TTrackedGlState } from './types';

export const serveTrackedParameters = (
  gl: WebGL2RenderingContext,
  state: TTrackedGlState,
  getParameter: WebGL2RenderingContext['getParameter'],
): void => {
  gl.getParameter = (parameter: number): unknown => {
    switch (parameter) {
      case gl.FRAMEBUFFER_BINDING:
        return state.framebuffer;
      case gl.VIEWPORT:
        return new Int32Array(state.viewport);
      case gl.BLEND_SRC_RGB:
        return state.blend[0];
      case gl.BLEND_DST_RGB:
        return state.blend[1];
      case gl.BLEND_SRC_ALPHA:
        return state.blend[2];
      case gl.BLEND_DST_ALPHA:
        return state.blend[3];
      default:
        return getParameter(parameter);
    }
  };
};
