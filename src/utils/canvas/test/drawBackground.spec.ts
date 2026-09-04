// store
import { DEFAULT_PAINT } from 'store/design/constants';
import { setPaint } from 'store/design/slice';
import { store } from 'store';

// utils
import { drawBackground } from '../drawBackground';
import { hexToRgbFloat } from '../hexToRgbFloat';

const createGlMock = (): WebGL2RenderingContext =>
  ({ COLOR_BUFFER_BIT: 16384, clear: vi.fn(), clearColor: vi.fn() }) as unknown as WebGL2RenderingContext;

describe('drawBackground', () => {
  beforeEach(() => {
    store.dispatch(setPaint(DEFAULT_PAINT));
  });

  it('should clear the canvas to the page paint color at its opacity', () => {
    // mock
    const gl = createGlMock();
    store.dispatch(setPaint({ color: '#336699', opacity: 50, type: 'solid' }));

    // before
    drawBackground(gl);

    // result
    const [r, g, b] = hexToRgbFloat('#336699');

    expect(gl.clearColor).toHaveBeenCalledWith(r, g, b, 0.5);
    expect(gl.clear).toHaveBeenCalledWith(gl.COLOR_BUFFER_BIT);
  });

  it('should clear to a fully transparent background when the page paint is hidden', () => {
    // mock
    const gl = createGlMock();
    store.dispatch(setPaint({ color: '#336699', opacity: 100, type: 'solid', visible: false }));

    // before
    drawBackground(gl);

    // result
    expect(gl.clearColor).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), expect.any(Number), 0);
  });

  it('should treat an explicitly visible paint as opaque as its opacity', () => {
    // mock
    const gl = createGlMock();
    store.dispatch(setPaint({ color: '#000000', opacity: 100, type: 'solid', visible: true }));

    // before
    drawBackground(gl);

    // result
    expect(gl.clearColor).toHaveBeenCalledWith(0, 0, 0, 1);
  });
});
