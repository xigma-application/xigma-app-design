// others
import { BACKGROUND_ALPHA, BACKGROUND_COLOR } from 'constant/canvas';

// utils
import { drawBackground } from '../drawBackground';
import { hexToRgbFloat } from '../hexToRgbFloat';

describe('drawBackground', () => {
  it('should clear the canvas using the background color and alpha', () => {
    // mock
    const clearColor = vi.fn();
    const clear = vi.fn();
    const gl = { COLOR_BUFFER_BIT: 16384, clear, clearColor } as unknown as WebGL2RenderingContext;

    // before
    drawBackground(gl);

    // result
    const [r, g, b] = hexToRgbFloat(BACKGROUND_COLOR);

    expect(clearColor).toHaveBeenCalledWith(r, g, b, BACKGROUND_ALPHA);
    expect(clear).toHaveBeenCalledWith(gl.COLOR_BUFFER_BIT);
  });
});
