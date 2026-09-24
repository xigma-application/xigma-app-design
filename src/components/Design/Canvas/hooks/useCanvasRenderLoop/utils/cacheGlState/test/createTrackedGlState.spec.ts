// utils
import { createTrackedGlState } from '../createTrackedGlState';

const gl = {
  BLEND_DST_ALPHA: 4,
  BLEND_DST_RGB: 2,
  BLEND_SRC_ALPHA: 3,
  BLEND_SRC_RGB: 1,
  FRAMEBUFFER_BINDING: 5,
  VIEWPORT: 6,
} as unknown as WebGL2RenderingContext;

describe('createTrackedGlState', () => {
  it('should read the framebuffer, the viewport and the four blend factors once', () => {
    // mock
    const framebuffer = {} as WebGLFramebuffer;
    const getParameter = vi.fn((parameter: number) => {
      const values: Record<number, unknown> = { 1: 770, 2: 771, 3: 1, 4: 771, 5: framebuffer, 6: new Int32Array([1, 2, 300, 200]) };

      return values[parameter];
    });

    // before
    const state = createTrackedGlState(gl, getParameter as unknown as WebGL2RenderingContext['getParameter']);

    // result
    expect(state).toEqual({ blend: [770, 771, 1, 771], framebuffer, viewport: [1, 2, 300, 200] });
    expect(getParameter).toHaveBeenCalledTimes(6);
  });

  it('should copy the viewport so later driver changes cannot alias it', () => {
    // mock
    const source = new Int32Array([0, 0, 10, 10]);
    const getParameter = vi.fn((parameter: number) => (parameter === 6 ? source : 0));

    // before
    const state = createTrackedGlState(gl, getParameter as unknown as WebGL2RenderingContext['getParameter']);

    source[2] = 999;

    // result
    expect(state.viewport).toEqual([0, 0, 10, 10]);
  });
});
