// utils
import { isBlurZoomChanging } from '../isBlurZoomChanging';

describe('isBlurZoomChanging', () => {
  it('should report a change on a new zoom, keep reporting it until the zoom has been stable for the settle time, then stop', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;

    // result
    expect(isBlurZoomChanging(gl, 1, 1000)).toBe(true);
    expect(isBlurZoomChanging(gl, 1, 1100)).toBe(true);
    expect(isBlurZoomChanging(gl, 1, 1300)).toBe(false);
    expect(isBlurZoomChanging(gl, 2, 1400)).toBe(true);
  });
});
