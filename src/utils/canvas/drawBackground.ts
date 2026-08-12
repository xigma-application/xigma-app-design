// others
import { BACKGROUND_ALPHA, BACKGROUND_COLOR } from 'constant/canvas';

// utils
import { hexToRgbFloat } from './hexToRgbFloat';

export const drawBackground = (gl: WebGL2RenderingContext): void => {
  const [r, g, b] = hexToRgbFloat(BACKGROUND_COLOR);

  gl.clearColor(r, g, b, BACKGROUND_ALPHA);
  gl.clear(gl.COLOR_BUFFER_BIT);
};
