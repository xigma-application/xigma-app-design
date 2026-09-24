// types
import { TTrackedGlState } from '../types';

// utils
import { serveTrackedParameters } from '../serveTrackedParameters';

const gl = {
  BLEND_DST_ALPHA: 4,
  BLEND_DST_RGB: 2,
  BLEND_SRC_ALPHA: 3,
  BLEND_SRC_RGB: 1,
  FRAMEBUFFER_BINDING: 5,
  VIEWPORT: 6,
} as unknown as WebGL2RenderingContext;

describe('serveTrackedParameters', () => {
  it('should answer the tracked parameters from the state without asking the driver', () => {
    // mock
    const framebuffer = {} as WebGLFramebuffer;
    const state: TTrackedGlState = { blend: [10, 20, 30, 40], framebuffer, viewport: [1, 2, 3, 4] };
    const getParameter = vi.fn();

    serveTrackedParameters(gl, state, getParameter as unknown as WebGL2RenderingContext['getParameter']);

    // result
    expect(gl.getParameter(5)).toBe(framebuffer);
    expect(Array.from(gl.getParameter(6) as Int32Array)).toEqual([1, 2, 3, 4]);
    expect([1, 2, 3, 4].map((parameter) => gl.getParameter(parameter))).toEqual([10, 20, 30, 40]);
    expect(getParameter).not.toHaveBeenCalled();
  });

  it('should hand out a fresh viewport array on every call', () => {
    // mock
    const state: TTrackedGlState = { blend: [0, 0, 0, 0], framebuffer: null, viewport: [1, 2, 3, 4] };

    serveTrackedParameters(gl, state, vi.fn() as unknown as WebGL2RenderingContext['getParameter']);

    // result
    expect(gl.getParameter(6)).not.toBe(gl.getParameter(6));
  });

  it('should forward every other parameter to the driver', () => {
    // mock
    const state: TTrackedGlState = { blend: [0, 0, 0, 0], framebuffer: null, viewport: [0, 0, 0, 0] };
    const getParameter = vi.fn(() => 4096);

    serveTrackedParameters(gl, state, getParameter as unknown as WebGL2RenderingContext['getParameter']);

    // result
    expect(gl.getParameter(3379)).toBe(4096);
    expect(getParameter).toHaveBeenCalledWith(3379);
  });
});
