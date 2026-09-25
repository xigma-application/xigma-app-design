// types
import { TFillRule } from 'types/canvas';

export const setStencilFillOp = (gl: WebGL2RenderingContext, fillRule: TFillRule): void => {
  if (fillRule === 'nonZero') {
    gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.KEEP, gl.INCR_WRAP);
    gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.KEEP, gl.DECR_WRAP);
  } else {
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
  }
};
