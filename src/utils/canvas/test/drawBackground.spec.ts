// store
import { DEFAULT_PAINT } from 'store/design/constants';
import { setBackgroundPaint } from 'store/design/slice';
import { store } from 'store';

// utils
import { drawBackground } from '../drawBackground';
import { hexToRgbFloat } from '../hexToRgbFloat';

const createGlMock = (): WebGL2RenderingContext =>
  ({ COLOR_BUFFER_BIT: 16384, clear: vi.fn(), clearColor: vi.fn() }) as unknown as WebGL2RenderingContext;

describe('drawBackground', () => {
  beforeEach(() => {
    store.dispatch(setBackgroundPaint(DEFAULT_PAINT));
  });

  it('should clear the canvas to the paint color, always at full alpha', () => {
    // mock
    const gl = createGlMock();
    const paint = { color: '#336699', opacity: 100, type: 'solid' } as const;

    store.dispatch(setBackgroundPaint(paint));

    // before
    drawBackground(gl);

    // result — the WebGL canvas itself must never go anywhere but fully opaque: a lower alpha here
    // clears the canvas element's own alpha channel, which (colorMask disables further alpha writes
    // for the rest of the frame, see drawSceneBackground.ts) makes the whole canvas DOM-transparent
    // for the entire frame, not just fade the background fill within the scene. Visibility and partial
    // opacity are handled upstream by drawSceneBackground, which routes those cases to the checkerboard
    // pattern instead of ever calling this function — drawBackground only ever runs at full opacity.
    const [r, g, b] = hexToRgbFloat(paint.color);

    expect(gl.clearColor).toHaveBeenCalledWith(r, g, b, 1);
    expect(gl.clear).toHaveBeenCalledWith(gl.COLOR_BUFFER_BIT);
  });

  it('should clear to the plain paint color at full opacity', () => {
    // mock
    const gl = createGlMock();

    store.dispatch(setBackgroundPaint({ color: '#000000', opacity: 100, type: 'solid', visible: true }));

    // before
    drawBackground(gl);

    // result
    expect(gl.clearColor).toHaveBeenCalledWith(0, 0, 0, 1);
  });
});
