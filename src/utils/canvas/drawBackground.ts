// store
import { selectPaint } from 'store/design/selectors';
import { store } from 'store';

// utils
import { hexToRgbFloat } from './hexToRgbFloat';

export const drawBackground = (gl: WebGL2RenderingContext): void => {
  const paint = selectPaint(store.getState());
  const [r, g, b] = hexToRgbFloat(paint.color);
  const alpha = paint.visible === false ? 0 : paint.opacity / 100;

  gl.clearColor(r, g, b, alpha);
  gl.clear(gl.COLOR_BUFFER_BIT);
};
