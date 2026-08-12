// utils
import { drawBackground } from './drawBackground';

export const drawSceneBackground = (gl: WebGL2RenderingContext): void => {
  gl.colorMask(true, true, true, true);
  drawBackground(gl);
  gl.colorMask(true, true, true, false);
};
