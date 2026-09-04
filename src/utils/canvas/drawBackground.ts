// store
import { selectBackgroundPaint } from 'store/design/selectors';
import { store } from 'store';

// utils
import { hexToRgbFloat } from './hexToRgbFloat';

export const drawBackground = (gl: WebGL2RenderingContext): void => {
  const paint = selectBackgroundPaint(store.getState());
  const [r, g, b] = hexToRgbFloat(paint.color);

  gl.clearColor(r, g, b, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
};
