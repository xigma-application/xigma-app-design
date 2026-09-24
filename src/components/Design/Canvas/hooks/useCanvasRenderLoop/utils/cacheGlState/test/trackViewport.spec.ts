// types
import { TTrackedGlState } from '../types';

// utils
import { trackViewport } from '../trackViewport';

describe('trackViewport', () => {
  it('should record the viewport and still forward it to the driver', () => {
    // mock
    const viewport = vi.fn();
    const gl = { viewport } as unknown as WebGL2RenderingContext;
    const state: TTrackedGlState = { blend: [0, 0, 0, 0], framebuffer: null, viewport: [0, 0, 0, 0] };

    trackViewport(gl, state);

    // before
    gl.viewport(1, 2, 300, 200);

    // result
    expect(viewport).toHaveBeenCalledWith(1, 2, 300, 200);
    expect(state.viewport).toEqual([1, 2, 300, 200]);
  });
});
