// types
import { TScissorRect } from './types';

export const setScissorRect = (gl: WebGL2RenderingContext, rect: TScissorRect | null): void => {
  if (rect) {
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(rect.x, rect.y, rect.width, rect.height);
  } else {
    gl.disable(gl.SCISSOR_TEST);
  }
};
