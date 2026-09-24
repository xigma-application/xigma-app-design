// types
import { TTrackedGlState } from './types';

export const trackViewport = (gl: WebGL2RenderingContext, state: TTrackedGlState): void => {
  const viewport = gl.viewport.bind(gl);

  gl.viewport = (x: number, y: number, width: number, height: number): void => {
    viewport(x, y, width, height);
    state.viewport = [x, y, width, height];
  };
};
